-- =====================================================
-- CORREÇÕES FINAIS - APENAS OS ERROS RESTANTES
-- =====================================================
-- Execute este SQL para corrigir os últimos erros
-- =====================================================

-- 1. ADICIONAR COLUNA PLANO NA TABELA EMPRESA
-- =====================================================
ALTER TABLE empresa 
ADD COLUMN IF NOT EXISTS plano VARCHAR(50) DEFAULT 'basico' CHECK (plano IN ('basico', 'premium', 'enterprise'));

-- 2. INSERIR DADOS DE EXEMPLO (SEM A COLUNA PLANO)
-- =====================================================
INSERT INTO empresa (id, nome, email_empresa, cnpj) 
VALUES (
  1,
  'Clínica Odontológica Exemplo',
  'contato@clinicaexemplo.com',
  '12.345.678/0001-90'
) ON CONFLICT (id) DO NOTHING;

-- 3. CORRIGIR POLÍTICAS RLS - VERIFICAR TIPOS DAS COLUNAS
-- =====================================================

-- Primeiro, vamos verificar os tipos das colunas
-- (Execute estas consultas para ver os tipos)

-- Verificar tipo da coluna empresa na tabela clientelA
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'clientelA' AND column_name = 'empresa';

-- Verificar tipo da coluna empresa_id nas outras tabelas
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name IN ('consultas', 'orcamentos', 'retornos') AND column_name = 'empresa_id';

-- 4. POLÍTICAS RLS CORRIGIDAS (BASEADAS NOS TIPOS REAIS)
-- =====================================================

-- Políticas para clientes (assumindo que empresa é TEXT)
DROP POLICY IF EXISTS "clientelA_empresa_policy" ON "clientelA";
CREATE POLICY "clientelA_empresa_policy" ON "clientelA"
  FOR ALL USING (empresa = current_setting('app.current_empresa_id')::TEXT);

-- Políticas para consultas (assumindo que empresa_id é BIGINT)
DROP POLICY IF EXISTS "consultas_empresa_policy" ON consultas;
CREATE POLICY "consultas_empresa_policy" ON consultas
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- Políticas para orçamentos (assumindo que empresa_id é BIGINT)
DROP POLICY IF EXISTS "orcamentos_empresa_policy" ON orcamentos;
CREATE POLICY "orcamentos_empresa_policy" ON orcamentos
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- Políticas para retornos (assumindo que empresa_id é BIGINT)
DROP POLICY IF EXISTS "retornos_empresa_policy" ON retornos;
CREATE POLICY "retornos_empresa_policy" ON retornos
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- 5. CRIAR VIEWS PARA DADOS ISOLADOS
-- =====================================================

-- View para usuários da empresa atual
CREATE OR REPLACE VIEW current_company_users AS
SELECT u.*, e.nome as empresa_nome
FROM usuarios u
JOIN empresa e ON u.empresa_id = e.id
WHERE u.empresa_id = current_setting('app.current_empresa_id')::BIGINT;

-- View para clientes da empresa atual
CREATE OR REPLACE VIEW current_company_clients AS
SELECT c.*
FROM "clientelA" c
WHERE c.empresa = current_setting('app.current_empresa_id')::TEXT;

-- 6. CRIAR FUNÇÕES AUXILIARES
-- =====================================================

-- Função para obter empresa do usuário atual
CREATE OR REPLACE FUNCTION get_user_empresa_id(user_uuid UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT empresa_id 
    FROM usuarios 
    WHERE auth_user_id = user_uuid 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário pertence à empresa
CREATE OR REPLACE FUNCTION user_belongs_to_empresa(user_uuid UUID, empresa_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM usuarios 
    WHERE auth_user_id = user_uuid 
    AND empresa_id = empresa_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar usuário e associar à empresa
CREATE OR REPLACE FUNCTION create_user_with_empresa(
  p_auth_user_id UUID,
  p_empresa_id BIGINT,
  p_nome VARCHAR(255),
  p_email VARCHAR(255),
  p_cargo VARCHAR(100) DEFAULT 'funcionario',
  p_role VARCHAR(50) DEFAULT 'user'
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO usuarios (auth_user_id, empresa_id, nome, email, cargo, role)
  VALUES (p_auth_user_id, p_empresa_id, p_nome, p_email, p_cargo, p_role)
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE empresa IS 'Tabela de empresas para sistema multi-tenant';
COMMENT ON TABLE usuarios IS 'Usuários do sistema com isolamento por empresa';
COMMENT ON TABLE user_sessions IS 'Sessões ativas dos usuários';
COMMENT ON FUNCTION get_user_empresa_id(UUID) IS 'Retorna o ID da empresa do usuário';
COMMENT ON FUNCTION user_belongs_to_empresa(UUID, BIGINT) IS 'Verifica se usuário pertence à empresa';
COMMENT ON FUNCTION create_user_with_empresa(UUID, BIGINT, VARCHAR, VARCHAR, VARCHAR, VARCHAR) IS 'Cria usuário e associa à empresa';

-- 8. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
-- =====================================================

-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('empresa', 'usuarios', 'user_sessions');

-- Verificar se as colunas existem
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name IN ('auth_user_id', 'empresa_id');

-- Verificar se os triggers existem
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name IN ('update_empresa_updated_at', 'update_usuarios_updated_at');

-- Verificar se as políticas RLS existem
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('empresa', 'usuarios', 'user_sessions', 'clientelA', 'consultas', 'orcamentos', 'retornos');

