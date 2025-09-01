-- =========================================
-- SOLUÇÃO RÁPIDA - SISTEMA DE AGENDAMENTO
-- Execute este SQL no Supabase SQL Editor
-- =========================================

-- 1. Verificar se a tabela consultas existe
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'consultas';

-- 2. Se não existir, criar a tabela consultas
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

-- 3. Desabilitar RLS temporariamente para teste
ALTER TABLE consultas DISABLE ROW LEVEL SECURITY;

-- 4. Inserir pacientes de teste (se não existirem)
INSERT INTO clientelA (id, nome, telefone, email, data_nascimento, created_at, updated_at) 
VALUES 
    ('1', 'João Santos', '(11) 99999-9999', 'joao@email.com', '1985-05-15', NOW(), NOW()),
    ('2', 'Maria Oliveira', '(11) 88888-8888', 'maria@email.com', '1990-08-22', NOW(), NOW()),
    ('3', 'Carlos Pereira', '(11) 77777-7777', 'carlos@email.com', '1978-12-10', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Inserir consultas de teste
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
    ('1', CURRENT_DATE, '14:00', 60, 'Consulta de rotina', 'Dr. Ana Silva', 'confirmado', 'Primeira consulta', 'Consulta'),
    ('2', CURRENT_DATE, '15:30', 90, 'Limpeza', 'Dr. Ana Silva', 'pendente', 'Limpeza semestral', 'Limpeza'),
    ('3', CURRENT_DATE + 1, '09:00', 120, 'Tratamento de Canal', 'Dr. Pedro Costa', 'confirmado', 'Segunda sessão', 'Tratamento'),
    ('1', CURRENT_DATE + 1, '10:30', 60, 'Retorno', 'Dr. Ana Silva', 'pendente', 'Avaliação pós-limpeza', 'Retorno'),
    ('2', CURRENT_DATE + 2, '16:00', 90, 'Restauração', 'Dr. Pedro Costa', 'confirmado', 'Restauração dente 16', 'Restauração')
ON CONFLICT DO NOTHING;

-- 6. Verificar se os dados foram inseridos
SELECT 'Dados inseridos com sucesso!' as status;
SELECT COUNT(*) as total_consultas FROM consultas;
SELECT COUNT(*) as total_pacientes FROM clientelA WHERE id IN ('1', '2', '3');

-- 7. Mostrar as consultas criadas
SELECT 
    c.data_consulta,
    c.hora_inicio,
    cl.nome as paciente,
    c.procedimento,
    c.dentista_id,
    c.status
FROM consultas c
LEFT JOIN clientelA cl ON c.cliente_id = cl.id
ORDER BY c.data_consulta, c.hora_inicio;

