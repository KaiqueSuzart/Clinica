-- =========================================
-- SQL CORRIGIDO PARA SUPABASE
-- =========================================

-- 1. Criar tabela de arquivos (SEM foreign key por enquanto)
CREATE TABLE IF NOT EXISTS patient_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id TEXT NOT NULL,  -- Mudei para TEXT para ser mais flexível
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_patient_files_patient_id ON patient_files(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_category ON patient_files(category);
CREATE INDEX IF NOT EXISTS idx_patient_files_uploaded_at ON patient_files(uploaded_at DESC);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE patient_files ENABLE ROW LEVEL SECURITY;

-- 4. Políticas da tabela (permissivas para desenvolvimento)
DROP POLICY IF EXISTS "patient_files_select_policy" ON patient_files;
DROP POLICY IF EXISTS "patient_files_insert_policy" ON patient_files;
DROP POLICY IF EXISTS "patient_files_update_policy" ON patient_files;
DROP POLICY IF EXISTS "patient_files_delete_policy" ON patient_files;

CREATE POLICY "patient_files_select_policy" ON patient_files FOR SELECT USING (true);
CREATE POLICY "patient_files_insert_policy" ON patient_files FOR INSERT WITH CHECK (true);
CREATE POLICY "patient_files_update_policy" ON patient_files FOR UPDATE USING (true);
CREATE POLICY "patient_files_delete_policy" ON patient_files FOR DELETE USING (true);

-- 5. Políticas do storage
DROP POLICY IF EXISTS "patient_files_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "patient_files_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "patient_files_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "patient_files_storage_delete" ON storage.objects;

CREATE POLICY "patient_files_storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'patient-files');
CREATE POLICY "patient_files_storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'patient-files');
CREATE POLICY "patient_files_storage_update" ON storage.objects FOR UPDATE USING (bucket_id = 'patient-files');
CREATE POLICY "patient_files_storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'patient-files');

-- 6. Função para trigger de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Trigger para updated_at
DROP TRIGGER IF EXISTS update_patient_files_updated_at ON patient_files;
CREATE TRIGGER update_patient_files_updated_at 
    BEFORE UPDATE ON patient_files 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. Verificar se tudo foi criado
SELECT 'Tabela patient_files criada com sucesso!' as status;
