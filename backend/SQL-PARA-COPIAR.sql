-- COLE ESTE SQL NO PAINEL DO SUPABASE
-- Execute em: SQL Editor > New Query

-- 1. Criar tabela de arquivos
CREATE TABLE IF NOT EXISTS patient_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('image', 'document', 'xray', 'report')),
    description TEXT,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relacionamento com pacientes
    CONSTRAINT fk_patient_files_patient FOREIGN KEY (patient_id) 
    REFERENCES clientelA(id) ON DELETE CASCADE
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_patient_files_patient_id ON patient_files(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_category ON patient_files(category);
CREATE INDEX IF NOT EXISTS idx_patient_files_uploaded_at ON patient_files(uploaded_at DESC);

-- 3. Habilitar RLS
ALTER TABLE patient_files ENABLE ROW LEVEL SECURITY;

-- 4. Políticas da tabela
CREATE POLICY "patient_files_select_policy" ON patient_files FOR SELECT USING (true);
CREATE POLICY "patient_files_insert_policy" ON patient_files FOR INSERT WITH CHECK (true);
CREATE POLICY "patient_files_update_policy" ON patient_files FOR UPDATE USING (true);
CREATE POLICY "patient_files_delete_policy" ON patient_files FOR DELETE USING (true);

-- 5. Políticas do storage
CREATE POLICY "patient_files_storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'patient-files');
CREATE POLICY "patient_files_storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'patient-files');
CREATE POLICY "patient_files_storage_update" ON storage.objects FOR UPDATE USING (bucket_id = 'patient-files');
CREATE POLICY "patient_files_storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'patient-files');

-- 6. Função e trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patient_files_updated_at 
    BEFORE UPDATE ON patient_files 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
