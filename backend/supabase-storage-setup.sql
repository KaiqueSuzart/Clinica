-- ========================================
-- CONFIGURAÇÃO DO STORAGE PARA ARQUIVOS
-- ========================================

-- 1. Criar bucket para arquivos dos pacientes
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-files', 'patient-files', true);

-- 2. Criar tabela de arquivos
CREATE TABLE IF NOT EXISTS patient_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('image', 'document', 'xray', 'report')),
    description TEXT,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key para pacientes (assumindo que existe uma tabela clientelA)
    CONSTRAINT fk_patient_files_patient FOREIGN KEY (patient_id) REFERENCES clientelA(id) ON DELETE CASCADE
);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_patient_files_patient_id ON patient_files(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_category ON patient_files(category);
CREATE INDEX IF NOT EXISTS idx_patient_files_uploaded_at ON patient_files(uploaded_at);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE patient_files ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança para a tabela patient_files
-- Permitir SELECT para usuários autenticados
CREATE POLICY "Permitir leitura de arquivos para usuários autenticados" ON patient_files
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir INSERT para usuários autenticados
CREATE POLICY "Permitir upload de arquivos para usuários autenticados" ON patient_files
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir UPDATE para usuários autenticados
CREATE POLICY "Permitir atualização de arquivos para usuários autenticados" ON patient_files
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir DELETE para usuários autenticados
CREATE POLICY "Permitir exclusão de arquivos para usuários autenticados" ON patient_files
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Políticas de storage para o bucket patient-files
-- Permitir leitura de arquivos
CREATE POLICY "Permitir leitura pública de arquivos" ON storage.objects
    FOR SELECT USING (bucket_id = 'patient-files');

-- Permitir upload de arquivos para usuários autenticados
CREATE POLICY "Permitir upload para usuários autenticados" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'patient-files' AND
        auth.role() = 'authenticated'
    );

-- Permitir atualização de arquivos para usuários autenticados
CREATE POLICY "Permitir atualização para usuários autenticados" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'patient-files' AND
        auth.role() = 'authenticated'
    );

-- Permitir exclusão de arquivos para usuários autenticados
CREATE POLICY "Permitir exclusão para usuários autenticados" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'patient-files' AND
        auth.role() = 'authenticated'
    );

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger para atualizar updated_at na tabela patient_files
CREATE TRIGGER update_patient_files_updated_at BEFORE UPDATE
    ON patient_files FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 9. Comentários para documentação
COMMENT ON TABLE patient_files IS 'Tabela para armazenar metadados dos arquivos dos pacientes';
COMMENT ON COLUMN patient_files.patient_id IS 'ID do paciente proprietário do arquivo';
COMMENT ON COLUMN patient_files.filename IS 'Nome único do arquivo no storage';
COMMENT ON COLUMN patient_files.original_filename IS 'Nome original do arquivo enviado';
COMMENT ON COLUMN patient_files.file_path IS 'Caminho completo do arquivo no storage';
COMMENT ON COLUMN patient_files.category IS 'Categoria do arquivo: image, document, xray, report';
COMMENT ON COLUMN patient_files.file_size IS 'Tamanho do arquivo em bytes';
