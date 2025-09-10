-- =========================================
-- CORRIGIR ESTRUTURA DA TABELA RETORNOS
-- =========================================

-- 1. Verificar se a coluna data_consulta_original existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'retornos' 
AND table_schema = 'public'
AND column_name = 'data_consulta_original';

-- 2. Adicionar a coluna se não existir
ALTER TABLE retornos 
ADD COLUMN IF NOT EXISTS data_consulta_original DATE;

-- 3. Verificar a estrutura atual da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'retornos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Testar inserção com o campo data_consulta_original
INSERT INTO retornos (
    cliente_id, 
    data_retorno, 
    hora_retorno, 
    motivo, 
    procedimento, 
    status, 
    observacoes,
    data_consulta_original,
    empresa_id
) VALUES (
    12, 
    '2025-09-20', 
    '09:00', 
    'Teste de estrutura', 
    'Teste', 
    'pendente', 
    'Teste após adicionar coluna',
    '2025-09-06',
    1
);

-- 5. Verificar se a inserção funcionou
SELECT * FROM retornos WHERE motivo = 'Teste de estrutura';


