
-- Inserir um condomínio de teste
INSERT INTO public.condominios (nome, endereco, cidade, estado, cep, email, telefone)
VALUES ('Condomínio Demo', 'Rua Exemplo, 123', 'São Paulo', 'SP', '01234-567', 'contato@condominidemo.com', '(11) 99999-9999');

-- Atribuir role 'master' ao primeiro usuário (nicolleamethyst@virgilian.com)
INSERT INTO public.user_roles (user_id, condominio_id, role)
SELECT 
  'c76d8134-824d-432b-8b4b-a72f0c6ce3e0'::uuid,
  c.id,
  'master'::app_role
FROM public.condominios c
WHERE c.nome = 'Condomínio Demo'
LIMIT 1;

-- Atribuir role 'admin' ao segundo usuário (murieldominant@virgilian.com)
INSERT INTO public.user_roles (user_id, condominio_id, role)
SELECT 
  'cc3faab0-862f-41d5-8f46-277b50949324'::uuid,
  c.id,
  'admin'::app_role
FROM public.condominios c
WHERE c.nome = 'Condomínio Demo'
LIMIT 1;
