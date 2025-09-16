-- Adicionar coluna descricao se não existir
ALTER TABLE empresa ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Adicionar outras colunas que podem estar faltando
ALTER TABLE empresa ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE empresa ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE empresa ADD COLUMN IF NOT EXISTS cnpj VARCHAR(20);
ALTER TABLE empresa ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Verificar se a tabela tem todas as colunas necessárias
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'empresa' 
ORDER BY ordinal_position;
