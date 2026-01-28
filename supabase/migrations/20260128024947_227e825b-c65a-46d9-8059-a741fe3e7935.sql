-- Adicionar coluna email na tabela profiles para armazenar o email do usuário
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Criar índice para buscas por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Atualizar a função handle_new_user para copiar o email do auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$function$;

-- Atualizar emails existentes na tabela profiles copiando de auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
AND p.email IS NULL;