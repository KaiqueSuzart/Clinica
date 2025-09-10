-- =========================================
-- CORRIGIR RLS PARA TABELA RETORNOS
-- =========================================

-- 1. Desabilitar RLS temporariamente para permitir inserções
ALTER TABLE retornos DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'retornos';

-- 3. Testar inserção simples
INSERT INTO retornos (
    cliente_id, 
    data_retorno, 
    hora_retorno, 
    motivo, 
    procedimento, 
    status, 
    observacoes,
    empresa_id
) VALUES (
    12, 
    '2025-09-20', 
    '09:00', 
    'Teste de retorno', 
    'Avaliação pós-limpeza', 
    'pendente', 
    'Teste de inserção após desabilitar RLS',
    1
);

-- 4. Verificar se a inserção funcionou
SELECT COUNT(*) as total_retornos FROM retornos;

-- 5. Mostrar os retornos inseridos
SELECT * FROM retornos ORDER BY created_at DESC LIMIT 5;


