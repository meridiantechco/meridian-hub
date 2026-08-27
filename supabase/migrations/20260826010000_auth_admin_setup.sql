-- ==============================================================================
-- MIGRATION DE SEGURANÇA E AUTENTICAÇÃO RBAC - MERIDIAN HUB
-- Arquivo: 20260826010000_auth_admin_setup.sql
-- ==============================================================================

-- 1. ENUM E TABELAS BASE DE AUTENTICAÇÃO E PERFIS
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'vendedor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'vendedor',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. FUNÇÃO SEGURA PARA CHECAGEM DE PAPEL COM OVERRIDE DO SUPER ADMIN
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email TEXT;
BEGIN
  IF _user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Obter e-mail do usuário no schema auth
  SELECT lower(email) INTO _email FROM auth.users WHERE id = _user_id;

  -- O usuário com o e-mail 'meridiantech.co@gmail.com' possui privilégio supremo de admin
  IF _email = 'meridiantech.co@gmail.com' AND _role = 'admin' THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;

-- 3. TRIGGER PARA AUTOMATIZAÇÃO DE PERFIL E ATRIBUIÇÃO DE ROLE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _is_super_admin BOOLEAN := FALSE;
  _role_to_assign public.app_role;
BEGIN
  IF lower(NEW.email) = 'meridiantech.co@gmail.com' THEN
    _is_super_admin := TRUE;
  END IF;

  -- Criar ou atualizar perfil do usuário
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET 
    nome = EXCLUDED.nome, 
    email = EXCLUDED.email,
    atualizado_em = now();

  -- Atribuir role
  IF _is_super_admin THEN
    _role_to_assign := 'admin'::public.app_role;
  ELSIF (SELECT count(*) FROM public.user_roles) = 0 THEN
    _role_to_assign := 'admin'::public.app_role;
  ELSE
    _role_to_assign := COALESCE((NEW.raw_user_meta_data->>'papel')::public.app_role, 'vendedor'::public.app_role);
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role_to_assign)
  ON CONFLICT (user_id, role) DO UPDATE SET role = EXCLUDED.role;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. TRIGGER DE PROTEÇÃO CONTRA REMOÇÃO OU REBAIXAMENTO DO SUPER ADMIN
CREATE OR REPLACE FUNCTION public.protect_super_admin()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  _target_email TEXT;
BEGIN
  SELECT lower(email) INTO _target_email 
  FROM auth.users 
  WHERE id = COALESCE(OLD.user_id, OLD.id);

  IF _target_email = 'meridiantech.co@gmail.com' THEN
    IF TG_OP = 'DELETE' THEN
      RAISE EXCEPTION 'Acesso Negado: O Administrador Supremo (meridiantech.co@gmail.com) não pode ser removido do sistema.';
    ELSIF TG_OP = 'UPDATE' AND NEW.role <> 'admin' THEN
      RAISE EXCEPTION 'Acesso Negado: O papel de Administrador de meridiantech.co@gmail.com não pode ser rebaixado.';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_super_admin_roles ON public.user_roles;
CREATE TRIGGER trg_protect_super_admin_roles
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_super_admin();

-- 5. POLÍTICAS DE RLS: PROFILES
DROP POLICY IF EXISTS "profiles_select_all_auth" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_all_auth" ON public.profiles FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
CREATE POLICY "profiles_insert_admin" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR id = auth.uid());

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. POLÍTICAS DE RLS: USER_ROLES
DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "user_roles_admin_write" ON public.user_roles;
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. POLÍTICAS DE RLS: LEADS (SEGREGAÇÃO DE DADOS POR VENDEDOR VS ADMIN)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_select" ON public.leads;
DROP POLICY IF EXISTS "leads_select_authenticated" ON public.leads;
CREATE POLICY "leads_select" ON public.leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR responsavel_id = auth.uid() OR responsavel_id IS NULL);

DROP POLICY IF EXISTS "leads_insert" ON public.leads;
CREATE POLICY "leads_insert" ON public.leads FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR responsavel_id = auth.uid() OR responsavel_id IS NULL);

DROP POLICY IF EXISTS "leads_update" ON public.leads;
CREATE POLICY "leads_update" ON public.leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR responsavel_id = auth.uid() OR responsavel_id IS NULL)
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR responsavel_id = auth.uid() OR responsavel_id IS NULL);

DROP POLICY IF EXISTS "leads_delete" ON public.leads;
CREATE POLICY "leads_delete" ON public.leads FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 8. POLÍTICAS DE RLS: BUSCAS (HISTÓRICO ISOLADO POR USUÁRIO)
ALTER TABLE public.buscas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "buscas_select" ON public.buscas;
CREATE POLICY "buscas_select" ON public.buscas FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR executada_por = auth.uid());

DROP POLICY IF EXISTS "buscas_insert" ON public.buscas;
CREATE POLICY "buscas_insert" ON public.buscas FOR INSERT TO authenticated
  WITH CHECK (executada_por = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "buscas_admin_manage" ON public.buscas;
CREATE POLICY "buscas_admin_manage" ON public.buscas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. POLÍTICAS DE RLS: INTERAÇÕES
ALTER TABLE public.interacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interacoes_select" ON public.interacoes;
CREATE POLICY "interacoes_select" ON public.interacoes FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.leads l 
      WHERE l.id = lead_id AND (l.responsavel_id = auth.uid() OR l.responsavel_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "interacoes_insert" ON public.interacoes;
CREATE POLICY "interacoes_insert" ON public.interacoes FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "interacoes_update_own" ON public.interacoes;
CREATE POLICY "interacoes_update_own" ON public.interacoes FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "interacoes_delete_admin" ON public.interacoes;
CREATE POLICY "interacoes_delete_admin" ON public.interacoes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR usuario_id = auth.uid());

-- 10. POLÍTICAS DE RLS: AUDITORIA DE ATIVIDADES (APPEND-ONLY)
ALTER TABLE public.auditoria_atividades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auditoria_select" ON public.auditoria_atividades;
CREATE POLICY "auditoria_select" ON public.auditoria_atividades FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR usuario_id = auth.uid());

DROP POLICY IF EXISTS "auditoria_insert" ON public.auditoria_atividades;
CREATE POLICY "auditoria_insert" ON public.auditoria_atividades FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR usuario_id IS NULL);

-- 11. RPC SEGURA `buscar_leads_bounds`
CREATE OR REPLACE FUNCTION public.buscar_leads_bounds(
  sw_lat DOUBLE PRECISION,
  sw_lng DOUBLE PRECISION,
  ne_lat DOUBLE PRECISION,
  ne_lng DOUBLE PRECISION,
  filtro_categoria TEXT DEFAULT NULL,
  filtro_status TEXT DEFAULT NULL,
  filtro_apenas_sem_site BOOLEAN DEFAULT NULL,
  filtro_score_minimo INTEGER DEFAULT NULL,
  filtro_termo TEXT DEFAULT NULL,
  limite INTEGER DEFAULT 200
)
RETURNS SETOF public.leads
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.leads
  WHERE latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND latitude >= sw_lat
    AND latitude <= ne_lat
    AND longitude >= sw_lng
    AND longitude <= ne_lng
    AND (
      public.has_role(auth.uid(), 'admin')
      OR responsavel_id = auth.uid()
      OR responsavel_id IS NULL
    )
    AND (
      filtro_categoria IS NULL
      OR filtro_categoria = 'todas'
      OR categoria ILIKE filtro_categoria
    )
    AND (
      filtro_status IS NULL
      OR filtro_status = 'todos'
      OR status::text = filtro_status
    )
    AND (
      filtro_apenas_sem_site IS NULL
      OR tem_site = NOT filtro_apenas_sem_site
    )
    AND (
      filtro_score_minimo IS NULL
      OR score >= filtro_score_minimo
    )
    AND (
      filtro_termo IS NULL
      OR filtro_termo = ''
      OR nome ILIKE '%' || filtro_termo || '%'
      OR categoria ILIKE '%' || filtro_termo || '%'
      OR COALESCE(bairro, '') ILIKE '%' || filtro_termo || '%'
      OR COALESCE(cidade, '') ILIKE '%' || filtro_termo || '%'
    )
  ORDER BY score DESC, criado_em DESC
  LIMIT COALESCE(limite, 200);
$$;

REVOKE EXECUTE ON FUNCTION public.buscar_leads_bounds FROM anon;
GRANT EXECUTE ON FUNCTION public.buscar_leads_bounds TO authenticated;
GRANT EXECUTE ON FUNCTION public.buscar_leads_bounds TO service_role;

-- 12. GARANTIR ADMIN PARA meridiantech.co@gmail.com CASO O USUÁRIO JÁ EXISTA
DO $$
DECLARE
  _admin_uid UUID;
BEGIN
  SELECT id INTO _admin_uid FROM auth.users WHERE lower(email) = 'meridiantech.co@gmail.com';
  IF _admin_uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_admin_uid, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin'::public.app_role;
    
    INSERT INTO public.profiles (id, nome, email)
    VALUES (_admin_uid, 'Meridian Tech Admin', 'meridiantech.co@gmail.com')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
