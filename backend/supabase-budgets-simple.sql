-- Script simples para criar tabelas de orçamentos
-- Execute este script se houver problemas com foreign keys

-- Criar tabela de orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    empresa_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    cliente_id UUID NOT NULL,
    dentista_id UUID,
    descricao TEXT,
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    desconto DECIMAL(10,2) DEFAULT 0,
    valor_final DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'recusado', 'cancelado')),
    data_validade DATE NOT NULL,
    observacoes TEXT,
    forma_pagamento VARCHAR(50),
    parcelas INTEGER DEFAULT 1 CHECK (parcelas >= 1 AND parcelas <= 60)
);

-- Criar tabela de itens do orçamento
CREATE TABLE IF NOT EXISTS itens_orcamento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    orcamento_id UUID NOT NULL,
    descricao TEXT NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (valor_unitario >= 0),
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
    observacoes TEXT
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente_id ON orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_data_validade ON orcamentos(data_validade);
CREATE INDEX IF NOT EXISTS idx_orcamentos_created_at ON orcamentos(created_at);
CREATE INDEX IF NOT EXISTS idx_itens_orcamento_orcamento_id ON itens_orcamento(orcamento_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_orcamento ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para orçamentos
DROP POLICY IF EXISTS "orcamentos_policy" ON orcamentos;
CREATE POLICY "orcamentos_policy" ON orcamentos
    FOR ALL USING (true);

-- Criar políticas RLS para itens do orçamento
DROP POLICY IF EXISTS "itens_orcamento_policy" ON itens_orcamento;
CREATE POLICY "itens_orcamento_policy" ON itens_orcamento
    FOR ALL USING (true);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_orcamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_itens_orcamento_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para updated_at
DROP TRIGGER IF EXISTS update_orcamentos_updated_at ON orcamentos;
CREATE TRIGGER update_orcamentos_updated_at
    BEFORE UPDATE ON orcamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_orcamentos_updated_at();

DROP TRIGGER IF EXISTS update_itens_orcamento_updated_at ON itens_orcamento;
CREATE TRIGGER update_itens_orcamento_updated_at
    BEFORE UPDATE ON itens_orcamento
    FOR EACH ROW
    EXECUTE FUNCTION update_itens_orcamento_updated_at();

-- Adicionar foreign keys depois de criar as tabelas (se as tabelas referenciadas existirem)
-- Descomente as linhas abaixo se as tabelas clientelA, usuarios e empresa existirem

-- ALTER TABLE orcamentos 
-- ADD CONSTRAINT fk_orcamentos_cliente FOREIGN KEY (cliente_id) REFERENCES "clientelA"(id) ON DELETE CASCADE;

-- ALTER TABLE orcamentos 
-- ADD CONSTRAINT fk_orcamentos_dentista FOREIGN KEY (dentista_id) REFERENCES usuarios(id) ON DELETE SET NULL;

-- ALTER TABLE orcamentos 
-- ADD CONSTRAINT fk_orcamentos_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE;

-- ALTER TABLE itens_orcamento 
-- ADD CONSTRAINT fk_itens_orcamento_orcamento FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE;
