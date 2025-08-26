-- Script para corrigir a sessão da Periodontia
-- Executar diretamente no Supabase SQL Editor

-- 1. Marcar a sessão como concluída
UPDATE treatment_sessions 
SET 
  completed = true,
  date = '2025-08-23',
  description = 'Sessão concluída',
  updated_at = NOW()
WHERE treatment_item_id = '07dfb7e2-7316-4200-9b88-b063a2da5449';

-- 2. Atualizar o campo completedSessions do item
UPDATE itens_plano_tratamento 
SET 
  completedSessions = 1,
  updated_at = NOW()
WHERE id = '07dfb7e2-7316-4200-9b88-b063a2da5449';

-- 3. Verificar se foi atualizado
SELECT 
  ts.id,
  ts.completed,
  ts.date,
  ts.description,
  ip.completedSessions
FROM treatment_sessions ts
JOIN itens_plano_tratamento ip ON ts.treatment_item_id = ip.id
WHERE ts.treatment_item_id = '07dfb7e2-7316-4200-9b88-b063a2da5449';
