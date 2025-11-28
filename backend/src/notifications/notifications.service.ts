import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateNotificationDto, NotificationType, NotificationPriority } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

export interface Notification {
  id: string;
  empresa_id: string;
  user_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  priority: NotificationPriority;
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

export interface NotificationStats {
  total_unread: number;
  by_type: {
    [key: string]: {
      count: number;
      unread: number;
    };
  };
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createNotificationDto: CreateNotificationDto, empresaId: string): Promise<Notification> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('notifications')
        .insert({
          empresa_id: empresaId,
          user_id: createNotificationDto.user_id,
          type: createNotificationDto.type,
          title: createNotificationDto.title,
          message: createNotificationDto.message,
          data: createNotificationDto.data,
          priority: createNotificationDto.priority || NotificationPriority.NORMAL,
          expires_at: createNotificationDto.expires_at,
        })
        .select('*')
        .single();

      if (error) {
        this.logger.error('Erro ao criar notificação:', error);
        throw new Error(`Erro ao criar notificação: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.logger.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  async findAll(empresaId: string, userId?: string, limit = 50, offset = 0): Promise<Notification[]> {
    try {
      let query = this.supabaseService
        .getClient()
        .from('notifications')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Erro ao buscar notificações:', error);
        throw new Error(`Erro ao buscar notificações: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error('Erro ao buscar notificações:', error);
      throw error;
    }
  }

  async findUnread(empresaId: string, userId?: string): Promise<Notification[]> {
    try {
      let query = this.supabaseService
        .getClient()
        .from('notifications')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Erro ao buscar notificações não lidas:', error);
        throw new Error(`Erro ao buscar notificações não lidas: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error('Erro ao buscar notificações não lidas:', error);
      throw error;
    }
  }

  async findOne(id: string, empresaId: string): Promise<Notification> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('notifications')
        .select('*')
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .single();

      if (error) {
        this.logger.error('Erro ao buscar notificação:', error);
        throw new Error(`Erro ao buscar notificação: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.logger.error('Erro ao buscar notificação:', error);
      throw error;
    }
  }

  async markAsRead(id: string, empresaId: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService
        .getClient()
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('empresa_id', empresaId);

      if (error) {
        this.logger.error('Erro ao marcar notificação como lida:', error);
        throw new Error(`Erro ao marcar notificação como lida: ${error.message}`);
      }

      return true;
    } catch (error) {
      this.logger.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  async markAllAsRead(empresaId: string, userId?: string): Promise<number> {
    try {
      let query = this.supabaseService
        .getClient()
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('empresa_id', empresaId)
        .eq('is_read', false);

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { count, error } = await query;

      if (error) {
        this.logger.error('Erro ao marcar todas as notificações como lidas:', error);
        throw new Error(`Erro ao marcar todas as notificações como lidas: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      this.logger.error('Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  }

  async getStats(empresaId: string, userId?: string): Promise<NotificationStats> {
    try {
      // Buscar todas as notificações para calcular estatísticas
      let query = this.supabaseService
        .getClient()
        .from('notifications')
        .select('*')
        .eq('empresa_id', empresaId);

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Erro ao buscar estatísticas de notificações:', error);
        throw new Error(`Erro ao buscar estatísticas de notificações: ${error.message}`);
      }

      const notifications = data || [];
      const unreadCount = notifications.filter(n => !n.is_read).length;
      
      // Agrupar por tipo
      const byType: { [key: string]: { count: number; unread: number } } = {};
      notifications.forEach(notification => {
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
    } catch (error) {
      this.logger.error('Erro ao buscar estatísticas de notificações:', error);
      throw error;
    }
  }

  async update(id: string, updateNotificationDto: any, empresaId: string): Promise<Notification> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('notifications')
        .update(updateNotificationDto)
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select('*')
        .single();

      if (error) {
        this.logger.error('Erro ao atualizar notificação:', error);
        throw new Error(`Erro ao atualizar notificação: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.logger.error('Erro ao atualizar notificação:', error);
      throw error;
    }
  }

  async delete(id: string, empresaId: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService
        .getClient()
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('empresa_id', empresaId);

      if (error) {
        this.logger.error('Erro ao deletar notificação:', error);
        throw new Error(`Erro ao deletar notificação: ${error.message}`);
      }

      return true;
    } catch (error) {
      this.logger.error('Erro ao deletar notificação:', error);
      throw error;
    }
  }

  // Métodos para criar notificações específicas
  async createAppointmentNotification(appointmentData: any, empresaId: string): Promise<Notification> {
    return this.create({
      type: NotificationType.APPOINTMENT,
      title: 'Nova consulta agendada',
      message: `Consulta agendada para ${appointmentData.patientName} em ${appointmentData.date}`,
      data: { appointment_id: appointmentData.id, patient_id: appointmentData.patientId },
      priority: NotificationPriority.NORMAL,
    }, empresaId);
  }

  async createReturnNotification(returnData: any, empresaId: string): Promise<Notification> {
    return this.create({
      type: NotificationType.RETURN,
      title: 'Retorno agendado',
      message: `Retorno agendado para ${returnData.paciente_nome} em ${returnData.data_retorno}`,
      data: { return_id: returnData.id, patient_id: returnData.cliente_id },
      priority: NotificationPriority.NORMAL,
    }, empresaId);
  }

  async createConfirmationNotification(count: number, empresaId: string): Promise<Notification> {
    return this.create({
      type: NotificationType.CONFIRMATION,
      title: `${count} confirmações pendentes`,
      message: 'Pacientes aguardando confirmação de consulta',
      data: { count },
      priority: NotificationPriority.HIGH,
    }, empresaId);
  }

  async createMessageNotification(source: string, contact: string, empresaId: string): Promise<Notification> {
    return this.create({
      type: NotificationType.MESSAGE,
      title: 'Nova mensagem',
      message: `Nova resposta no ${source}`,
      data: { source, contact },
      priority: NotificationPriority.NORMAL,
    }, empresaId);
  }
}
