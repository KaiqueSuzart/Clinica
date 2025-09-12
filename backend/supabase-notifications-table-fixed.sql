-- Criar tabela de notificações (versão corrigida)
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_empresa_id ON notifications(empresa_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso baseado na empresa
CREATE POLICY "Users can view notifications from their company" ON notifications
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::UUID);

-- Política para permitir inserção de notificações
CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (empresa_id = current_setting('app.current_empresa_id')::UUID);

-- Política para permitir atualização de notificações (marcar como lida)
CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (empresa_id = current_setting('app.current_empresa_id')::UUID);

-- Inserir algumas notificações de exemplo
INSERT INTO notifications (empresa_id, type, title, message, priority, data) VALUES
  (gen_random_uuid(), 'confirmation', '3 confirmações pendentes', 'Pacientes aguardando confirmação de consulta', 'high', '{"count": 3, "appointment_ids": []}'),
  (gen_random_uuid(), 'message', '1 mensagem não lida', 'Nova resposta no WhatsApp', 'normal', '{"source": "whatsapp", "contact": ""}'),
  (gen_random_uuid(), 'return', '2 retornos hoje', 'Pacientes com retorno agendado para hoje', 'normal', '{"count": 2, "return_ids": []}');

-- Função para criar notificação
CREATE OR REPLACE FUNCTION create_notification(
  p_empresa_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_data JSONB DEFAULT NULL,
  p_priority VARCHAR(20) DEFAULT 'normal',
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
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
  WHERE id = p_notification_id AND empresa_id = current_setting('app.current_empresa_id')::UUID;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar todas as notificações como lidas
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID DEFAULT NULL) RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications 
  SET is_read = TRUE, read_at = NOW()
  WHERE empresa_id = current_setting('app.current_empresa_id')::UUID
    AND is_read = FALSE
    AND (p_user_id IS NULL OR user_id = p_user_id OR user_id IS NULL);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de notificações
CREATE OR REPLACE FUNCTION get_notification_stats(p_user_id UUID DEFAULT NULL) 
RETURNS TABLE(
  total_unread INTEGER,
  by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_unread,
    jsonb_object_agg(
      type, 
      jsonb_build_object(
        'count', count(*),
        'unread', count(*) FILTER (WHERE is_read = FALSE)
      )
    ) as by_type
  FROM notifications 
  WHERE empresa_id = current_setting('app.current_empresa_id')::UUID
    AND (p_user_id IS NULL OR user_id = p_user_id OR user_id IS NULL)
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql;
