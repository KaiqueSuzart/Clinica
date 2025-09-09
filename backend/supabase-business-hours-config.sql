-- Criar tabela para configurações de horário de funcionamento
CREATE TABLE IF NOT EXISTS business_hours_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL,
    day_of_week VARCHAR(20) NOT NULL, -- monday, tuesday, etc.
    is_working BOOLEAN NOT NULL DEFAULT true,
    start_time TIME NOT NULL DEFAULT '08:00:00',
    end_time TIME NOT NULL DEFAULT '18:00:00',
    lunch_break_enabled BOOLEAN NOT NULL DEFAULT true,
    lunch_break_start TIME NOT NULL DEFAULT '12:00:00',
    lunch_break_end TIME NOT NULL DEFAULT '13:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empresa_id, day_of_week)
);

-- Inserir configurações padrão
INSERT INTO business_hours_config (empresa_id, day_of_week, is_working, start_time, end_time, lunch_break_enabled, lunch_break_start, lunch_break_end)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'monday', true, '08:00:00', '18:00:00', true, '12:00:00', '13:00:00'),
    ('00000000-0000-0000-0000-000000000001', 'tuesday', true, '08:00:00', '18:00:00', true, '12:00:00', '13:00:00'),
    ('00000000-0000-0000-0000-000000000001', 'wednesday', true, '08:00:00', '18:00:00', true, '12:00:00', '13:00:00'),
    ('00000000-0000-0000-0000-000000000001', 'thursday', true, '08:00:00', '18:00:00', true, '12:00:00', '13:00:00'),
    ('00000000-0000-0000-0000-000000000001', 'friday', true, '08:00:00', '18:00:00', true, '12:00:00', '13:00:00'),
    ('00000000-0000-0000-0000-000000000001', 'saturday', true, '08:00:00', '14:00:00', false, '12:00:00', '13:00:00'),
    ('00000000-0000-0000-0000-000000000001', 'sunday', false, '08:00:00', '18:00:00', false, '12:00:00', '13:00:00')
ON CONFLICT (empresa_id, day_of_week) DO NOTHING;

-- Habilitar RLS
ALTER TABLE business_hours_config ENABLE ROW LEVEL SECURITY;

-- Criar política RLS
CREATE POLICY "business_hours_config_policy" ON business_hours_config
    FOR ALL USING (true);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_business_hours_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para updated_at
CREATE TRIGGER update_business_hours_updated_at
    BEFORE UPDATE ON business_hours_config
    FOR EACH ROW
    EXECUTE FUNCTION update_business_hours_updated_at();
