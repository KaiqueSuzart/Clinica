-- =====================================================
-- SISTEMA MULTI-TENANT CORRIGIDO - COMPATÍVEL COM BIGINT
-- =====================================================
-- Execute este SQL no Supabase para configurar multi-tenancy
-- =====================================================

-- 1. CRIAR TABELA DE EMPRESAS (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS empresa (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nome VARCHAR(255) NOT NULL,
  telefone_empresa VARCHAR(20),
  inativa BOOLEAN DEFAULT FALSE,
  email_empresa VARCHAR(255) UNIQUE NOT NULL,
  endereco TEXT,
  cnpj VARCHAR(18) UNIQUE,
  logo_url TEXT,
  configuracoes JSONB DEFAULT '{}',
  plano VARCHAR(50) DEFAULT 'basico' CHECK (plano IN ('basico', 'premium', 'enterprise')),
  ativo BOOLEAN DEFAULT TRUE
);

-- 2. CRIAR TABELA DE USUÁRIOS (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  empresa_id BIGINT NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  cargo VARCHAR(100) DEFAULT 'funcionario',
  avatar_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  permissoes JSONB DEFAULT '{"pacientes": true, "agendamentos": true, "orcamentos": true}',
  ultimo_login TIMESTAMP WITH TIME ZONE,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'dentista', 'recepcionista', 'user')),
  auth_user_id UUID UNIQUE
);

-- 3. CRIAR TABELA DE SESSÕES DE USUÁRIO
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  empresa_id BIGINT NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  ip_address INET,
  user_agent TEXT
);

-- 4. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para empresa
CREATE POLICY "empresa_policy" ON empresa
  FOR ALL USING (true);

-- Políticas para usuários (isolamento por empresa)
CREATE POLICY "usuarios_empresa_policy" ON usuarios
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- Políticas para sessões
CREATE POLICY "user_sessions_policy" ON user_sessions
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- 5. CRIAR FUNÇÕES AUXILIARES
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

-- 6. CRIAR TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Trigger para empresa
CREATE OR REPLACE FUNCTION update_empresa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_empresa_updated_at
  BEFORE UPDATE ON empresa
  FOR EACH ROW
  EXECUTE FUNCTION update_empresa_updated_at();

-- Trigger para usuarios
CREATE OR REPLACE FUNCTION update_usuarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_usuarios_updated_at();

-- 7. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_id ON usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_empresa_id ON user_sessions(empresa_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_empresa_email ON empresa(email_empresa);
CREATE INDEX IF NOT EXISTS idx_empresa_cnpj ON empresa(cnpj);

-- 8. INSERIR DADOS DE EXEMPLO
-- =====================================================

-- Inserir empresa de exemplo (usando BIGINT)
INSERT INTO empresa (id, nome, email_empresa, cnpj, plano) 
VALUES (
  1,
  'Clínica Odontológica Exemplo',
  'contato@clinicaexemplo.com',
  '12.345.678/0001-90',
  'premium'
) ON CONFLICT (id) DO NOTHING;

-- 9. CONFIGURAR POLÍTICAS RLS PARA OUTRAS TABELAS
-- =====================================================

-- Habilitar RLS em tabelas existentes
ALTER TABLE "clientelA" ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE retornos ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes (isolamento por empresa)
DROP POLICY IF EXISTS "clientelA_empresa_policy" ON "clientelA";
CREATE POLICY "clientelA_empresa_policy" ON "clientelA"
  FOR ALL USING (empresa = current_setting('app.current_empresa_id')::TEXT);

-- Políticas para consultas
DROP POLICY IF EXISTS "consultas_empresa_policy" ON consultas;
CREATE POLICY "consultas_empresa_policy" ON consultas
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- Políticas para orçamentos
DROP POLICY IF EXISTS "orcamentos_empresa_policy" ON orcamentos;
CREATE POLICY "orcamentos_empresa_policy" ON orcamentos
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- Políticas para retornos
DROP POLICY IF EXISTS "retornos_empresa_policy" ON retornos;
CREATE POLICY "retornos_empresa_policy" ON retornos
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::BIGINT);

-- 10. CRIAR VIEWS PARA DADOS ISOLADOS
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

-- 11. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE empresa IS 'Tabela de empresas para sistema multi-tenant';
COMMENT ON TABLE usuarios IS 'Usuários do sistema com isolamento por empresa';
COMMENT ON TABLE user_sessions IS 'Sessões ativas dos usuários';
COMMENT ON FUNCTION get_user_empresa_id(UUID) IS 'Retorna o ID da empresa do usuário';
COMMENT ON FUNCTION user_belongs_to_empresa(UUID, BIGINT) IS 'Verifica se usuário pertence à empresa';
COMMENT ON FUNCTION create_user_with_empresa(UUID, BIGINT, VARCHAR, VARCHAR, VARCHAR, VARCHAR) IS 'Cria usuário e associa à empresa';

