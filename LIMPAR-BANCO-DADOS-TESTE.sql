-- ============================================
-- SCRIPT PARA LIMPAR DADOS DE TESTE DO BANCO
-- ============================================
-- Este script apaga todos os dados de teste, mantendo apenas:
-- - Tabela 'empresa' (informações da clínica)
-- - Tabela 'usuarios' (usuários do sistema)
-- - Procedimentos do catálogo (onde cliente_id IS NULL)
--
-- ⚠️ ATENÇÃO: Este script é DESTRUTIVO!
-- Execute apenas se tiver certeza de que deseja apagar todos os dados de teste.
-- ============================================

-- Desabilitar temporariamente as verificações de foreign key
SET session_replication_role = 'replica';

-- ============================================
-- 1. APAGAR DADOS DE PACIENTES E RELACIONADOS
-- ============================================

-- Apagar sessões de tratamento
DELETE FROM treatment_sessions;

-- Apagar itens de plano de tratamento
DELETE FROM itens_plano_tratamento;

-- Apagar planos de tratamento
DELETE FROM plano_tratamento;

-- Apagar anotações
DELETE FROM annotations;

-- Apagar eventos da timeline
DELETE FROM timeline_eventos;

-- Apagar notas do cliente
DELETE FROM notas_cliente;

-- Apagar anamneses
DELETE FROM anamnese;

-- Apagar arquivos de pacientes
DELETE FROM patient_files;

-- Apagar procedimentos vinculados a clientes (histórico)
DELETE FROM procedimentos WHERE cliente_id IS NOT NULL;

-- Apagar itens de orçamento
DELETE FROM itens_orcamento;

-- Apagar orçamentos
DELETE FROM orcamentos;

-- Apagar retornos
DELETE FROM retornos;

-- Apagar consultas (agendamentos)
DELETE FROM consultas;

-- Apagar pacientes
DELETE FROM clientelA;

-- ============================================
-- 2. APAGAR DADOS FINANCEIROS DE TESTE
-- ============================================

-- Apagar pagamentos
DELETE FROM pagamentos;

-- Apagar assinaturas (se houver dados de teste)
-- Nota: Verifique se a tabela subscriptions existe
-- DELETE FROM subscriptions;

-- ============================================
-- 3. MANTER (NÃO APAGAR)
-- ============================================
-- ✅ empresa - Mantida (informações da clínica)
-- ✅ usuarios - Mantida (usuários do sistema)
-- ✅ procedimentos WHERE cliente_id IS NULL - Mantidos (catálogo de procedimentos)
-- ✅ business_hours - Mantida (horários de funcionamento)

-- ============================================
-- 4. REABILITAR VERIFICAÇÕES DE FOREIGN KEY
-- ============================================

SET session_replication_role = 'origin';

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Execute estas queries para verificar se os dados foram apagados:

-- SELECT COUNT(*) as total_pacientes FROM clientelA;
-- SELECT COUNT(*) as total_consultas FROM consultas;
-- SELECT COUNT(*) as total_orcamentos FROM orcamentos;
-- SELECT COUNT(*) as total_usuarios FROM usuarios;
-- SELECT COUNT(*) as total_empresas FROM empresa;
-- SELECT COUNT(*) as total_procedimentos_catalogo FROM procedimentos WHERE cliente_id IS NULL;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

