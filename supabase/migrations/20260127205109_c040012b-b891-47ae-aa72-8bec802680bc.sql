-- Atualizar senha do usuário de teste master para permitir testes
-- Nota: Esta é uma senha de teste, não use em produção
UPDATE auth.users 
SET encrypted_password = crypt('TestMaster2024!', gen_salt('bf'))
WHERE email = 'nicolleamethyst@virgilian.com';