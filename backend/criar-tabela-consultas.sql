-- =========================================
-- CRIAR TABELA DE CONSULTAS - EXECUTE NO SUPABASE
-- =========================================

-- 1. Criar a tabela consultas se não existir
CREATE TABLE IF NOT EXISTS consultas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    empresa_id TEXT,
    cliente_id TEXT NOT NULL,
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

-- 2. Desabilitar RLS temporariamente para teste
ALTER TABLE consultas DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se a tabela foi criada
SELECT 'Tabela consultas criada com sucesso!' as status;

-- 4. Inserir algumas consultas de teste
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
    ('12', CURRENT_DATE, '14:00', 60, 'Consulta de rotina', 'Dr. Ana Silva', 'confirmado', 'Primeira consulta', 'Consulta'),
    ('12', CURRENT_DATE + 1, '15:30', 90, 'Limpeza', 'Dr. Ana Silva', 'pendente', 'Limpeza semestral', 'Limpeza')
ON CONFLICT DO NOTHING;

-- 5. Verificar os dados inseridos
SELECT COUNT(*) as total_consultas FROM consultas;

-- 6. Mostrar as consultas
SELECT 
    c.id,
    c.data_consulta,
    c.hora_inicio,
    cl.nome as paciente,
    c.procedimento,
    c.dentista_id,
    c.status
FROM consultas c
LEFT JOIN clientelA cl ON c.cliente_id = cl.id
ORDER BY c.data_consulta, c.hora_inicio;
