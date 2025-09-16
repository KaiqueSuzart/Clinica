-- =====================================================
-- CORREÇÃO SIMPLES DAS POLÍTICAS RLS
-- =====================================================
-- Execute este SQL para corrigir as políticas RLS
-- =====================================================

-- 1. REMOVER POLÍTICAS EXISTENTES
-- =====================================================
DROP POLICY IF EXISTS "clientelA_empresa_policy" ON "clientelA";
DROP POLICY IF EXISTS "consultas_empresa_policy" ON consultas;
DROP POLICY IF EXISTS "orcamentos_empresa_policy" ON orcamentos;
DROP POLICY IF EXISTS "retornos_empresa_policy" ON retornos;

-- 2. CRIAR POLÍTICAS RLS (TENTANDO AMBOS OS TIPOS)
-- =====================================================

-- Políticas para clientes - tentar TEXT primeiro
DO $$
BEGIN
    BEGIN
        CREATE POLICY "clientelA_empresa_policy" ON "clientelA"
        FOR ALL USING (empresa = current_setting('app.current_empresa_id')::TEXT);
        RAISE NOTICE 'Política clientelA criada com TEXT';
    EXCEPTION WHEN OTHERS THEN
        BEGIN
            CREATE POLICY "clientelA_empresa_policy" ON "clientelA"
            FOR ALL USING (empresa = current_setting('app.current_empresa_id')::BIGINT);
            RAISE NOTICE 'Política clientelA criada com BIGINT';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao criar política clientelA: %', SQLERRM;
        END;
    END;
END $$;

-- Políticas para consultas - tentar BIGINT primeiro
DO $$
BEGIN
    BEGIN
        CREATE POLICY "consultas_empresa_policy" ON consultas
        FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);
        RAISE NOTICE 'Política consultas criada com BIGINT';
    EXCEPTION WHEN OTHERS THEN
        BEGIN
            CREATE POLICY "consultas_empresa_policy" ON consultas
            FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::TEXT);
            RAISE NOTICE 'Política consultas criada com TEXT';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao criar política consultas: %', SQLERRM;
        END;
    END;
END $$;

-- Políticas para orçamentos - tentar BIGINT primeiro
DO $$
BEGIN
    BEGIN
        CREATE POLICY "orcamentos_empresa_policy" ON orcamentos
        FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);
        RAISE NOTICE 'Política orcamentos criada com BIGINT';
    EXCEPTION WHEN OTHERS THEN
        BEGIN
            CREATE POLICY "orcamentos_empresa_policy" ON orcamentos
            FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::TEXT);
            RAISE NOTICE 'Política orcamentos criada com TEXT';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao criar política orcamentos: %', SQLERRM;
        END;
    END;
END $$;

-- Políticas para retornos - tentar BIGINT primeiro
DO $$
BEGIN
    BEGIN
        CREATE POLICY "retornos_empresa_policy" ON retornos
        FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);
        RAISE NOTICE 'Política retornos criada com BIGINT';
    EXCEPTION WHEN OTHERS THEN
        BEGIN
            CREATE POLICY "retornos_empresa_policy" ON retornos
            FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::TEXT);
            RAISE NOTICE 'Política retornos criada com TEXT';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao criar política retornos: %', SQLERRM;
        END;
    END;
END $$;

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

