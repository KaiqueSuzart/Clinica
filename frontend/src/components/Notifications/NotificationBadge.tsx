import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { apiService, NotificationStats } from '../../services/api';

interface NotificationBadgeProps {
  onClick: () => void;
  className?: string;
}

export default function NotificationBadge({ onClick, className = '' }: NotificationBadgeProps) {
  const [stats, setStats] = useState<NotificationStats>({
    total_unread: 0,
    by_type: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotificationStats();
    
    // Atualizar estatísticas a cada 30 segundos
    const interval = setInterval(loadNotificationStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadNotificationStats = async () => {
    try {
      const data = await apiService.getNotificationStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas de notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors ${className}`}
    >
      <Bell className="w-6 h-6" />
      {!loading && stats.total_unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {stats.total_unread > 99 ? '99+' : stats.total_unread}
        </span>
      )}
    </button>
  );
}
