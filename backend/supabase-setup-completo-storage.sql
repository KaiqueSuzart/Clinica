-- ================================================================
-- CONFIGURAÇÃO COMPLETA DO STORAGE PARA CLÍNICA ODONTOLÓGICA
-- Execute este script inteiro no painel SQL do Supabase
-- ================================================================

-- ==========================================
-- STEP 1: CRIAR BUCKET PARA ARQUIVOS
-- ==========================================

-- Verificar se bucket já existe e criar se necessário
DO $$
BEGIN
    -- Tentar inserir o bucket, ignorar se já existir
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'patient-files', 
        'patient-files', 
        true,
        10485760, -- 10MB em bytes
        ARRAY[
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ]
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Bucket patient-files criado ou já existe';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao criar bucket: %', SQLERRM;
END $$;

-- ==========================================
-- STEP 2: CRIAR TABELA DE METADADOS
-- ==========================================

-- Criar tabela de arquivos dos pacientes
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
    
    -- Relacionamento com pacientes (adaptar conforme sua tabela)
    CONSTRAINT fk_patient_files_patient FOREIGN KEY (patient_id) 
    REFERENCES clientelA(id) ON DELETE CASCADE
);

-- ==========================================
-- STEP 3: CRIAR ÍNDICES PARA PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_patient_files_patient_id ON patient_files(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_category ON patient_files(category);
CREATE INDEX IF NOT EXISTS idx_patient_files_uploaded_at ON patient_files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_files_file_path ON patient_files(file_path);

-- ==========================================
-- STEP 4: CONFIGURAR RLS (ROW LEVEL SECURITY)
-- ==========================================

-- Habilitar RLS na tabela
ALTER TABLE patient_files ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 5: POLÍTICAS DE SEGURANÇA - TABELA
-- ==========================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "patient_files_select_policy" ON patient_files;
DROP POLICY IF EXISTS "patient_files_insert_policy" ON patient_files;
DROP POLICY IF EXISTS "patient_files_update_policy" ON patient_files;
DROP POLICY IF EXISTS "patient_files_delete_policy" ON patient_files;

-- Política para SELECT (leitura)
CREATE POLICY "patient_files_select_policy" ON patient_files
    FOR SELECT USING (true); -- Permitir leitura para todos (ajustar conforme necessário)

-- Política para INSERT (criação)
CREATE POLICY "patient_files_insert_policy" ON patient_files
    FOR INSERT WITH CHECK (true); -- Permitir inserção para todos (ajustar conforme necessário)

-- Política para UPDATE (atualização)
CREATE POLICY "patient_files_update_policy" ON patient_files
    FOR UPDATE USING (true); -- Permitir atualização para todos (ajustar conforme necessário)

-- Política para DELETE (exclusão)
CREATE POLICY "patient_files_delete_policy" ON patient_files
    FOR DELETE USING (true); -- Permitir exclusão para todos (ajustar conforme necessário)

-- ==========================================
-- STEP 6: POLÍTICAS DE STORAGE - BUCKET
-- ==========================================

-- Remover políticas de storage existentes
DROP POLICY IF EXISTS "patient_files_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "patient_files_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "patient_files_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "patient_files_storage_delete" ON storage.objects;

-- Política para visualizar arquivos (SELECT)
CREATE POLICY "patient_files_storage_select" ON storage.objects
    FOR SELECT USING (bucket_id = 'patient-files');

-- Política para upload de arquivos (INSERT)
CREATE POLICY "patient_files_storage_insert" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'patient-files'
        AND auth.role() = 'authenticated'
    );

-- Política para atualizar arquivos (UPDATE)
CREATE POLICY "patient_files_storage_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'patient-files'
        AND auth.role() = 'authenticated'
    );

-- Política para deletar arquivos (DELETE)
CREATE POLICY "patient_files_storage_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'patient-files'
        AND auth.role() = 'authenticated'
    );

-- ==========================================
-- STEP 7: FUNÇÃO DE TRIGGER PARA UPDATED_AT
-- ==========================================

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para tabela patient_files
DROP TRIGGER IF EXISTS update_patient_files_updated_at ON patient_files;
CREATE TRIGGER update_patient_files_updated_at 
    BEFORE UPDATE ON patient_files 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- STEP 8: VERIFICAÇÃO E LOGS
-- ==========================================

-- Verificar se tudo foi criado corretamente
DO $$
DECLARE
    bucket_count INTEGER;
    table_exists BOOLEAN;
    policies_count INTEGER;
BEGIN
    -- Verificar bucket
    SELECT COUNT(*) INTO bucket_count 
    FROM storage.buckets 
    WHERE id = 'patient-files';
    
    -- Verificar tabela
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'patient_files'
    ) INTO table_exists;
    
    -- Verificar políticas
    SELECT COUNT(*) INTO policies_count
    FROM pg_policies 
    WHERE tablename = 'patient_files';
    
    -- Logs de verificação
    RAISE NOTICE '=== VERIFICAÇÃO DA CONFIGURAÇÃO ===';
    RAISE NOTICE 'Bucket patient-files: % encontrado(s)', bucket_count;
    RAISE NOTICE 'Tabela patient_files: %', CASE WHEN table_exists THEN 'CRIADA' ELSE 'NÃO ENCONTRADA' END;
    RAISE NOTICE 'Políticas de segurança: % encontrada(s)', policies_count;
    
    IF bucket_count > 0 AND table_exists AND policies_count >= 4 THEN
        RAISE NOTICE '✅ CONFIGURAÇÃO COMPLETA! Sistema de arquivos pronto para uso.';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: Alguma configuração pode estar incompleta.';
    END IF;
END $$;

-- ==========================================
-- STEP 9: COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ==========================================

COMMENT ON TABLE patient_files IS 'Tabela para armazenar metadados dos arquivos dos pacientes da clínica';
COMMENT ON COLUMN patient_files.patient_id IS 'ID do paciente proprietário do arquivo';
COMMENT ON COLUMN patient_files.filename IS 'Nome único do arquivo no storage (com UUID)';
COMMENT ON COLUMN patient_files.original_filename IS 'Nome original do arquivo enviado pelo usuário';
COMMENT ON COLUMN patient_files.file_path IS 'Caminho completo do arquivo no bucket do Supabase';
COMMENT ON COLUMN patient_files.category IS 'Categoria: image, document, xray, report';
COMMENT ON COLUMN patient_files.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN patient_files.mime_type IS 'Tipo MIME do arquivo (ex: image/jpeg, application/pdf)';

-- ==========================================
-- FINAL: INSTRUÇÕES ADICIONAIS
-- ==========================================

SELECT 
    '🎉 CONFIGURAÇÃO CONCLUÍDA!' as status,
    'Bucket: patient-files criado' as bucket_info,
    'Tabela: patient_files criada' as table_info,
    'Políticas: RLS configurado' as security_info,
    'Próximo passo: Testar upload via API' as next_step;
