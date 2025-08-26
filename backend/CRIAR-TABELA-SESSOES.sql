-- =====================================================
-- SCRIPT PARA CRIAR A TABELA TREATMENT_SESSIONS
-- Execute este SQL diretamente no Supabase SQL Editor
-- =====================================================

-- 1. Criar a tabela principal
CREATE TABLE IF NOT EXISTS treatment_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_item_id UUID NOT NULL REFERENCES itens_plano_tratamento(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  date DATE,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_item_id ON treatment_sessions(treatment_item_id);
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_completed ON treatment_sessions(completed);
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_date ON treatment_sessions(date);

-- 3. Função para atualizar o timestamp de updatedAt
CREATE OR REPLACE FUNCTION update_sessions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Trigger para atualizar updatedAt automaticamente
CREATE TRIGGER update_treatment_sessions_updated_at 
  BEFORE UPDATE ON treatment_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_sessions_updated_at_column();

-- 5. Comentários da tabela
COMMENT ON TABLE treatment_sessions IS 'Tabela para armazenar sessões individuais dos itens de tratamento';
COMMENT ON COLUMN treatment_sessions.session_number IS 'Número da sessão (1, 2, 3, etc.)';
COMMENT ON COLUMN treatment_sessions.completed IS 'Se a sessão foi concluída';
COMMENT ON COLUMN treatment_sessions.description IS 'Descrição do que foi feito na sessão';

-- 6. Verificar se a tabela foi criada
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'treatment_sessions'
ORDER BY ordinal_position;

-- =====================================================
-- INSTRUÇÕES:
-- 1. Copie todo este conteúdo
-- 2. Vá para o Supabase Dashboard
-- 3. Clique em "SQL Editor"
-- 4. Cole o conteúdo e execute
-- 5. Verifique se não há erros
-- 6. Volte para a aplicação e teste novamente
-- =====================================================
