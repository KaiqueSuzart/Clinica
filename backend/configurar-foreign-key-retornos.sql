-- =========================================
-- CONFIGURAR FOREIGN KEY PARA RETORNOS
-- =========================================

-- 1. Verificar se a tabela clientelA existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'clientelA';

-- 2. Verificar a estrutura da tabela clientelA
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clientelA' 
AND table_schema = 'public';

-- 3. Adicionar foreign key se não existir
ALTER TABLE retornos 
ADD CONSTRAINT retornos_cliente_id_fkey 
FOREIGN KEY (cliente_id) 
REFERENCES clientelA(id);

-- 4. Verificar se a foreign key foi criada
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='retornos';

-- 5. Testar o join
SELECT 
    r.*,
    c.nome,
    c.telefone,
    c.email
FROM retornos r
LEFT JOIN clientelA c ON r.cliente_id = c.id
LIMIT 5;






