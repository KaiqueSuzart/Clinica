-- Script para corrigir a tabela annotations
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna is_private se não existir
ALTER TABLE annotations 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'annotations' 
ORDER BY ordinal_position;
