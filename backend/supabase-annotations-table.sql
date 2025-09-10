-- Script para criar a tabela de anotações no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de anotações
CREATE TABLE IF NOT EXISTS annotations (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Geral',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_annotations_patient_id ON annotations(patient_id);
CREATE INDEX IF NOT EXISTS idx_annotations_created_at ON annotations(created_at);

-- Desabilitar RLS para permitir operações
ALTER TABLE annotations DISABLE ROW LEVEL SECURITY;

-- Ou, se preferir manter RLS ativo, criar políticas permissivas:
-- CREATE POLICY "Enable insert for all users" ON annotations FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable read access for all users" ON annotations FOR SELECT USING (true);
-- CREATE POLICY "Enable update for all users" ON annotations FOR UPDATE USING (true);
-- CREATE POLICY "Enable delete for all users" ON annotations FOR DELETE USING (true);

-- Verificar se a tabela foi criada
SELECT * FROM information_schema.tables WHERE table_name = 'annotations';














