-- Criar função para buscar user_id pelo email (acesso seguro ao auth.users)
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE email = lower(_email) LIMIT 1
$$;

-- Permitir que admins e masters usem esta função
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email TO authenticated;