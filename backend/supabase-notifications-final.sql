-- =====================================================
-- SISTEMA DE NOTIFICAÇÕES - VERSÃO FINAL SEM ERROS
-- =====================================================
-- Execute este SQL no Supabase - versão que verifica se já existe
-- =====================================================

-- 1. CRIAR TABELA DE NOTIFICAÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  user_id UUID,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 2. CRIAR ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_notifications_empresa_id ON notifications(empresa_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 3. CONFIGURAR RLS
-- =====================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Users can view notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete notifications" ON notifications;

-- Criar políticas
CREATE POLICY "Users can view notifications" ON notifications
  FOR ALL USING (true);

CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update notifications" ON notifications
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete notifications" ON notifications
  FOR DELETE USING (true);

-- 4. REMOVER FUNÇÕES EXISTENTES E CRIAR NOVAS
-- =====================================================
DROP FUNCTION IF EXISTS create_notification(UUID, UUID, VARCHAR(50), VARCHAR(255), TEXT, JSONB, VARCHAR(20), TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS mark_notification_read(UUID);
DROP FUNCTION IF EXISTS mark_all_notifications_read();
DROP FUNCTION IF EXISTS get_notification_stats();

-- Função para criar notificação
CREATE OR REPLACE FUNCTION create_notification(
  p_empresa_id UUID,
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_data JSONB,
  p_priority VARCHAR(20),
  p_expires_at TIMESTAMP WITH TIME ZONE
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    empresa_id, user_id, type, title, message, data, priority, expires_at
  ) VALUES (
    p_empresa_id, p_user_id, p_type, p_title, p_message, p_data, p_priority, p_expires_at
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications 
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar todas as notificações como lidas
CREATE OR REPLACE FUNCTION mark_all_notifications_read() RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications 
  SET is_read = TRUE, read_at = NOW()
  WHERE is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas
CREATE OR REPLACE FUNCTION get_notification_stats() 
RETURNS TABLE(
  total_unread INTEGER,
  by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_unread,
    COALESCE(
      jsonb_object_agg(
        type, 
        jsonb_build_object(
          'count', count(*),
          'unread', count(*) FILTER (WHERE is_read = FALSE)
        )
      ) FILTER (WHERE type IS NOT NULL),
      '{}'::jsonb
    ) as by_type
  FROM notifications 
  WHERE (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql;

-- 5. REMOVER VIEWS EXISTENTES E CRIAR NOVAS
-- =====================================================
DROP VIEW IF EXISTS unread_notifications;

-- View para notificações não lidas
CREATE OR REPLACE VIEW unread_notifications AS
SELECT 
  id,
  empresa_id,
  user_id,
  type,
  title,
  message,
  data,
  priority,
  created_at,
  expires_at
FROM notifications 
WHERE is_read = FALSE 
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY created_at DESC;

-- 6. INSERIR DADOS DE EXEMPLO (APENAS SE NÃO EXISTIREM)
-- =====================================================
INSERT INTO notifications (empresa_id, type, title, message, priority, data) 
SELECT 
  gen_random_uuid(), 
  'confirmation', 
  '3 confirmações pendentes', 
  'Pacientes aguardando confirmação de consulta', 
  'high', 
  '{"count": 3}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title = '3 confirmações pendentes');

INSERT INTO notifications (empresa_id, type, title, message, priority, data) 
SELECT 
  gen_random_uuid(), 
  'message', 
  '1 mensagem não lida', 
  'Nova resposta no WhatsApp', 
  'normal', 
  '{"source": "whatsapp"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title = '1 mensagem não lida');

INSERT INTO notifications (empresa_id, type, title, message, priority, data) 
SELECT 
  gen_random_uuid(), 
  'return', 
  '2 retornos hoje', 
  'Pacientes com retorno agendado para hoje', 
  'normal', 
  '{"count": 2}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title = '2 retornos hoje');

-- 7. CONFIGURAR PERMISSÕES
-- =====================================================
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO anon;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_stats TO authenticated;
GRANT SELECT ON unread_notifications TO authenticated;

-- 8. VERIFICAÇÃO FINAL
-- =====================================================
SELECT 
  'Sistema de notificações configurado com sucesso!' as status,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_read = FALSE) as unread_count,
  COUNT(*) FILTER (WHERE is_read = TRUE) as read_count
FROM notifications;
