import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from './notifications.service';
import { NotificationType, NotificationPriority } from './dto/create-notification.dto';

@Injectable()
export class AutoNotificationsService {
  private readonly logger = new Logger(AutoNotificationsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService
  ) {}

  /**
   * Verifica consultas que estão próximas (1 hora antes)
   */
  async checkUpcomingAppointments(empresaId: string) {
    try {
      // Usar getAdminClient() para bypassar RLS
      const client = this.supabaseService.getAdminClient();
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM
      const targetTime = oneHourLater.toTimeString().slice(0, 5);

      this.logger.log(`[AutoNotifications] Verificando consultas próximas: ${currentTime} - ${targetTime} (${today})`);

      // Buscar consultas de hoje que começam na próxima hora
      const query = client
        .from('consultas')
        .select(`
          *,
          paciente:cliente_id(nome, telefone),
          dentista:dentista_id(nome)
        `)
        .eq('data_consulta', today)
        .gte('hora_inicio', currentTime)
        .lte('hora_inicio', targetTime)
        .in('status', ['pendente', 'confirmado'])
        .eq('empresa_id', empresaId);

      const { data: consultas, error } = await query;

      if (error) {
        this.logger.error('Erro ao buscar consultas próximas:', error);
        return [];
      }

      if (!consultas || consultas.length === 0) {
        this.logger.log('[AutoNotifications] Nenhuma consulta próxima encontrada');
        return [];
      }

      this.logger.log(`[AutoNotifications] Encontradas ${consultas.length} consultas próximas`);

      // Criar notificações para cada consulta
      const notifications = [];
      for (const consulta of consultas) {
        // Verificar se já existe notificação para esta consulta
        const { data: existing } = await client
          .from('notifications')
          .select('id')
          .eq('type', 'appointment')
          .eq('empresa_id', empresaId)
          .eq('data->>appointment_id', consulta.id)
          .maybeSingle();

        if (!existing) {
          const notification = await this.notificationsService.create({
            type: NotificationType.APPOINTMENT,
            title: '⏰ Consulta em 1 hora',
            message: `Consulta de ${consulta.paciente?.nome || 'Paciente'} às ${consulta.hora_inicio} - ${consulta.procedimento || 'Consulta'}`,
            priority: NotificationPriority.HIGH,
            data: {
              appointment_id: consulta.id,
              patient_name: consulta.paciente?.nome,
              patient_id: consulta.cliente_id,
              time: consulta.hora_inicio,
              procedure: consulta.procedimento,
              date: consulta.data_consulta
            }
          }, empresaId);
          notifications.push(notification);
          this.logger.log(`[AutoNotifications] Notificação criada para consulta ${consulta.id}`);
        } else {
          this.logger.log(`[AutoNotifications] Notificação já existe para consulta ${consulta.id}`);
        }
      }

      this.logger.log(`✅ Criadas ${notifications.length} notificações de consultas próximas`);
      return notifications;
    } catch (error) {
      this.logger.error('Erro ao verificar consultas próximas:', error);
      return [];
    }
  }

  /**
   * Verifica retornos que estão próximos (1 dia antes)
   */
  async checkUpcomingReturns(empresaId: string) {
    try {
      // Usar getAdminClient() para bypassar RLS
      const client = this.supabaseService.getAdminClient();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split('T')[0];

      this.logger.log(`[AutoNotifications] Verificando retornos para: ${tomorrowDate}`);

      // Buscar retornos de amanhã
      const query = client
        .from('retornos')
        .select(`
          *,
          paciente:cliente_id(nome, telefone)
        `)
        .eq('data_retorno', tomorrowDate)
        .in('status', ['agendado', 'confirmado'])
        .eq('empresa_id', empresaId);

      const { data: retornos, error } = await query;

      if (error) {
        this.logger.error('Erro ao buscar retornos próximos:', error);
        return [];
      }

      if (!retornos || retornos.length === 0) {
        this.logger.log('[AutoNotifications] Nenhum retorno próximo encontrado');
        return [];
      }

      this.logger.log(`[AutoNotifications] Encontrados ${retornos.length} retornos próximos`);

      // Criar notificações para cada retorno
      const notifications = [];
      for (const retorno of retornos) {
        // Verificar se já existe notificação para este retorno
        const { data: existing } = await client
          .from('notifications')
          .select('id')
          .eq('type', 'return')
          .eq('empresa_id', empresaId)
          .eq('data->>return_id', retorno.id)
          .maybeSingle();

        if (!existing) {
          const notification = await this.notificationsService.create({
            type: NotificationType.RETURN,
            title: '🔄 Retorno Amanhã',
            message: `Retorno de ${retorno.paciente?.nome || 'Paciente'} amanhã às ${retorno.hora_retorno || '09:00'} - ${retorno.procedimento || 'Retorno'}`,
            priority: NotificationPriority.NORMAL,
            data: {
              return_id: retorno.id,
              patient_name: retorno.paciente?.nome,
              patient_id: retorno.cliente_id,
              date: retorno.data_retorno,
              time: retorno.hora_retorno,
              procedure: retorno.procedimento
            }
          }, empresaId);
          notifications.push(notification);
          this.logger.log(`[AutoNotifications] Notificação criada para retorno ${retorno.id}`);
        } else {
          this.logger.log(`[AutoNotifications] Notificação já existe para retorno ${retorno.id}`);
        }
      }

      this.logger.log(`✅ Criadas ${notifications.length} notificações de retornos próximos`);
      return notifications;
    } catch (error) {
      this.logger.error('Erro ao verificar retornos próximos:', error);
      return [];
    }
  }

  /**
   * Verifica consultas que estão atrasadas (já passou da hora)
   */
  async checkLateAppointments(empresaId: string) {
    try {
      // Usar getAdminClient() para bypassar RLS
      const client = this.supabaseService.getAdminClient();
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      this.logger.log(`[AutoNotifications] Verificando consultas atrasadas: ${currentTime} (${today})`);

      // Buscar consultas de hoje que já passaram e ainda estão pendentes
      const query = client
        .from('consultas')
        .select(`
          *,
          paciente:cliente_id(nome)
        `)
        .eq('data_consulta', today)
        .lt('hora_inicio', currentTime)
        .eq('status', 'pendente')
        .eq('empresa_id', empresaId);

      const { data: consultas, error } = await query;

      if (error) {
        this.logger.error('Erro ao buscar consultas atrasadas:', error);
        return [];
      }

      if (!consultas || consultas.length === 0) {
        this.logger.log('[AutoNotifications] Nenhuma consulta atrasada encontrada');
        return [];
      }

      this.logger.log(`[AutoNotifications] Encontradas ${consultas.length} consultas atrasadas`);

      // Criar notificações para consultas atrasadas
      const notifications = [];
      for (const consulta of consultas) {
        const { data: existing } = await client
          .from('notifications')
          .select('id')
          .eq('type', 'appointment')
          .eq('empresa_id', empresaId)
          .eq('data->>appointment_id', consulta.id)
          .eq('title', '⚠️ Consulta Atrasada')
          .maybeSingle();

        if (!existing) {
          const notification = await this.notificationsService.create({
            type: NotificationType.APPOINTMENT,
            title: '⚠️ Consulta Atrasada',
            message: `Consulta de ${consulta.paciente?.nome || 'Paciente'} às ${consulta.hora_inicio} ainda está pendente`,
            priority: NotificationPriority.URGENT,
            data: {
              appointment_id: consulta.id,
              patient_name: consulta.paciente?.nome,
              patient_id: consulta.cliente_id,
              time: consulta.hora_inicio,
              status: consulta.status,
              date: consulta.data_consulta
            }
          }, empresaId);
          notifications.push(notification);
          this.logger.log(`[AutoNotifications] Notificação criada para consulta atrasada ${consulta.id}`);
        }
      }

      this.logger.log(`⚠️ Criadas ${notifications.length} notificações de consultas atrasadas`);
      return notifications;
    } catch (error) {
      this.logger.error('Erro ao verificar consultas atrasadas:', error);
      return [];
    }
  }

  /**
   * Executa todas as verificações automáticas
   */
  async runAutoChecks(empresaId: string) {
    this.logger.log('🔄 Executando verificações automáticas de notificações...');
    
    const [appointments, returns, late] = await Promise.all([
      this.checkUpcomingAppointments(empresaId),
      this.checkUpcomingReturns(empresaId),
      this.checkLateAppointments(empresaId)
    ]);

    const total = appointments.length + returns.length + late.length;
    
    this.logger.log(`✅ Verificação completa: ${total} notificações criadas`);
    
    return {
      success: true,
      created: total,
      breakdown: {
        upcomingAppointments: appointments.length,
        upcomingReturns: returns.length,
        lateAppointments: late.length
      }
    };
  }
}



