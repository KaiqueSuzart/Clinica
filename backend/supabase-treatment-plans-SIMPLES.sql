-- ============================================================
-- SCRIPT SQL PARA PLANOS DE TRATAMENTO
-- Execute este código no SQL Editor do Supabase
-- ============================================================

-- 1. Criar tabela principal de planos de tratamento
CREATE TABLE IF NOT EXISTS treatment_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patientId UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  totalCost DECIMAL(10,2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de itens do plano
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

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient_id ON treatment_plans(patientId);
CREATE INDEX IF NOT EXISTS idx_treatment_plan_items_plan_id ON treatment_plan_items(treatmentPlanId);

-- 4. Adicionar chave estrangeira para pacientes (se a tabela clientelA existir)
-- ALTER TABLE treatment_plans ADD CONSTRAINT fk_treatment_plans_patient 
-- FOREIGN KEY (patientId) REFERENCES clientelA(id) ON DELETE CASCADE;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
