-- ==============================================================================
-- MERIDIAN HUB / PROSPECTOR HUB: SCHEMA CONSOLIDADO COMPLETO (PORTUGUÊS)
-- ==============================================================================

-- 1. ENUMS E TIPOS
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'vendedor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.lead_status AS ENUM ('novo', 'contatado', 'proposta', 'fechado', 'recusado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.lead_origem AS ENUM ('google_places', 'manual', 'importacao');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.interacao_tipo AS ENUM ('ligacao', 'whatsapp', 'email', 'visita', 'outro');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.tipo_transacao AS ENUM ('receita', 'despesa');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.recorrencia_transacao AS ENUM ('pontual', 'mensal', 'anual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.status_transacao AS ENUM ('pago', 'pendente', 'cancelado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. FUNÇÃO UTILITÁRIA PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. TABELA: PROFILES (PERFIS DE USUÁRIOS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. TABELA: USER_ROLES (CARGOS E PERMISSÕES)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'vendedor',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- FUNÇÃO CHECAGEM DE PAPEL
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- POLÍTICAS RLS: PROFILES
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- POLÍTICAS RLS: USER_ROLES
DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "user_roles_admin_write" ON public.user_roles;
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- TRIGGER: AUTOMATIZAÇÃO DE NOVO USUÁRIO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)), NEW.email)
  ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, email = EXCLUDED.email;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN (SELECT count(*) FROM public.user_roles) = 0 THEN 'admin'::public.app_role ELSE 'vendedor'::public.app_role END)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. TABELA: LEADS (ESTABELECIMENTOS E PROSPECTOS)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT '',
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  telefone TEXT,
  whatsapp_link TEXT,
  instagram TEXT,
  facebook TEXT,
  site_url TEXT,
  tem_site BOOLEAN NOT NULL DEFAULT false,
  avaliacao_google NUMERIC(2,1),
  total_avaliacoes INTEGER NOT NULL DEFAULT 0,
  place_id TEXT UNIQUE,
  status public.lead_status NOT NULL DEFAULT 'novo',
  score INTEGER NOT NULL DEFAULT 0,
  origem public.lead_origem NOT NULL DEFAULT 'manual',
  responsavel_id UUID REFERENCES auth.users ON DELETE SET NULL,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads (status);
CREATE INDEX IF NOT EXISTS leads_score_idx ON public.leads (score DESC);
CREATE INDEX IF NOT EXISTS leads_responsavel_idx ON public.leads (responsavel_id);
CREATE INDEX IF NOT EXISTS leads_lat_lng_composite_idx ON public.leads (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 6. TABELA: BUSCAS (HISTÓRICO DE MINERAÇÃO)
CREATE TABLE IF NOT EXISTS public.buscas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  termo_busca TEXT NOT NULL,
  categoria TEXT,
  regiao TEXT,
  raio_km NUMERIC(6,2) NOT NULL DEFAULT 5,
  total_resultados INTEGER NOT NULL DEFAULT 0,
  total_sem_site INTEGER NOT NULL DEFAULT 0,
  executada_por UUID REFERENCES auth.users ON DELETE SET NULL,
  criada_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buscas TO authenticated;
GRANT ALL ON public.buscas TO service_role;
ALTER TABLE public.buscas ENABLE ROW LEVEL SECURITY;

-- 7. TABELA: INTERACOES (HISTÓRICO DE CONTATOS E WHATSAPP)
CREATE TABLE IF NOT EXISTS public.interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads ON DELETE CASCADE,
  tipo public.interacao_tipo NOT NULL DEFAULT 'outro',
  descricao TEXT,
  resultado TEXT,
  usuario_id UUID REFERENCES auth.users ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interacoes TO authenticated;
GRANT ALL ON public.interacoes TO service_role;
ALTER TABLE public.interacoes ENABLE ROW LEVEL SECURITY;

-- 8. TABELA: TRANSACOES_FINANCEIRAS (FLUXO DE CAIXA E RECEITAS)
CREATE TABLE IF NOT EXISTS public.transacoes_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo public.tipo_transacao NOT NULL DEFAULT 'receita',
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  valor NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  data_competencia DATE NOT NULL DEFAULT CURRENT_DATE,
  data_pagamento DATE,
  recorrencia public.recorrencia_transacao NOT NULL DEFAULT 'pontual',
  status public.status_transacao NOT NULL DEFAULT 'pago',
  lead_id UUID REFERENCES public.leads ON DELETE SET NULL,
  lead_nome TEXT,
  usuario_id UUID REFERENCES auth.users ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transacoes_financeiras TO authenticated;
GRANT ALL ON public.transacoes_financeiras TO service_role;
ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS transacoes_financeiras_updated_at ON public.transacoes_financeiras;
CREATE TRIGGER transacoes_financeiras_updated_at BEFORE UPDATE ON public.transacoes_financeiras
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS transacoes_competencia_idx ON public.transacoes_financeiras (data_competencia DESC);
CREATE INDEX IF NOT EXISTS transacoes_tipo_status_idx ON public.transacoes_financeiras (tipo, status);

-- 9. TABELA: AUDITORIA_ATIVIDADES (LOG UNIFICADO DE AÇÕES)
CREATE TABLE IF NOT EXISTS public.auditoria_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users ON DELETE SET NULL,
  usuario_nome TEXT,
  usuario_email TEXT,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  lead_id UUID REFERENCES public.leads ON DELETE SET NULL,
  lead_nome TEXT,
  metadados JSONB DEFAULT '{}'::jsonb,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.auditoria_atividades TO authenticated;
GRANT ALL ON public.auditoria_atividades TO service_role;
ALTER TABLE public.auditoria_atividades ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS auditoria_criado_em_idx ON public.auditoria_atividades (criado_em DESC);
CREATE INDEX IF NOT EXISTS auditoria_usuario_idx ON public.auditoria_atividades (usuario_id);

-- ==============================================================================
-- 10. POLÍTICAS DE RLS (ROW LEVEL SECURITY)
-- ==============================================================================

-- RLS: LEADS
DROP POLICY IF EXISTS "leads_select" ON public.leads;
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

-- RLS: BUSCAS
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

-- RLS: INTERACOES
DROP POLICY IF EXISTS "interacoes_select" ON public.interacoes;
CREATE POLICY "interacoes_select" ON public.interacoes FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR usuario_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id AND (l.responsavel_id = auth.uid() OR l.responsavel_id IS NULL))
  );

DROP POLICY IF EXISTS "interacoes_insert" ON public.interacoes;
CREATE POLICY "interacoes_insert" ON public.interacoes FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "interacoes_update_own" ON public.interacoes;
CREATE POLICY "interacoes_update_own" ON public.interacoes FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "interacoes_delete_own" ON public.interacoes;
CREATE POLICY "interacoes_delete_own" ON public.interacoes FOR DELETE TO authenticated
  USING (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS: TRANSACOES_FINANCEIRAS
DROP POLICY IF EXISTS "transacoes_select" ON public.transacoes_financeiras;
CREATE POLICY "transacoes_select" ON public.transacoes_financeiras FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR usuario_id = auth.uid());

DROP POLICY IF EXISTS "transacoes_insert" ON public.transacoes_financeiras;
CREATE POLICY "transacoes_insert" ON public.transacoes_financeiras FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR usuario_id = auth.uid());

DROP POLICY IF EXISTS "transacoes_update" ON public.transacoes_financeiras;
CREATE POLICY "transacoes_update" ON public.transacoes_financeiras FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "transacoes_delete" ON public.transacoes_financeiras;
CREATE POLICY "transacoes_delete" ON public.transacoes_financeiras FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS: AUDITORIA_ATIVIDADES
DROP POLICY IF EXISTS "auditoria_select" ON public.auditoria_atividades;
CREATE POLICY "auditoria_select" ON public.auditoria_atividades FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR usuario_id = auth.uid());

DROP POLICY IF EXISTS "auditoria_insert" ON public.auditoria_atividades;
CREATE POLICY "auditoria_insert" ON public.auditoria_atividades FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR usuario_id IS NULL);

-- ==============================================================================
-- 11. REGRAS DE NEGÓCIO E TRIGGERS: SCORE DE LEADS E WHATSAPP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.calcular_score_lead(
  _tem_site BOOLEAN,
  _instagram TEXT,
  _facebook TEXT,
  _total_avaliacoes INTEGER,
  _avaliacao_google NUMERIC,
  _criado_em TIMESTAMPTZ
)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  _score INTEGER := 0;
  _tem_rede BOOLEAN := false;
  _pts_vol INTEGER := 0;
  _pts_nota INTEGER := 0;
BEGIN
  -- 1. Sem site próprio (peso alto: 45 pontos)
  IF _tem_site IS NOT TRUE THEN
    _score := _score + 45;
  END IF;

  -- 2. Tem redes sociais mas não possui site (peso médio: 15 pontos)
  _tem_rede := (_instagram IS NOT NULL AND trim(_instagram) <> '') 
            OR (_facebook IS NOT NULL AND trim(_facebook) <> '');
  IF _tem_site IS NOT TRUE AND _tem_rede THEN
    _score := _score + 15;
  END IF;

  -- 3. Volume de avaliações no Google (até 20 pontos)
  IF _total_avaliacoes IS NOT NULL AND _total_avaliacoes > 0 THEN
    _pts_vol := LEAST(20, ROUND((_total_avaliacoes::NUMERIC / 50.0) * 20.0)::INTEGER);
    _score := _score + _pts_vol;
  END IF;

  -- 4. Nota média no Google (até 15 pontos)
  IF _avaliacao_google IS NOT NULL AND _avaliacao_google > 0 THEN
    _pts_nota := ROUND((LEAST(5.0, _avaliacao_google) / 5.0) * 15.0)::INTEGER;
    _score := _score + _pts_nota;
  END IF;

  -- 5. Recência da captura (5 pontos se capturado nos últimos 7 dias)
  IF _criado_em IS NOT NULL AND _criado_em >= (now() - INTERVAL '7 days') THEN
    _score := _score + 5;
  END IF;

  RETURN GREATEST(0, LEAST(100, _score));
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_processar_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tel_limpo TEXT;
BEGIN
  NEW.score := public.calcular_score_lead(
    NEW.tem_site,
    NEW.instagram,
    NEW.facebook,
    NEW.total_avaliacoes,
    NEW.avaliacao_google,
    COALESCE(NEW.criado_em, now())
  );

  IF NEW.telefone IS NOT NULL AND trim(NEW.telefone) <> '' THEN
    _tel_limpo := regexp_replace(NEW.telefone, '\D', '', 'g');
    IF length(_tel_limpo) >= 10 THEN
      IF NOT _tel_limpo LIKE '55%' THEN
        _tel_limpo := '55' || _tel_limpo;
      END IF;
      NEW.whatsapp_link := 'https://wa.me/' || _tel_limpo;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_leads_score_process ON public.leads;
CREATE TRIGGER trigger_leads_score_process
BEFORE INSERT OR UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.trigger_processar_lead();

-- ==============================================================================
-- 12. RPC PARA BUSCA NO MAPA COM BOUNDING BOX (AIRBNB STYLE)
-- ==============================================================================
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

GRANT EXECUTE ON FUNCTION public.buscar_leads_bounds TO authenticated;
GRANT EXECUTE ON FUNCTION public.buscar_leads_bounds TO service_role;
GRANT EXECUTE ON FUNCTION public.buscar_leads_bounds TO anon;
