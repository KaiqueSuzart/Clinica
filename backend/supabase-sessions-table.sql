-- Tabela para sessões de tratamento
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

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_item_id ON treatment_sessions(treatment_item_id);
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_completed ON treatment_sessions(completed);
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_date ON treatment_sessions(date);

-- Função para atualizar o timestamp de updatedAt
CREATE OR REPLACE FUNCTION update_sessions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updatedAt automaticamente
CREATE TRIGGER update_treatment_sessions_updated_at 
  BEFORE UPDATE ON treatment_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_sessions_updated_at_column();

-- Comentários da tabela
COMMENT ON TABLE treatment_sessions IS 'Tabela para armazenar sessões individuais dos itens de tratamento';
COMMENT ON COLUMN treatment_sessions.session_number IS 'Número da sessão (1, 2, 3, etc.)';
COMMENT ON COLUMN treatment_sessions.completed IS 'Se a sessão foi concluída';
COMMENT ON COLUMN treatment_sessions.description IS 'Descrição do que foi feito na sessão';
