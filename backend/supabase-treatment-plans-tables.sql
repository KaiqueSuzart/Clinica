-- Tabela para planos de tratamento
CREATE TABLE IF NOT EXISTS treatment_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patientId UUID NOT NULL REFERENCES clientelA(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  totalCost DECIMAL(10,2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para itens do plano de tratamento
CREATE TABLE IF NOT EXISTS treatment_plan_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  treatmentPlanId UUID NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
  procedure TEXT NOT NULL,
  description TEXT NOT NULL,
  tooth TEXT,
  priority TEXT CHECK (priority IN ('alta', 'media', 'baixa')) DEFAULT 'media',
  estimatedCost DECIMAL(10,2) NOT NULL DEFAULT 0,
  estimatedSessions INTEGER NOT NULL DEFAULT 1,
  status TEXT CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'cancelado')) DEFAULT 'planejado',
  startDate TIMESTAMP WITH TIME ZONE,
  completionDate TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient_id ON treatment_plans(patientId);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_created_at ON treatment_plans(createdAt);
CREATE INDEX IF NOT EXISTS idx_treatment_plan_items_plan_id ON treatment_plan_items(treatmentPlanId);
CREATE INDEX IF NOT EXISTS idx_treatment_plan_items_status ON treatment_plan_items(status);
CREATE INDEX IF NOT EXISTS idx_treatment_plan_items_order ON treatment_plan_items(order_index);

-- Função para atualizar o timestamp de updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updatedAt automaticamente
CREATE TRIGGER update_treatment_plans_updated_at 
  BEFORE UPDATE ON treatment_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_plan_items_updated_at 
  BEFORE UPDATE ON treatment_plan_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular o progresso total do plano
CREATE OR REPLACE FUNCTION calculate_plan_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o progresso do plano quando um item for modificado
  UPDATE treatment_plans 
  SET progress = (
    SELECT ROUND(
      (COUNT(CASE WHEN status = 'concluido' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100
    )
    FROM treatment_plan_items 
    WHERE treatmentPlanId = NEW.treatmentPlanId
  )
  WHERE id = NEW.treatmentPlanId;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para recalcular progresso quando itens são modificados
CREATE TRIGGER update_plan_progress_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON treatment_plan_items
  FOR EACH ROW EXECUTE FUNCTION calculate_plan_progress();

-- Função para calcular o custo total do plano
CREATE OR REPLACE FUNCTION calculate_plan_total_cost()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o custo total do plano quando um item for modificado
  UPDATE treatment_plans 
  SET totalCost = (
    SELECT COALESCE(SUM(estimatedCost), 0)
    FROM treatment_plan_items 
    WHERE treatmentPlanId = NEW.treatmentPlanId
  )
  WHERE id = NEW.treatmentPlanId;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para recalcular custo total quando itens são modificados
CREATE TRIGGER update_plan_total_cost_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON treatment_plan_items
  FOR EACH ROW EXECUTE FUNCTION calculate_plan_total_cost();

-- Políticas RLS (Row Level Security) se necessário
-- ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE treatment_plan_items ENABLE ROW LEVEL SECURITY;

-- Comentários das tabelas
COMMENT ON TABLE treatment_plans IS 'Tabela para armazenar planos de tratamento dos pacientes';
COMMENT ON TABLE treatment_plan_items IS 'Tabela para armazenar itens individuais dos planos de tratamento';
COMMENT ON COLUMN treatment_plans.progress IS 'Progresso do plano em porcentagem (0-100)';
COMMENT ON COLUMN treatment_plan_items.priority IS 'Prioridade do item: alta, media, baixa';
COMMENT ON COLUMN treatment_plan_items.status IS 'Status do item: planejado, em_andamento, concluido, cancelado';
COMMENT ON COLUMN treatment_plan_items.order_index IS 'Ordem de execução do item no plano';
