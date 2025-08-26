-- =====================================================
-- SCRIPT PARA CRIAR SESSÕES PARA ITENS EXISTENTES
-- Execute APÓS criar a tabela treatment_sessions
-- =====================================================

-- 1. Verificar itens existentes
SELECT 
  id,
  procedimento,
  sessoes_estimadas,
  plano_id
FROM itens_plano_tratamento
ORDER BY plano_id, procedimento;

-- 2. Criar sessões para cada item
-- (Execute este bloco para cada item que você quiser popular)

-- Exemplo para um item específico (substitua os IDs):
INSERT INTO treatment_sessions (treatment_item_id, session_number, completed)
SELECT 
  '333b90f7-a803-4710-80ce-92b69d3352d8' as treatment_item_id, -- ID do item Clareamento
  generate_series(1, 4) as session_number, -- 4 sessões
  false as completed
ON CONFLICT DO NOTHING;

-- 3. Script automatizado para todos os itens
-- (Execute este bloco para criar sessões para TODOS os itens)

DO $$
DECLARE
    item_record RECORD;
BEGIN
    FOR item_record IN 
        SELECT id, sessoes_estimadas 
        FROM itens_plano_tratamento 
        WHERE sessoes_estimadas > 0
    LOOP
        -- Criar sessões para este item
        INSERT INTO treatment_sessions (treatment_item_id, session_number, completed)
        SELECT 
            item_record.id as treatment_item_id,
            generate_series(1, item_record.sessoes_estimadas) as session_number,
            false as completed
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Criadas % sessões para item %', item_record.sessoes_estimadas, item_record.id;
    END LOOP;
END $$;

-- 4. Verificar se as sessões foram criadas
SELECT 
    ts.id,
    ts.treatment_item_id,
    ts.session_number,
    ts.completed,
    ipt.procedimento,
    ipt.sessoes_estimadas
FROM treatment_sessions ts
JOIN itens_plano_tratamento ipt ON ts.treatment_item_id = ipt.id
ORDER BY ipt.plano_id, ipt.procedimento, ts.session_number;

-- 5. Contar sessões por item
SELECT 
    ipt.procedimento,
    ipt.sessoes_estimadas as estimadas,
    COUNT(ts.id) as criadas,
    COUNT(CASE WHEN ts.completed = true THEN 1 END) as concluidas
FROM itens_plano_tratamento ipt
LEFT JOIN treatment_sessions ts ON ipt.id = ts.treatment_item_id
GROUP BY ipt.id, ipt.procedimento, ipt.sessoes_estimadas
ORDER BY ipt.plano_id, ipt.procedimento;

-- =====================================================
-- INSTRUÇÕES:
-- 1. Execute primeiro o script CRIAR-TABELA-SESSOES.sql
-- 2. Execute este script para popular as sessões
-- 3. Verifique se as sessões foram criadas corretamente
-- 4. Volte para a aplicação e teste novamente
-- =====================================================
