-- Script para corrigir as políticas de RLS da tabela anamnese
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos verificar se a tabela existe e sua estrutura
SELECT * FROM information_schema.tables WHERE table_name = 'anamnese';

-- 2. Desabilitar RLS temporariamente para permitir inserções
ALTER TABLE anamnese DISABLE ROW LEVEL SECURITY;

-- 3. Ou, se preferir manter RLS ativo, criar políticas permissivas:

-- Política para permitir inserções (CREATE)
CREATE POLICY "Enable insert for all users" ON anamnese
FOR INSERT WITH CHECK (true);

-- Política para permitir leitura (READ)
CREATE POLICY "Enable read access for all users" ON anamnese
FOR SELECT USING (true);

-- Política para permitir atualizações (UPDATE)
CREATE POLICY "Enable update for all users" ON anamnese
FOR UPDATE USING (true);

-- Política para permitir exclusões (DELETE)
CREATE POLICY "Enable delete for all users" ON anamnese
FOR DELETE USING (true);

-- 4. Verificar se as políticas foram criadas
SELECT * FROM pg_policies WHERE tablename = 'anamnese';

-- 5. Se preferir uma abordagem mais simples, apenas desabilite RLS:
-- ALTER TABLE anamnese DISABLE ROW LEVEL SECURITY;
