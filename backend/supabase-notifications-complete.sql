-- =====================================================
-- SISTEMA COMPLETO DE NOTIFICAÇÕES - SUPABASE
-- =====================================================
-- Execute este SQL completo no Supabase sem erros
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

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_notifications_empresa_id ON notifications(empresa_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 3. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para visualizar notificações da empresa
CREATE POLICY "Users can view notifications from their company" ON notifications
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::UUID);

-- Política para inserir notificações
CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (empresa_id = current_setting('app.current_empresa_id')::UUID);

-- Política para atualizar notificações
CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (empresa_id = current_setting('app.current_empresa_id')::UUID);

-- Política para deletar notificações
CREATE POLICY "Users can delete their notifications" ON notifications
  FOR DELETE USING (empresa_id = current_setting('app.current_empresa_id')::UUID);

-- 4. CRIAR FUNÇÕES SQL
-- =====================================================

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
  WHERE empresa_id = current_setting('app.current_empresa_id')::UUID
    AND (p_user_id IS NULL OR user_id = p_user_id OR user_id IS NULL)
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql;

-- Função para limpar notificações expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_notifications() RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 5. INSERIR DADOS DE EXEMPLO
-- =====================================================
-- Criar um UUID padrão para empresa (substitua pelo ID real da sua empresa)
DO $$
DECLARE
  default_empresa_id UUID := gen_random_uuid();
BEGIN
  -- Inserir notificações de exemplo
  INSERT INTO notifications (empresa_id, type, title, message, priority, data) VALUES
    (default_empresa_id, 'confirmation', '3 confirmações pendentes', 'Pacientes aguardando confirmação de consulta', 'high', '{"count": 3, "appointment_ids": []}'),
    (default_empresa_id, 'message', '1 mensagem não lida', 'Nova resposta no WhatsApp', 'normal', '{"source": "whatsapp", "contact": ""}'),
    (default_empresa_id, 'return', '2 retornos hoje', 'Pacientes com retorno agendado para hoje', 'normal', '{"count": 2, "return_ids": []}'),
    (default_empresa_id, 'appointment', 'Nova consulta agendada', 'Consulta agendada para João Silva em 15/09/2024', 'normal', '{"appointment_id": "123", "patient_name": "João Silva"}'),
    (default_empresa_id, 'system', 'Sistema atualizado', 'Nova versão do sistema disponível', 'low', '{"version": "2.0.0", "features": ["notificações", "agenda"]}');
END $$;

-- 6. CRIAR TRIGGERS PARA AUTOMAÇÃO
-- =====================================================

-- Trigger para atualizar estatísticas automaticamente
CREATE OR REPLACE FUNCTION update_notification_stats() RETURNS TRIGGER AS $$
BEGIN
  -- Aqui você pode adicionar lógica para atualizar cache ou estatísticas
  -- Por enquanto, apenas retorna o registro
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela
DROP TRIGGER IF EXISTS trigger_update_notification_stats ON notifications;
CREATE TRIGGER trigger_update_notification_stats
  AFTER INSERT OR UPDATE OR DELETE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_notification_stats();

-- 7. CRIAR VIEWS PARA FACILITAR CONSULTAS
-- =====================================================

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

-- View para estatísticas por tipo
CREATE OR REPLACE VIEW notification_stats_by_type AS
SELECT 
  type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_read = FALSE) as unread_count,
  COUNT(*) FILTER (WHERE is_read = TRUE) as read_count
FROM notifications 
WHERE empresa_id = current_setting('app.current_empresa_id')::UUID
  AND (expires_at IS NULL OR expires_at > NOW())
GROUP BY type
ORDER BY unread_count DESC;

-- 8. CONFIGURAR PERMISSÕES
-- =====================================================

-- Garantir que a tabela seja acessível
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO anon;

-- Garantir que as funções sejam executáveis
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_stats TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_notifications TO authenticated;

-- Garantir acesso às views
GRANT SELECT ON unread_notifications TO authenticated;
GRANT SELECT ON notification_stats_by_type TO authenticated;

-- 9. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se a tabela foi criada corretamente
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    RAISE NOTICE '✅ Tabela notifications criada com sucesso!';
  ELSE
    RAISE EXCEPTION '❌ Erro ao criar tabela notifications';
  END IF;
END $$;

-- Verificar se as funções foram criadas
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count 
  FROM information_schema.routines 
  WHERE routine_name IN ('create_notification', 'mark_notification_read', 'mark_all_notifications_read', 'get_notification_stats');
  
  IF func_count = 4 THEN
    RAISE NOTICE '✅ Todas as funções criadas com sucesso!';
  ELSE
    RAISE NOTICE '⚠️ Apenas % de 4 funções foram criadas', func_count;
  END IF;
END $$;

-- Mostrar estatísticas iniciais
DO $$
DECLARE
  total_notifications INTEGER;
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_notifications FROM notifications;
  SELECT COUNT(*) INTO unread_count FROM notifications WHERE is_read = FALSE;
  
  RAISE NOTICE '📊 Estatísticas iniciais:';
  RAISE NOTICE '   Total de notificações: %', total_notifications;
  RAISE NOTICE '   Não lidas: %', unread_count;
  RAISE NOTICE '   Lidas: %', total_notifications - unread_count;
END $$;

-- =====================================================
-- SISTEMA DE NOTIFICAÇÕES CONFIGURADO COM SUCESSO! 🎉
-- =====================================================
-- Agora você pode usar o sistema de notificações no frontend
-- =====================================================
