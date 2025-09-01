-- =============================================
-- CORRIGIR TABELA CONSULTAS - EXECUTE NO SUPABASE
-- =============================================

-- 1. Apagar tabela se existir (para começar do zero)
DROP TABLE IF EXISTS consultas CASCADE;

-- 2. Criar tabela consultas com tipos corretos
CREATE TABLE consultas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    empresa_id TEXT,
    cliente_id INTEGER NOT NULL, -- IMPORTANTE: INTEGER para corresponder aos IDs dos pacientes
    dentista_id TEXT,
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

-- 3. Desabilitar RLS (Row Level Security) para testes
ALTER TABLE consultas DISABLE ROW LEVEL SECURITY;

-- 4. Inserir dados de teste
INSERT INTO consultas (
    cliente_id, 
    data_consulta, 
    hora_inicio, 
    duracao_minutos, 
    procedimento, 
    dentista_id, 
    status, 
    observacoes,
    tipo_consulta
) VALUES 
    (12, CURRENT_DATE, '14:00', 60, 'Consulta de rotina', 'Dr. Ana Silva', 'confirmado', 'Primeira consulta', 'Consulta'),
    (12, CURRENT_DATE + 1, '15:30', 90, 'Limpeza', 'Dr. Ana Silva', 'pendente', 'Limpeza semestral', 'Limpeza')
ON CONFLICT DO NOTHING;

-- 5. Verificar se funcionou
SELECT 'Tabela consultas criada com sucesso!' as status;
SELECT COUNT(*) as total_consultas FROM consultas;

-- 6. Mostrar as consultas criadas
SELECT 
    c.id,
    c.data_consulta,
    c.hora_inicio,
    cl.nome as paciente,
    c.procedimento,
    c.dentista_id,
    c.status
FROM consultas c
LEFT JOIN "clientelA" cl ON c.cliente_id = cl.id
ORDER BY c.data_consulta, c.hora_inicio;
