-- Vincular usuário master (nicolleamethyst) como morador na unidade 101
INSERT INTO moradores (user_id, unidade_id, status, is_proprietario, data_entrada)
SELECT 'c76d8134-824d-432b-8b4b-a72f0c6ce3e0', '4a98f796-5e1a-42b9-9010-b92158e56193', 'aprovado', true, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM moradores WHERE user_id = 'c76d8134-824d-432b-8b4b-a72f0c6ce3e0');

-- Vincular usuário admin como morador na unidade 102
INSERT INTO moradores (user_id, unidade_id, status, is_proprietario, data_entrada)
SELECT 'cc3faab0-862f-41d5-8f46-277b50949324', '0507daa7-6bca-4b4d-902f-74d080138169', 'aprovado', true, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM moradores WHERE user_id = 'cc3faab0-862f-41d5-8f46-277b50949324');