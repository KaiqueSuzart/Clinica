-- Corrigir tipo do campo empresa_id na tabela orcamentos
-- Se o campo estiver como bigint, vamos alterá-lo para UUID

-- Primeiro, vamos verificar o tipo atual
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'orcamentos' AND column_name = 'empresa_id';

-- Alterar o tipo do campo empresa_id para UUID
ALTER TABLE orcamentos 
ALTER COLUMN empresa_id TYPE UUID USING empresa_id::text::uuid;

-- Se der erro, vamos tentar uma abordagem diferente
-- ALTER TABLE orcamentos DROP COLUMN empresa_id;
-- ALTER TABLE orcamentos ADD COLUMN empresa_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';
