-- ==============================================================================
-- MIGRATION: ISOLAMENTO TOTAL POR OPERADOR E ADMINISTRADOR UNIVERSAL
-- Arquivo: 20260908183000_isolamento_total_admin.sql
-- ==============================================================================

-- 1. ATUALIZAR TODOS OS USUÁRIOS EXISTENTES PARA PAPEL 'admin'
UPDATE public.user_roles
SET role = 'admin'::public.app_role
WHERE role <> 'admin';

-- 2. AJUSTAR TRIGGER PARA QUE TODOS OS NOVOS USUÁRIOS SEJAM 'admin'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
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

  -- Atribuir role 'admin' diretamente para todos os novos usuários
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin'::public.app_role;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. PERMITIR MINERAÇÃO ISOLADA POR OPERADOR (AJUSTE DE CONSTRAINT place_id)
-- Remove restrição de unicidade global de place_id para permitir que operadores
-- minerem os mesmos locais independentemente em seus próprios workspaces.
DO $$
DECLARE
  _constraint_name TEXT;
BEGIN
  SELECT conname INTO _constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.leads'::regclass AND contype = 'u'
    AND pg_get_constraintdef(oid) LIKE '%(place_id)%';

  IF _constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.leads DROP CONSTRAINT ' || quote_ident(_constraint_name);
  END IF;
END $$;

-- Cria índice composto exclusivo por operador (place_id + responsavel_id)
CREATE UNIQUE INDEX IF NOT EXISTS leads_place_id_responsavel_uidx 
ON public.leads (place_id, responsavel_id) 
WHERE place_id IS NOT NULL AND responsavel_id IS NOT NULL;

-- 4. RLS LEADS: ISOLAMENTO TOTAL POR OPERADOR (auth.uid())
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_select" ON public.leads;
DROP POLICY IF EXISTS "leads_select_authenticated" ON public.leads;
DROP POLICY IF EXISTS "leads_select_own" ON public.leads;
CREATE POLICY "leads_select_own" ON public.leads FOR SELECT TO authenticated
  USING (responsavel_id = auth.uid());

DROP POLICY IF EXISTS "leads_insert" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_own" ON public.leads;
CREATE POLICY "leads_insert_own" ON public.leads FOR INSERT TO authenticated
  WITH CHECK (responsavel_id = auth.uid());

DROP POLICY IF EXISTS "leads_update" ON public.leads;
DROP POLICY IF EXISTS "leads_update_own" ON public.leads;
CREATE POLICY "leads_update_own" ON public.leads FOR UPDATE TO authenticated
  USING (responsavel_id = auth.uid())
  WITH CHECK (responsavel_id = auth.uid());

DROP POLICY IF EXISTS "leads_delete" ON public.leads;
DROP POLICY IF EXISTS "leads_delete_own" ON public.leads;
CREATE POLICY "leads_delete_own" ON public.leads FOR DELETE TO authenticated
  USING (responsavel_id = auth.uid());

-- 5. RLS BUSCAS: ISOLAMENTO POR EXECUTADA_POR
ALTER TABLE public.buscas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "buscas_select" ON public.buscas;
DROP POLICY IF EXISTS "buscas_select_own" ON public.buscas;
CREATE POLICY "buscas_select_own" ON public.buscas FOR SELECT TO authenticated
  USING (executada_por = auth.uid());

DROP POLICY IF EXISTS "buscas_insert" ON public.buscas;
DROP POLICY IF EXISTS "buscas_insert_own" ON public.buscas;
CREATE POLICY "buscas_insert_own" ON public.buscas FOR INSERT TO authenticated
  WITH CHECK (executada_por = auth.uid());

DROP POLICY IF EXISTS "buscas_admin_manage" ON public.buscas;
DROP POLICY IF EXISTS "buscas_manage_own" ON public.buscas;
CREATE POLICY "buscas_manage_own" ON public.buscas FOR ALL TO authenticated
  USING (executada_por = auth.uid())
  WITH CHECK (executada_por = auth.uid());

-- 6. RLS INTERACOES: ISOLAMENTO POR USUARIO_ID
ALTER TABLE public.interacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interacoes_select" ON public.interacoes;
DROP POLICY IF EXISTS "interacoes_select_own" ON public.interacoes;
CREATE POLICY "interacoes_select_own" ON public.interacoes FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "interacoes_insert" ON public.interacoes;
DROP POLICY IF EXISTS "interacoes_insert_own" ON public.interacoes;
CREATE POLICY "interacoes_insert_own" ON public.interacoes FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "interacoes_update_own" ON public.interacoes;
CREATE POLICY "interacoes_update_own" ON public.interacoes FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "interacoes_delete_admin" ON public.interacoes;
DROP POLICY IF EXISTS "interacoes_delete_own" ON public.interacoes;
CREATE POLICY "interacoes_delete_own" ON public.interacoes FOR DELETE TO authenticated
  USING (usuario_id = auth.uid());

-- 7. RLS TRANSACOES_FINANCEIRAS: ISOLAMENTO POR USUARIO_ID
ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transacoes_select" ON public.transacoes_financeiras;
DROP POLICY IF EXISTS "transacoes_select_own" ON public.transacoes_financeiras;
CREATE POLICY "transacoes_select_own" ON public.transacoes_financeiras FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "transacoes_insert" ON public.transacoes_financeiras;
DROP POLICY IF EXISTS "transacoes_insert_own" ON public.transacoes_financeiras;
CREATE POLICY "transacoes_insert_own" ON public.transacoes_financeiras FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "transacoes_update" ON public.transacoes_financeiras;
DROP POLICY IF EXISTS "transacoes_update_own" ON public.transacoes_financeiras;
CREATE POLICY "transacoes_update_own" ON public.transacoes_financeiras FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "transacoes_delete" ON public.transacoes_financeiras;
DROP POLICY IF EXISTS "transacoes_delete_own" ON public.transacoes_financeiras;
CREATE POLICY "transacoes_delete_own" ON public.transacoes_financeiras FOR DELETE TO authenticated
  USING (usuario_id = auth.uid());

-- 8. RPC SEGURA `buscar_leads_bounds` ISOLADA POR USUÁRIO
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
    AND responsavel_id = auth.uid()
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
