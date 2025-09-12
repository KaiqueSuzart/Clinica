-- =========================================
-- DADOS DE TESTE PARA SISTEMA DE AGENDAMENTO
-- =========================================

-- 1. Inserir alguns pacientes de teste (se não existirem)
INSERT INTO clientelA (id, nome, telefone, email, data_nascimento, created_at, updated_at) 
VALUES 
    ('1', 'João Santos', '(11) 99999-9999', 'joao@email.com', '1985-05-15', NOW(), NOW()),
    ('2', 'Maria Oliveira', '(11) 88888-8888', 'maria@email.com', '1990-08-22', NOW(), NOW()),
    ('3', 'Carlos Pereira', '(11) 77777-7777', 'carlos@email.com', '1978-12-10', NOW(), NOW()),
    ('4', 'Ana Costa', '(11) 66666-6666', 'ana@email.com', '1992-03-18', NOW(), NOW()),
    ('5', 'Pedro Silva', '(11) 55555-5555', 'pedro@email.com', '1988-11-25', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    telefone = EXCLUDED.telefone,
    email = EXCLUDED.email,
    updated_at = NOW();

-- 2. Inserir consultas de teste
INSERT INTO consultas (
    cliente_id, 
    data_consulta, 
    hora_inicio, 
    duracao_minutos, 
    procedimento, 
    dentista_id, 
    status, 
    observacoes,
    tipo_consulta,
    created_at,
    updated_at
) VALUES 
    -- Consultas para hoje
    ('1', CURRENT_DATE, '14:00', 60, 'Consulta de rotina', 'Dr. Ana Silva', 'confirmado', 'Primeira consulta do paciente', 'Consulta', NOW(), NOW()),
    ('2', CURRENT_DATE, '15:30', 90, 'Limpeza', 'Dr. Ana Silva', 'pendente', 'Limpeza semestral', 'Limpeza', NOW(), NOW()),
    
    -- Consultas para amanhã
    ('3', CURRENT_DATE + INTERVAL '1 day', '09:00', 120, 'Tratamento de Canal', 'Dr. Pedro Costa', 'confirmado', 'Segunda sessão do canal', 'Tratamento', NOW(), NOW()),
    ('4', CURRENT_DATE + INTERVAL '1 day', '10:30', 60, 'Consulta', 'Dr. Ana Silva', 'pendente', 'Avaliação inicial', 'Consulta', NOW(), NOW()),
    ('5', CURRENT_DATE + INTERVAL '1 day', '16:00', 90, 'Restauração', 'Dr. Pedro Costa', 'confirmado', 'Restauração dente 16', 'Restauração', NOW(), NOW()),
    
    -- Consultas para próxima semana
    ('1', CURRENT_DATE + INTERVAL '7 days', '14:30', 60, 'Retorno', 'Dr. Ana Silva', 'pendente', 'Retorno pós-limpeza', 'Retorno', NOW(), NOW()),
    ('2', CURRENT_DATE + INTERVAL '8 days', '10:00', 180, 'Clareamento', 'Dr. Ana Silva', 'pendente', 'Clareamento dental completo', 'Clareamento', NOW(), NOW()),
    
    -- Consultas já realizadas (histórico)
    ('3', CURRENT_DATE - INTERVAL '7 days', '15:00', 90, 'Limpeza', 'Dr. Ana Silva', 'realizado', 'Limpeza realizada com sucesso', 'Limpeza', NOW(), NOW()),
    ('4', CURRENT_DATE - INTERVAL '14 days', '09:30', 60, 'Consulta inicial', 'Dr. Pedro Costa', 'realizado', 'Primeira consulta - diagnóstico', 'Consulta', NOW(), NOW()),
    
    -- Consulta cancelada
    ('5', CURRENT_DATE + INTERVAL '2 days', '11:00', 60, 'Consulta', 'Dr. Ana Silva', 'cancelado', 'Paciente cancelou por motivos pessoais', 'Consulta', NOW(), NOW())

ON CONFLICT DO NOTHING;

-- 3. Verificar os dados inseridos
SELECT 'Dados de teste inseridos com sucesso!' as status;

-- 4. Mostrar resumo dos dados
SELECT 
    'Pacientes cadastrados: ' || COUNT(*) as info
FROM clientelA 
WHERE id IN ('1', '2', '3', '4', '5');

SELECT 
    'Consultas inseridas: ' || COUNT(*) as info
FROM consultas;

-- 5. Mostrar consultas por status
SELECT 
    status,
    COUNT(*) as quantidade
FROM consultas 
GROUP BY status
ORDER BY status;

-- 6. Mostrar próximas consultas (próximos 7 dias)
SELECT 
    c.data_consulta,
    c.hora_inicio,
    cl.nome as paciente,
    c.procedimento,
    c.dentista_id as dentista,
    c.status
FROM consultas c
JOIN clientelA cl ON c.cliente_id = cl.id
WHERE c.data_consulta BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY c.data_consulta, c.hora_inicio;






