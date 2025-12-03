import { useState, useEffect, useCallback } from 'react';
import { apiService, Notification, NotificationStats } from '../services/api';
import { useAuth } from '../components/Auth/AuthProvider';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (limit = 20) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getNotifications(user.id, limit);
      setNotifications(data);
      
      // Calcular não lidas
      const unread = data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      setError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadUnreadNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const data = await apiService.getUnreadNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.length);
    } catch (err) {
      console.error('Erro ao carregar notificações não lidas:', err);
    }
  }, [user?.id]);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const statsData = await apiService.getNotificationStats(user.id);
      setStats(statsData);
      setUnreadCount(statsData.total_unread);
    } catch (err) {
      console.error('Erro ao carregar estatísticas de notificações:', err);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await apiService.markAllNotificationsAsRead(user.id);
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Erro ao marcar todas as notificações como lidas:', err);
    }
  }, [user?.id]);

  const runAutoCheck = useCallback(async () => {
    try {
      const result = await apiService.runAutoNotificationCheck();
      if (result.success && result.created > 0) {
        // Recarregar notificações se novas foram criadas
        await loadStats();
        await loadUnreadNotifications();
      }
      return result;
    } catch (err) {
      console.error('Erro ao executar verificação automática:', err);
      return { success: false, created: 0 };
    }
  }, [loadStats, loadUnreadNotifications]);

  // Carregar estatísticas ao montar
  useEffect(() => {
    if (user?.id) {
      loadStats();
      loadUnreadNotifications();
    }
  }, [user?.id, loadStats, loadUnreadNotifications]);

  return {
    notifications,
    unreadCount,
    stats,
    loading,
    error,
    loadNotifications,
    loadUnreadNotifications,
    loadStats,
    markAsRead,
    markAllAsRead,
    runAutoCheck,
    refresh: () => {
      loadStats();
      loadUnreadNotifications();
    }
  };
}

