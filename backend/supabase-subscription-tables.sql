-- Tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco_mensal DECIMAL(10,2) NOT NULL,
  limite_pacientes INTEGER,
  limite_usuarios INTEGER,
  recursos_incluidos JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de assinaturas das empresas
CREATE TABLE IF NOT EXISTS empresa_subscriptions (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, cancelled, expired
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fim TIMESTAMP WITH TIME ZONE,
  proxima_cobranca TIMESTAMP WITH TIME ZONE,
  valor_mensal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cobranças do chatbot (custos variáveis)
CREATE TABLE IF NOT EXISTS chatbot_billing (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  data_cobranca DATE NOT NULL,
  tokens_utilizados INTEGER DEFAULT 0,
  custo_tokens DECIMAL(10,4) DEFAULT 0.00,
  custo_railway DECIMAL(10,4) DEFAULT 0.00,
  custo_total DECIMAL(10,4) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de pagamentos
CREATE TABLE IF NOT EXISTS payment_history (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL, -- subscription, chatbot
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metodo_pagamento VARCHAR(50),
  status VARCHAR(20) DEFAULT 'completed', -- completed, failed, pending, refunded
  referencia_externa VARCHAR(255), -- ID do gateway de pagamento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir planos padrão
INSERT INTO subscription_plans (nome, descricao, preco_mensal, limite_pacientes, limite_usuarios, recursos_incluidos) VALUES
('Básico', 'Plano básico para clínicas pequenas', 99.90, 100, 3, '{"agenda": true, "pacientes": true, "orcamentos": true, "relatorios": false, "api": false}'),
('Profissional', 'Plano profissional para clínicas médias', 199.90, 500, 10, '{"agenda": true, "pacientes": true, "orcamentos": true, "relatorios": true, "api": true, "suporte_prioritario": true}'),
('Empresarial', 'Plano empresarial para grandes clínicas', 399.90, 2000, 50, '{"agenda": true, "pacientes": true, "orcamentos": true, "relatorios": true, "api": true, "suporte_prioritario": true, "customizacao": true, "integracao_terceiros": true}');

-- RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresa_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Políticas para subscription_plans (todos podem ver)
CREATE POLICY "Todos podem ver planos" ON subscription_plans FOR SELECT USING (true);

-- Políticas para empresa_subscriptions
CREATE POLICY "Empresas veem suas assinaturas" ON empresa_subscriptions 
  FOR ALL USING (empresa_id = (SELECT id FROM empresa WHERE id = empresa_id));

-- Políticas para chatbot_billing
CREATE POLICY "Empresas veem suas cobranças de chatbot" ON chatbot_billing 
  FOR ALL USING (empresa_id = (SELECT id FROM empresa WHERE id = empresa_id));

-- Políticas para payment_history
CREATE POLICY "Empresas veem seu histórico de pagamentos" ON payment_history 
  FOR ALL USING (empresa_id = (SELECT id FROM empresa WHERE id = empresa_id));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_empresa_subscriptions_empresa_id ON empresa_subscriptions(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresa_subscriptions_status ON empresa_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_billing_empresa_id ON chatbot_billing(empresa_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_billing_data ON chatbot_billing(data_cobranca);
CREATE INDEX IF NOT EXISTS idx_payment_history_empresa_id ON payment_history(empresa_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_data ON payment_history(data_pagamento);
