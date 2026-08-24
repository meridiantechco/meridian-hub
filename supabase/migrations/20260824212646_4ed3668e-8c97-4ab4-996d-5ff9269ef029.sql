-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'vendedor');
CREATE TYPE public.lead_status AS ENUM ('novo', 'contatado', 'proposta', 'fechado', 'recusado');
CREATE TYPE public.lead_origem AS ENUM ('google_places', 'manual', 'importacao');
CREATE TYPE public.interacao_tipo AS ENUM ('ligacao', 'whatsapp', 'email', 'visita', 'outro');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.atualizado_em = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'vendedor',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN (SELECT count(*) FROM public.user_roles) = 0 THEN 'admin'::public.app_role ELSE 'vendedor'::public.app_role END)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- LEADS
CREATE TABLE public.leads (
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

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "leads_select" ON public.leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR responsavel_id = auth.uid() OR responsavel_id IS NULL);
CREATE POLICY "leads_insert" ON public.leads FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR responsavel_id = auth.uid() OR responsavel_id IS NULL);
CREATE POLICY "leads_update" ON public.leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR responsavel_id = auth.uid() OR responsavel_id IS NULL);
CREATE POLICY "leads_delete" ON public.leads FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX leads_status_idx ON public.leads (status);
CREATE INDEX leads_score_idx ON public.leads (score DESC);
CREATE INDEX leads_responsavel_idx ON public.leads (responsavel_id);

-- BUSCAS
CREATE TABLE public.buscas (
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

CREATE POLICY "buscas_select" ON public.buscas FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR executada_por = auth.uid());
CREATE POLICY "buscas_insert" ON public.buscas FOR INSERT TO authenticated
  WITH CHECK (executada_por = auth.uid());
CREATE POLICY "buscas_admin_manage" ON public.buscas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- INTERACOES
CREATE TABLE public.interacoes (
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

CREATE POLICY "interacoes_select" ON public.interacoes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR usuario_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id AND (l.responsavel_id = auth.uid() OR l.responsavel_id IS NULL)));
CREATE POLICY "interacoes_insert" ON public.interacoes FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "interacoes_update_own" ON public.interacoes FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "interacoes_delete_own" ON public.interacoes FOR DELETE TO authenticated
  USING (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));