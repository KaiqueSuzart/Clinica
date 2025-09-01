-- =============================================
-- CORREÇÃO FINAL DA TABELA CONSULTAS
-- =============================================

-- 1. Apagar tabela se existir
DROP TABLE IF EXISTS consultas CASCADE;

-- 2. Criar tabela com tipos corretos
CREATE TABLE consultas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    empresa_id TEXT,
    cliente_id INTEGER NOT NULL,
    dentista_id TEXT, -- CORRIGIDO: TEXT em vez de UUID
    data_consulta DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    duracao_minutos INTEGER DEFAULT 60,
    tipo_consulta TEXT,
    procedimento TEXT NOT NULL,
    observacoes TEXT,
    status TEXT DEFAULT 'pendente',
    valor NUMERIC,
    forma_pagamento TEXT,
    pago BOOLEAN DEFAULT FALSE
);

-- 3. Desabilitar RLS
ALTER TABLE consultas DISABLE ROW LEVEL SECURITY;

-- 4. Teste de inserção
INSERT INTO consultas (
    cliente_id, 
    data_consulta, 
    hora_inicio, 
    procedimento, 
    dentista_id, 
    status
) VALUES 
    (12, CURRENT_DATE, '14:00', 'Consulta de teste', 'Dr. Ana Silva', 'pendente');

-- 5. Verificar
SELECT 'Tabela consultas corrigida com sucesso!' as status;
SELECT * FROM consultas;
