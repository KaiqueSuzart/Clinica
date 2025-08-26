-- =====================================================
-- SCRIPT PARA POPULAR SESSÕES JÁ REALIZADAS
-- =====================================================

-- Primeiro, vamos inserir sessões para os procedimentos que já têm anotações
-- Baseado nas anotações de tratamento já criadas

-- Buscar procedimento "Clareamento" (4 sessões estimadas, 4 sessões feitas)
INSERT INTO treatment_sessions (
    id,
    treatment_item_id,
    session_number,
    completed,
    session_date,
    notes,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    ipt.id,
    1,
    true,
    '2025-08-23'::date,
    'Sessão 1 - Clareamento iniciado',
    NOW(),
    NOW()
FROM itens_plano_tratamento ipt
JOIN plano_tratamento pt ON pt.id = ipt.plano_id
WHERE pt.paciente_id = 12 
AND ipt.procedimento = 'Clareamento'
AND NOT EXISTS (
    SELECT 1 FROM treatment_sessions ts 
    WHERE ts.treatment_item_id = ipt.id AND ts.session_number = 1
);

-- Sessão 2 do Clareamento
INSERT INTO treatment_sessions (
    id,
    treatment_item_id,
    session_number,
    completed,
    session_date,
    notes,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    ipt.id,
    2,
    true,
    '2025-08-23'::date,
    'Sessão 2 - Clareamento progredindo',
    NOW(),
    NOW()
FROM itens_plano_tratamento ipt
JOIN plano_tratamento pt ON pt.id = ipt.plano_id
WHERE pt.paciente_id = 12 
AND ipt.procedimento = 'Clareamento'
AND NOT EXISTS (
    SELECT 1 FROM treatment_sessions ts 
    WHERE ts.treatment_item_id = ipt.id AND ts.session_number = 2
);

-- Sessão 3 do Clareamento
INSERT INTO treatment_sessions (
    id,
    treatment_item_id,
    session_number,
    completed,
    session_date,
    notes,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    ipt.id,
    3,
    true,
    '2025-08-23'::date,
    'Sessão 3 - Clareamento avançado',
    NOW(),
    NOW()
FROM itens_plano_tratamento ipt
JOIN plano_tratamento pt ON pt.id = ipt.plano_id
WHERE pt.paciente_id = 12 
AND ipt.procedimento = 'Clareamento'
AND NOT EXISTS (
    SELECT 1 FROM treatment_sessions ts 
    WHERE ts.treatment_item_id = ipt.id AND ts.session_number = 3
);

-- Sessão 4 do Clareamento
INSERT INTO treatment_sessions (
    id,
    treatment_item_id,
    session_number,
    completed,
    session_date,
    notes,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    ipt.id,
    4,
    true,
    '2025-08-23'::date,
    'Sessão 4 - Clareamento finalizado',
    NOW(),
    NOW()
FROM itens_plano_tratamento ipt
JOIN plano_tratamento pt ON pt.id = ipt.plano_id
WHERE pt.paciente_id = 12 
AND ipt.procedimento = 'Clareamento'
AND NOT EXISTS (
    SELECT 1 FROM treatment_sessions ts 
    WHERE ts.treatment_item_id = ipt.id AND ts.session_number = 4
);

-- Sessões para Cirurgia (2 de 4 feitas)
INSERT INTO treatment_sessions (
    id,
    treatment_item_id,
    session_number,
    completed,
    session_date,
    notes,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    ipt.id,
    1,
    true,
    '2025-08-23'::date,
    'Sessão 1 - Cirurgia iniciada',
    NOW(),
    NOW()
FROM itens_plano_tratamento ipt
JOIN plano_tratamento pt ON pt.id = ipt.plano_id
WHERE pt.paciente_id = 12 
AND ipt.procedimento = 'Cirurgia'
AND NOT EXISTS (
    SELECT 1 FROM treatment_sessions ts 
    WHERE ts.treatment_item_id = ipt.id AND ts.session_number = 1
);

-- Sessão 2 da Cirurgia
INSERT INTO treatment_sessions (
    id,
    treatment_item_id,
    session_number,
    completed,
    session_date,
    notes,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    ipt.id,
    2,
    true,
    '2025-08-23'::date,
    'Sessão 2 - Cirurgia em andamento',
    NOW(),
    NOW()
FROM itens_plano_tratamento ipt
JOIN plano_tratamento pt ON pt.id = ipt.plano_id
WHERE pt.paciente_id = 12 
AND ipt.procedimento = 'Cirurgia'
AND NOT EXISTS (
    SELECT 1 FROM treatment_sessions ts 
    WHERE ts.treatment_item_id = ipt.id AND ts.session_number = 2
);

-- Criar sessões pendentes para os outros procedimentos
-- Sessões restantes da Cirurgia (3 e 4)
INSERT INTO treatment_sessions (
    id,
    treatment_item_id,
    session_number,
    completed,
    session_date,
    notes,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    ipt.id,
    3,
    false,
    NULL,
    'Sessão 3 - Pendente',
    NOW(),
    NOW()
FROM itens_plano_tratamento ipt
JOIN plano_tratamento pt ON pt.id = ipt.plano_id
WHERE pt.paciente_id = 12 
AND ipt.procedimento = 'Cirurgia'
AND NOT EXISTS (
    SELECT 1 FROM treatment_sessions ts 
    WHERE ts.treatment_item_id = ipt.id AND ts.session_number = 3
);

INSERT INTO treatment_sessions (
    id,
    treatment_item_id,
    session_number,
    completed,
    session_date,
    notes,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    ipt.id,
    4,
    false,
    NULL,
    'Sessão 4 - Pendente',
    NOW(),
    NOW()
FROM itens_plano_tratamento ipt
JOIN plano_tratamento pt ON pt.id = ipt.plano_id
WHERE pt.paciente_id = 12 
AND ipt.procedimento = 'Cirurgia'
AND NOT EXISTS (
    SELECT 1 FROM treatment_sessions ts 
    WHERE ts.treatment_item_id = ipt.id AND ts.session_number = 4
);

-- Criar todas as sessões para Limpeza (0 de 4 feitas)
INSERT INTO treatment_sessions (
    id,
    treatment_item_id,
    session_number,
    completed,
    session_date,
    notes,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    ipt.id,
    generate_series(1, 4),
    false,
    NULL,
    'Sessão ' || generate_series(1, 4) || ' - Pendente',
    NOW(),
    NOW()
FROM itens_plano_tratamento ipt
JOIN plano_tratamento pt ON pt.id = ipt.plano_id
WHERE pt.paciente_id = 12 
AND ipt.procedimento = 'Limpeza'
AND NOT EXISTS (
    SELECT 1 FROM treatment_sessions ts 
    WHERE ts.treatment_item_id = ipt.id
);

-- Criar todas as sessões para Prótese (0 de 2 feitas)
INSERT INTO treatment_sessions (
    id,
    treatment_item_id,
    session_number,
    completed,
    session_date,
    notes,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    ipt.id,
    generate_series(1, 2),
    false,
    NULL,
    'Sessão ' || generate_series(1, 2) || ' - Pendente',
    NOW(),
    NOW()
FROM itens_plano_tratamento ipt
JOIN plano_tratamento pt ON pt.id = ipt.plano_id
WHERE pt.paciente_id = 12 
AND ipt.procedimento = 'Prótese'
AND NOT EXISTS (
    SELECT 1 FROM treatment_sessions ts 
    WHERE ts.treatment_item_id = ipt.id
);

-- Verificar resultados
SELECT 
    pt.titulo as plano_titulo,
    ipt.procedimento,
    ipt.sessoes_estimadas,
    COUNT(ts.id) as total_sessoes,
    COUNT(CASE WHEN ts.completed = true THEN 1 END) as sessoes_completas,
    COUNT(CASE WHEN ts.completed = false THEN 1 END) as sessoes_pendentes
FROM plano_tratamento pt
JOIN itens_plano_tratamento ipt ON pt.id = ipt.plano_id
LEFT JOIN treatment_sessions ts ON ipt.id = ts.treatment_item_id
WHERE pt.paciente_id = 12
GROUP BY pt.titulo, ipt.procedimento, ipt.sessoes_estimadas
ORDER BY pt.titulo, ipt.procedimento;

COMMIT;
