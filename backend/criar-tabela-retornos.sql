-- =========================================
-- CRIAR TABELA DE RETORNOS - EXECUTE NO SUPABASE
-- =========================================

-- 1. Criar a tabela retornos se não existir
CREATE TABLE IF NOT EXISTS retornos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    empresa_id TEXT,
    cliente_id INTEGER NOT NULL, -- INTEGER para corresponder aos IDs dos pacientes
    consulta_original_id UUID REFERENCES consultas(id), -- Referência para a consulta original
    data_retorno DATE NOT NULL,
    hora_retorno TIME NOT NULL,
    motivo TEXT NOT NULL,
    procedimento TEXT NOT NULL,
    status TEXT DEFAULT 'pendente', -- 'pendente' | 'confirmado' | 'realizado' | 'cancelado'
    observacoes TEXT
);

-- 2. Desabilitar RLS temporariamente para teste
ALTER TABLE retornos DISABLE ROW LEVEL SECURITY;

-- 3. Inserir alguns retornos de teste baseados nas consultas existentes
INSERT INTO retornos (
    cliente_id, 
    consulta_original_id,
    data_retorno, 
    hora_retorno, 
    motivo, 
    procedimento, 
    status, 
    observacoes
) VALUES 
    (12, (SELECT id FROM consultas WHERE cliente_id = 12 LIMIT 1), 
     CURRENT_DATE + INTERVAL '30 days', '14:00', 
     'Avaliação pós-limpeza', 'Avaliação pós-limpeza', 'pendente', 
     'Retorno para avaliação após limpeza'),
    (7, (SELECT id FROM consultas WHERE cliente_id = 7 LIMIT 1), 
     CURRENT_DATE + INTERVAL '15 days', '15:30', 
     'Controle do canal', 'Controle do canal', 'confirmado', 
     'Retorno confirmado para controle'),
    (12, (SELECT id FROM consultas WHERE cliente_id = 12 LIMIT 1), 
     CURRENT_DATE + INTERVAL '7 days', '10:00', 
     'Avaliação de restauração', 'Avaliação de restauração', 'pendente', 
     'Verificar evolução da restauração')
ON CONFLICT DO NOTHING;

-- 4. Verificar se a tabela foi criada
SELECT 'Tabela retornos criada com sucesso!' as status;

-- 5. Verificar os dados inseridos
SELECT COUNT(*) as total_retornos FROM retornos;

-- 6. Mostrar os retornos com dados dos pacientes
SELECT 
    r.id,
    r.data_retorno,
    r.hora_retorno,
    r.motivo,
    r.procedimento,
    r.status,
    cl.nome as paciente,
    cl.telefone,
    c.data_consulta as consulta_original_data,
    c.procedimento as consulta_original_procedimento
FROM retornos r
LEFT JOIN "clientelA" cl ON r.cliente_id = cl.id
LEFT JOIN consultas c ON r.consulta_original_id = c.id
ORDER BY r.data_retorno, r.hora_retorno;






