import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';

@Controller('notifications')
export class MockNotificationsController {
  private notifications = [
    {
      id: '1',
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
      id: '2',
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

  @Get()
  findAll(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    
    return this.notifications.slice(offsetNum, offsetNum + limitNum);
  }

  @Get('stats')
  getStats() {
    const unreadCount = this.notifications.filter(n => !n.is_read).length;
    
    const byType: { [key: string]: { count: number; unread: number } } = {};
    this.notifications.forEach(notification => {
      const type = notification.type;
      if (!byType[type]) {
        byType[type] = { count: 0, unread: 0 };
      }
      byType[type].count++;
      if (!notification.is_read) {
        byType[type].unread++;
      }
    });

    return {
      total_unread: unreadCount,
      by_type: byType
    };
  }

  @Get('unread')
  getUnread() {
    return this.notifications.filter(n => !n.is_read);
  }

  @Post()
  create(@Body() createNotificationDto: any) {
    const newNotification = {
      id: Date.now().toString(),
      empresa_id: 'default-empresa-id',
      ...createNotificationDto,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    
    this.notifications.unshift(newNotification);
    return newNotification;
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.is_read = true;
      notification.read_at = new Date().toISOString();
    }
    return notification;
  }

  @Patch('mark-all-read')
  markAllAsRead() {
    this.notifications.forEach(notification => {
      if (!notification.is_read) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
      }
    });
    return { message: 'Todas as notificações foram marcadas como lidas' };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      Object.assign(notification, updateDto);
    }
    return notification;
  }
}
