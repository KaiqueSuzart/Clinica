-- Adicionar campo tipo_desconto na tabela orcamentos
ALTER TABLE orcamentos 
ADD COLUMN IF NOT EXISTS tipo_desconto VARCHAR(20) DEFAULT 'fixed' 
CHECK (tipo_desconto IN ('percentage', 'fixed'));

-- Atualizar registros existentes para usar 'fixed' como padrão
UPDATE orcamentos 
SET tipo_desconto = 'fixed' 
WHERE tipo_desconto IS NULL;

-- Adicionar comentário na coluna
COMMENT ON COLUMN orcamentos.tipo_desconto IS 'Tipo de desconto: percentage (percentual) ou fixed (valor fixo)';
