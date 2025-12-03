-- ============================================
-- SCRIPT PARA CRIAR TABELA DE NOTIFICAÇÕES
-- ============================================
-- Execute este script no Supabase SQL Editor se a tabela não existir
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  user_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('appointment', 'return', 'message', 'confirmation', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notifications_empresa_id ON notifications(empresa_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- RLS (Row Level Security) - Permitir acesso apenas para a empresa do usuário
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam notificações da sua empresa
-- Nota: Como estamos usando getAdminClient() no backend, esta política é principalmente para referência
-- O backend bypassa RLS usando service role, mas esta política permite acesso via RLS se necessário
CREATE POLICY "Users can view notifications from their company"
  ON notifications FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Política para permitir que o service role crie/atualize notificações
CREATE POLICY "Service role can manage notifications"
  ON notifications FOR ALL
  USING (true)
  WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- ============================================
-- FIM DO SCRIPT
-- ============================================

