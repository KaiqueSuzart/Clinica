-- =====================================================
-- POLÍTICAS RLS CORRIGIDAS COM OS TIPOS CORRETOS
-- =====================================================
-- Baseado nos tipos reais das colunas encontrados
-- =====================================================

-- 1. REMOVER POLÍTICAS EXISTENTES
-- =====================================================
DROP POLICY IF EXISTS "clientelA_empresa_policy" ON "clientelA";
DROP POLICY IF EXISTS "consultas_empresa_policy" ON consultas;
DROP POLICY IF EXISTS "orcamentos_empresa_policy" ON orcamentos;
DROP POLICY IF EXISTS "retornos_empresa_policy" ON retornos;

-- 2. CRIAR POLÍTICAS RLS COM OS TIPOS CORRETOS
-- =====================================================

-- Política para clientelA (empresa é BIGINT)
CREATE POLICY "clientelA_empresa_policy" ON "clientelA"
  FOR ALL USING (empresa = current_setting('app.current_empresa_id')::BIGINT);

-- Política para consultas (empresa_id é TEXT)
CREATE POLICY "consultas_empresa_policy" ON consultas
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::TEXT);

-- Política para orcamentos (empresa_id é BIGINT)
CREATE POLICY "orcamentos_empresa_policy" ON orcamentos
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- Política para retornos (empresa_id é BIGINT)
CREATE POLICY "retornos_empresa_policy" ON retornos
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- 3. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    CASE 
        WHEN qual LIKE '%::TEXT%' THEN 'TEXT'
        WHEN qual LIKE '%::BIGINT%' THEN 'BIGINT'
        ELSE 'OUTRO'
    END as tipo_usado
FROM pg_policies 
WHERE tablename IN ('clientelA', 'consultas', 'orcamentos', 'retornos')
ORDER BY tablename, policyname;

-- 4. TESTAR AS POLÍTICAS (OPCIONAL)
-- =====================================================
-- Para testar, você pode executar:
-- SELECT set_config('app.current_empresa_id', '1', true);
-- SELECT * FROM "clientelA" LIMIT 1;
-- SELECT * FROM consultas LIMIT 1;
-- SELECT * FROM orcamentos LIMIT 1;
-- SELECT * FROM retornos LIMIT 1;

