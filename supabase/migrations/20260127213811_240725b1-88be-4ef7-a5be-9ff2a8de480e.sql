-- Criar bloco de teste para o Condomínio Demo
INSERT INTO blocos (nome, condominio_id)
SELECT 'Bloco A', '83714d55-08e6-4f18-b3d8-d7f5d7c81c4d'
WHERE NOT EXISTS (SELECT 1 FROM blocos WHERE condominio_id = '83714d55-08e6-4f18-b3d8-d7f5d7c81c4d' AND nome = 'Bloco A');