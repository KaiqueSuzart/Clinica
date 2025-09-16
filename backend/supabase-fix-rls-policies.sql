-- =====================================================
-- CORRIGIR POLÍTICAS RLS - VERIFICAR TIPOS PRIMEIRO
-- =====================================================
-- Execute este SQL para corrigir as políticas RLS
-- =====================================================

-- 1. VERIFICAR TIPOS DAS COLUNAS PRIMEIRO
-- =====================================================

-- Verificar tipo da coluna empresa na tabela clientelA
SELECT 'clientelA.empresa' as tabela_coluna, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clientelA' AND column_name = 'empresa';

-- Verificar tipo da coluna empresa_id nas outras tabelas
SELECT 'consultas.empresa_id' as tabela_coluna, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'consultas' AND column_name = 'empresa_id';

SELECT 'orcamentos.empresa_id' as tabela_coluna, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orcamentos' AND column_name = 'empresa_id';

SELECT 'retornos.empresa_id' as tabela_coluna, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'retornos' AND column_name = 'empresa_id';

-- 2. CRIAR POLÍTICAS RLS BASEADAS NOS TIPOS REAIS
-- =====================================================

-- Políticas para clientes (ajustar conforme o tipo real)
DROP POLICY IF EXISTS "clientelA_empresa_policy" ON "clientelA";

-- Se empresa for TEXT, usar:
CREATE POLICY "clientelA_empresa_policy" ON "clientelA"
  FOR ALL USING (empresa = current_setting('app.current_empresa_id')::TEXT);

-- Se empresa for BIGINT, usar:
-- CREATE POLICY "clientelA_empresa_policy" ON "clientelA"
--   FOR ALL USING (empresa = current_setting('app.current_empresa_id')::BIGINT);

-- Políticas para consultas (ajustar conforme o tipo real)
DROP POLICY IF EXISTS "consultas_empresa_policy" ON consultas;

-- Se empresa_id for BIGINT, usar:
CREATE POLICY "consultas_empresa_policy" ON consultas
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- Se empresa_id for TEXT, usar:
-- CREATE POLICY "consultas_empresa_policy" ON consultas
--   FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::TEXT);

-- Políticas para orçamentos (ajustar conforme o tipo real)
DROP POLICY IF EXISTS "orcamentos_empresa_policy" ON orcamentos;

-- Se empresa_id for BIGINT, usar:
CREATE POLICY "orcamentos_empresa_policy" ON orcamentos
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- Se empresa_id for TEXT, usar:
-- CREATE POLICY "orcamentos_empresa_policy" ON orcamentos
--   FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::TEXT);

-- Políticas para retornos (ajustar conforme o tipo real)
DROP POLICY IF EXISTS "retornos_empresa_policy" ON retornos;

-- Se empresa_id for BIGINT, usar:
CREATE POLICY "retornos_empresa_policy" ON retornos
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- Se empresa_id for TEXT, usar:
-- CREATE POLICY "retornos_empresa_policy" ON retornos
--   FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::TEXT);

-- 3. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- =====================================================
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename IN ('clientelA', 'consultas', 'orcamentos', 'retornos')
ORDER BY tablename, policyname;

