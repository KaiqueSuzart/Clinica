-- Tabela para planos de tratamento (usando os nomes que o backend espera)
CREATE TABLE IF NOT EXISTS plano_tratamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  custo_total DECIMAL(10,2) DEFAULT 0,
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para itens do plano de tratamento
CREATE TABLE IF NOT EXISTS itens_plano_tratamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plano_id UUID NOT NULL REFERENCES plano_tratamento(id) ON DELETE CASCADE,
  procedimento TEXT NOT NULL,
  descricao TEXT NOT NULL,
  dente TEXT,
  prioridade TEXT CHECK (prioridade IN ('alta', 'media', 'baixa')) DEFAULT 'media',
  custo_estimado DECIMAL(10,2) NOT NULL DEFAULT 0,
  sessoes_estimadas INTEGER NOT NULL DEFAULT 1,
  status TEXT CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'cancelado')) DEFAULT 'planejado',
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
CREATE INDEX IF NOT EXISTS idx_plano_tratamento_paciente_id ON plano_tratamento(paciente_id);
CREATE INDEX IF NOT EXISTS idx_plano_tratamento_created_at ON plano_tratamento(created_at);
CREATE INDEX IF NOT EXISTS idx_itens_plano_tratamento_plano_id ON itens_plano_tratamento(plano_id);
CREATE INDEX IF NOT EXISTS idx_itens_plano_tratamento_status ON itens_plano_tratamento(status);
CREATE INDEX IF NOT EXISTS idx_itens_plano_tratamento_ordem ON itens_plano_tratamento(ordem);
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_item_id ON treatment_sessions(treatment_item_id);
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_completed ON treatment_sessions(completed);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_plano_tratamento_updated_at 
  BEFORE UPDATE ON plano_tratamento 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itens_plano_tratamento_updated_at 
  BEFORE UPDATE ON itens_plano_tratamento 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_sessions_updated_at 
  BEFORE UPDATE ON treatment_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários das tabelas
COMMENT ON TABLE plano_tratamento IS 'Tabela para armazenar planos de tratamento dos pacientes';
COMMENT ON TABLE itens_plano_tratamento IS 'Tabela para armazenar itens individuais dos planos de tratamento';
COMMENT ON TABLE treatment_sessions IS 'Tabela para armazenar sessões individuais dos itens de tratamento';
COMMENT ON COLUMN plano_tratamento.progresso IS 'Progresso do plano em porcentagem (0-100)';
COMMENT ON COLUMN itens_plano_tratamento.prioridade IS 'Prioridade do item: alta, media, baixa';
COMMENT ON COLUMN itens_plano_tratamento.status IS 'Status do item: planejado, em_andamento, concluido, cancelado';
COMMENT ON COLUMN itens_plano_tratamento.ordem IS 'Ordem de execução do item no plano';
COMMENT ON COLUMN treatment_sessions.session_number IS 'Número da sessão (1, 2, 3, etc.)';
COMMENT ON COLUMN treatment_sessions.completed IS 'Se a sessão foi concluída';













