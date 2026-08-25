-- ==============================================================================
-- PROSPECTA: CALCULO DE SCORE DE PRIORIDADE E REGRAS DE RLS
-- ==============================================================================

-- 1. FUNCAO DE CALCULO DE SCORE DE PRIORIDADE
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

  -- Normalizar entre 0 e 100
  RETURN GREATEST(0, LEAST(100, _score));
END;
$$;

-- 2. TRIGGER PARA ATUALIZAR SCORE E WHATSAPP AUTOMATICAMENTE ANTES DE INSERT OU UPDATE
CREATE OR REPLACE FUNCTION public.trigger_processar_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tel_limpo TEXT;
BEGIN
  -- Calcular Score automaticamente
  NEW.score := public.calcular_score_lead(
    NEW.tem_site,
    NEW.instagram,
    NEW.facebook,
    NEW.total_avaliacoes,
    NEW.avaliacao_google,
    COALESCE(NEW.criado_em, now())
  );

  -- Gerar wa.me link se houver telefone e não houver whatsapp_link configurado
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

-- 3. REGRAS DE RLS (ROW LEVEL SECURITY)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_select" ON public.leads;
DROP POLICY IF EXISTS "leads_insert" ON public.leads;
DROP POLICY IF EXISTS "leads_update" ON public.leads;
DROP POLICY IF EXISTS "leads_delete" ON public.leads;

-- Vendedores só leem leads atribuídos a si ou sem responsável; Admins leem tudo
CREATE POLICY "leads_select" ON public.leads
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR responsavel_id = auth.uid()
  OR responsavel_id IS NULL
);

-- Inserção permitida para authenticated
CREATE POLICY "leads_insert" ON public.leads
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR responsavel_id = auth.uid()
  OR responsavel_id IS NULL
);

-- Atualização: Admins atualizam tudo; Vendedores atualizam seus próprios leads ou assumem leads sem responsável
CREATE POLICY "leads_update" ON public.leads
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR responsavel_id = auth.uid()
  OR responsavel_id IS NULL
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR responsavel_id = auth.uid()
);

-- Exclusão: Somente Administradores
CREATE POLICY "leads_delete" ON public.leads
FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);
