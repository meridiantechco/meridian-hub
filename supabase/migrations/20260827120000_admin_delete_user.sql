-- ==============================================================================
-- MIGRATION: REMOÇÃO COMPLETA DE USUÁRIO POR ADMINISTRADOR - MERIDIAN HUB
-- Arquivo: 20260827120000_admin_delete_user.sql
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.admin_remover_usuario(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _target_email TEXT;
  _caller_is_admin BOOLEAN := FALSE;
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'ID de usuário inválido para remoção.';
  END IF;

  -- 1. Verifica se o chamador possui privilégios administrativos
  IF public.has_role(auth.uid(), 'admin') THEN
    _caller_is_admin := TRUE;
  END IF;

  IF NOT _caller_is_admin THEN
    RAISE EXCEPTION 'Acesso Negado: Apenas administradores podem remover usuários da plataforma.';
  END IF;

  -- 2. Impede auto-exclusão (administrador não pode excluir a própria conta logada)
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Ação Não Permitida: Você não pode remover sua própria conta de administrador.';
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

REVOKE ALL ON FUNCTION public.admin_remover_usuario(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_remover_usuario(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remover_usuario(UUID) TO service_role;
