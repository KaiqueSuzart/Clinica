import { Controller, Get } from '@nestjs/common';

@Controller('simple-notifications')
export class SimpleNotificationsController {
  @Get()
  findAll() {
    return [
      {
        id: '1',
        title: 'Teste Simples',
        message: 'Esta é uma notificação de teste simples',
        is_read: false,
        created_at: new Date().toISOString()
      }
    ];
  }

  @Get('stats')
  getStats() {
    return {
      total_unread: 1,
      by_type: {
        system: { count: 1, unread: 1 }
      }
    };
  }
}
