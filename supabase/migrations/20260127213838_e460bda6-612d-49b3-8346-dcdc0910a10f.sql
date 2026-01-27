-- Criar unidades de teste no Bloco A
INSERT INTO unidades (numero, bloco_id, tipo)
SELECT '101', '76783da1-46e5-46ee-95ff-929c9e42b079', 'apartamento'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE bloco_id = '76783da1-46e5-46ee-95ff-929c9e42b079' AND numero = '101');

INSERT INTO unidades (numero, bloco_id, tipo)
SELECT '102', '76783da1-46e5-46ee-95ff-929c9e42b079', 'apartamento'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE bloco_id = '76783da1-46e5-46ee-95ff-929c9e42b079' AND numero = '102');

INSERT INTO unidades (numero, bloco_id, tipo)
SELECT '103', '76783da1-46e5-46ee-95ff-929c9e42b079', 'apartamento'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE bloco_id = '76783da1-46e5-46ee-95ff-929c9e42b079' AND numero = '103');