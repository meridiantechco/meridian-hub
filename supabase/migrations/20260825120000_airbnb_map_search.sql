-- =========================================================================
-- MIGRATION: BUSCA POR BOUNDING BOX ESTILO AIRBNB (PostGIS / B-Tree Index)
-- =========================================================================

-- 1. Criar índice composto em latitude e longitude para consultas ultrarrápidas por viewport
CREATE INDEX IF NOT EXISTS leads_lat_lng_composite_idx ON public.leads (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 2. Função RPC para buscar estabelecimentos dentro dos limites da tela (Bounding Box)
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

-- 3. Permissões de execução
GRANT EXECUTE ON FUNCTION public.buscar_leads_bounds TO authenticated;
GRANT EXECUTE ON FUNCTION public.buscar_leads_bounds TO service_role;
GRANT EXECUTE ON FUNCTION public.buscar_leads_bounds TO anon;
