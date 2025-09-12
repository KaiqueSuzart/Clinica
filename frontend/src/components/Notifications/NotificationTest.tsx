import React, { useState, useEffect } from 'react';
import { apiService, Notification } from '../../services/api';
import Button from '../UI/Button';

export default function NotificationTest() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [notificationsData, statsData] = await Promise.all([
        apiService.getNotifications(),
        apiService.getNotificationStats()
      ]);
      
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      setError('Backend de notificações não está disponível. Usando dados de exemplo.');
      
      // Fallback com dados de exemplo
      const mockNotifications = [
        {
          id: 'mock-1',
          empresa_id: 'default-empresa-id',
          type: 'system',
          title: 'Sistema de Notificações Ativo',
          message: 'O sistema de notificações foi configurado com sucesso!',
          data: { source: 'test' },
          is_read: false,
          priority: 'normal',
          created_at: new Date().toISOString(),
        },
        {
          id: 'mock-2',
          empresa_id: 'default-empresa-id',
          type: 'system',
          title: 'Notificação de Teste',
          message: 'Esta é uma notificação de exemplo para demonstrar a interface.',
          data: { test: true },
          is_read: true,
          priority: 'high',
          created_at: new Date(Date.now() - 60000).toISOString(),
          read_at: new Date(Date.now() - 30000).toISOString(),
        }
      ];
      
      const mockStats = {
        total_unread: 1,
        by_type: {
          system: { count: 2, unread: 1 }
        }
      };
      
      setNotifications(mockNotifications as any);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const createTestNotification = async () => {
    try {
      await apiService.createNotification({
        type: 'system',
        title: 'Teste de Notificação',
        message: 'Esta é uma notificação de teste criada em ' + new Date().toLocaleString('pt-BR'),
        priority: 'normal',
        data: { test: true, timestamp: new Date().toISOString() }
      });
      
      // Recarregar notificações
      await loadNotifications();
    } catch (err) {
      console.error('Erro ao criar notificação:', err);
      setError('Backend não disponível. Adicionando notificação de teste local.');
      
      // Fallback - adicionar notificação simulada
      const newMockNotification = {
        id: 'mock-' + Date.now(),
        empresa_id: 'default-empresa-id',
        type: 'system',
        title: 'Notificação de Teste (Local)',
        message: 'Esta é uma notificação de teste criada localmente em ' + new Date().toLocaleString('pt-BR'),
        data: { test: true, timestamp: new Date().toISOString(), local: true },
        is_read: false,
        priority: 'normal',
        created_at: new Date().toISOString(),
      };
      
      setNotifications(prev => [newMockNotification as any, ...prev]);
      
      // Atualizar stats
      setStats((prev: any) => ({
        ...prev,
        total_unread: (prev?.total_unread || 0) + 1,
        by_type: {
          ...prev?.by_type,
          system: {
            count: (prev?.by_type?.system?.count || 0) + 1,
            unread: (prev?.by_type?.system?.unread || 0) + 1
          }
        }
      }));
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      await loadNotifications();
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
      setError('Backend não disponível. Marcando como lida localmente.');
      
      // Fallback - marcar como lida localmente
      setNotifications(prev => prev.map(notification => 
        notification.id === id 
          ? { ...notification, is_read: true, read_at: new Date().toISOString() }
          : notification
      ));
      
      // Atualizar stats
      setStats((prev: any) => ({
        ...prev,
        total_unread: Math.max((prev?.total_unread || 0) - 1, 0),
        by_type: {
          ...prev?.by_type,
          system: {
            ...prev?.by_type?.system,
            unread: Math.max((prev?.by_type?.system?.unread || 0) - 1, 0)
          }
        }
      }));
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      await loadNotifications();
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
      setError('Backend não disponível. Marcando todas como lidas localmente.');
      
      // Fallback - marcar todas como lidas localmente
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        is_read: true,
        read_at: notification.read_at || new Date().toISOString()
      })));
      
      // Atualizar stats
      setStats((prev: any) => ({
        ...prev,
        total_unread: 0,
        by_type: {
          ...prev?.by_type,
          system: {
            ...prev?.by_type?.system,
            unread: 0
          }
        }
      }));
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Teste do Sistema de Notificações
      </h2>

      {error && (
        <div className={`mb-4 p-4 border rounded ${
          error.includes('Backend não disponível') || error.includes('Backend de notificações não está disponível')
            ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            {error.includes('Backend') && (
              <span className="text-lg">⚠️</span>
            )}
            <span>{error}</span>
          </div>
          {error.includes('Backend') && (
            <div className="mt-2 text-sm">
              <p>• As funcionalidades de teste funcionam localmente</p>
              <p>• Os dados não são persistidos no banco</p>
              <p>• Verifique se o backend está rodando na porta 3001</p>
            </div>
          )}
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <Button onClick={loadNotifications} disabled={loading}>
          {loading ? 'Carregando...' : 'Recarregar'}
        </Button>
        <Button onClick={createTestNotification} variant="secondary">
          Criar Notificação de Teste
        </Button>
        <Button onClick={markAllAsRead} variant="outline">
          Marcar Todas como Lidas
        </Button>
      </div>

      {stats && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Estatísticas:
          </h3>
          <p className="text-blue-800 dark:text-blue-200">
            Total não lidas: <strong>{stats.total_unread}</strong>
          </p>
          <pre className="mt-2 text-xs text-blue-700 dark:text-blue-300">
            {JSON.stringify(stats.by_type, null, 2)}
          </pre>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Notificações ({notifications.length})
        </h3>
        
        {notifications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma notificação encontrada
          </p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg ${
                notification.is_read
                  ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                      notification.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {notification.priority}
                    </span>
                    {notification.data?.local && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Local
                      </span>
                    )}
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(notification.created_at).toLocaleString('pt-BR')}
                  </p>
                  {notification.data && (
                    <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      {JSON.stringify(notification.data, null, 2)}
                    </pre>
                  )}
                </div>
                {!notification.is_read && (
                  <Button
                    onClick={() => markAsRead(notification.id)}
                    size="sm"
                    variant="outline"
                  >
                    Marcar como Lida
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
