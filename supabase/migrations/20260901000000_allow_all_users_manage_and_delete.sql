-- ==============================================================================
-- MIGRATION: LIBERAÇÃO DE GESTÃO E EXCLUSÃO PARA TODOS OS USUÁRIOS (MERIDIAN HUB)
-- Data: 2026-09-01
-- Objetivo: Permitir que todos os usuários autenticados possam gerenciar, editar e excluir
-- dados operacionais, de prospecção, financeiros, relacionamentos e equipe.
-- ==============================================================================

-- 1. LEADS: Todos os usuários autenticados podem Ler, Criar, Atualizar e Deletar
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_select" ON public.leads;
DROP POLICY IF EXISTS "leads_select_authenticated" ON public.leads;
CREATE POLICY "leads_select" ON public.leads FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "leads_insert" ON public.leads;
CREATE POLICY "leads_insert" ON public.leads FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "leads_update" ON public.leads;
CREATE POLICY "leads_update" ON public.leads FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "leads_delete" ON public.leads;
CREATE POLICY "leads_delete" ON public.leads FOR DELETE TO authenticated
  USING (true);

-- 2. TRANSAÇÕES FINANCEIRAS: Todos os usuários autenticados podem gerenciar e excluir
ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transacoes_select" ON public.transacoes_financeiras;
CREATE POLICY "transacoes_select" ON public.transacoes_financeiras FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "transacoes_insert" ON public.transacoes_financeiras;
CREATE POLICY "transacoes_insert" ON public.transacoes_financeiras FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "transacoes_update" ON public.transacoes_financeiras;
CREATE POLICY "transacoes_update" ON public.transacoes_financeiras FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "transacoes_delete" ON public.transacoes_financeiras;
CREATE POLICY "transacoes_delete" ON public.transacoes_financeiras FOR DELETE TO authenticated
  USING (true);

-- 3. BUSCAS (VARREDURAS): Todos os usuários autenticados podem gerenciar e excluir
ALTER TABLE public.buscas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "buscas_select" ON public.buscas;
CREATE POLICY "buscas_select" ON public.buscas FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "buscas_insert" ON public.buscas;
CREATE POLICY "buscas_insert" ON public.buscas FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "buscas_admin_manage" ON public.buscas;
DROP POLICY IF EXISTS "buscas_all_manage" ON public.buscas;
CREATE POLICY "buscas_all_manage" ON public.buscas FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. INTERAÇÕES: Todos os usuários autenticados podem gerenciar e excluir
ALTER TABLE public.interacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interacoes_select" ON public.interacoes;
CREATE POLICY "interacoes_select" ON public.interacoes FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "interacoes_insert" ON public.interacoes;
CREATE POLICY "interacoes_insert" ON public.interacoes FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "interacoes_update_own" ON public.interacoes;
DROP POLICY IF EXISTS "interacoes_update" ON public.interacoes;
CREATE POLICY "interacoes_update" ON public.interacoes FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "interacoes_delete_own" ON public.interacoes;
DROP POLICY IF EXISTS "interacoes_delete_admin" ON public.interacoes;
DROP POLICY IF EXISTS "interacoes_delete" ON public.interacoes;
CREATE POLICY "interacoes_delete" ON public.interacoes FOR DELETE TO authenticated
  USING (true);

-- 5. AUDITORIA DE ATIVIDADES: Todos podem visualizar e registrar
ALTER TABLE public.auditoria_atividades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auditoria_select" ON public.auditoria_atividades;
CREATE POLICY "auditoria_select" ON public.auditoria_atividades FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "auditoria_insert" ON public.auditoria_atividades;
CREATE POLICY "auditoria_insert" ON public.auditoria_atividades FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auditoria_delete" ON public.auditoria_atividades;
CREATE POLICY "auditoria_delete" ON public.auditoria_atividades FOR DELETE TO authenticated
  USING (true);

-- 6. PROFILES E USER_ROLES: Todos os usuários autenticados podem gerenciar
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all_auth" ON public.profiles;
CREATE POLICY "profiles_select_all_auth" ON public.profiles FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_all_auth" ON public.profiles;
CREATE POLICY "profiles_update_all_auth" ON public.profiles FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_all_auth" ON public.profiles;
CREATE POLICY "profiles_insert_all_auth" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_all_auth" ON public.profiles;
CREATE POLICY "profiles_delete_all_auth" ON public.profiles FOR DELETE TO authenticated
  USING (true);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "user_roles_admin_write" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_all_write" ON public.user_roles;
CREATE POLICY "user_roles_all_write" ON public.user_roles FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7. FUNÇÃO DE EXCLUSÃO DE USUÁRIO: Permitir para qualquer usuário autenticado (protegendo apenas o super admin e auto-exclusão)
CREATE OR REPLACE FUNCTION public.admin_remover_usuario(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _target_email TEXT;
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'ID de usuário inválido para remoção.';
  END IF;

  -- 1. Verifica autenticação
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Acesso Negado: Usuário não autenticado.';
  END IF;

  -- 2. Impede auto-exclusão
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Ação Não Permitida: Você não pode remover sua própria conta de usuário logado.';
  END IF;

  -- 3. Protege o Administrador Supremo
  SELECT lower(email) INTO _target_email FROM auth.users WHERE id = target_user_id;
  IF _target_email = 'meridiantech.co@gmail.com' THEN
    RAISE EXCEPTION 'Acesso Negado: O Administrador Supremo (meridiantech.co@gmail.com) não pode ser excluído.';
  END IF;

  -- 4. Desvincula leads sob responsabilidade do usuário removido
  UPDATE public.leads
  SET responsavel_id = NULL
  WHERE responsavel_id = target_user_id;

  -- 5. Exclui roles e perfis do schema public
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- 6. Exclui o usuário da tabela auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_remover_usuario(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remover_usuario(UUID) TO service_role;
