import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DashboardService {
  constructor(private supabaseService: SupabaseService) {}

  async getMonthlyStats(empresaId: string) {
    if (!empresaId) {
      console.error('[DashboardService.getMonthlyStats] Empresa ID não fornecido');
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      console.log('[DashboardService.getMonthlyStats] Buscando estatísticas para empresa:', empresaId);
      const client = this.supabaseService.getAdminClient();
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Buscar consultas do mês
      const consultasQuery = client
        .from('consultas')
        .select('*')
        .eq('empresa_id', empresaId)
        .gte('data_consulta', firstDayOfMonth)
        .lte('data_consulta', lastDayOfMonth);

      const { data: consultas, error: consultasError } = await consultasQuery;

      if (consultasError) throw consultasError;

      // Calcular estatísticas
      const atendimentosRealizados = consultas?.filter(c => c.status === 'realizado').length || 0;
      const totalAgendamentos = consultas?.length || 0;
      const taxaComparecimento = totalAgendamentos > 0 
        ? Math.round((atendimentosRealizados / totalAgendamentos) * 100) 
        : 0;

      // Calcular faturamento do mês
      const faturamento = consultas
        ?.filter(c => c.status === 'realizado' && c.pago)
        .reduce((sum, c) => sum + (c.valor || 0), 0) || 0;

      return {
        success: true,
        data: {
          atendimentosRealizados,
          taxaComparecimento,
          faturamento,
          totalAgendamentos,
          periodo: {
            inicio: firstDayOfMonth,
            fim: lastDayOfMonth
          }
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas mensais:', error);
      throw error;
    }
  }

  async getTodayStats(empresaId: string) {
    if (!empresaId) {
      console.error('[DashboardService.getTodayStats] Empresa ID não fornecido');
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      console.log('[DashboardService.getTodayStats] Buscando estatísticas do dia para empresa:', empresaId);
      const client = this.supabaseService.getAdminClient();
      const today = new Date().toISOString().split('T')[0];

      // Buscar consultas de hoje
      const todayQuery = client
        .from('consultas')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('data_consulta', today);

      const { data: todayConsultas, error: todayError } = await todayQuery;
      if (todayError) throw todayError;

      // Buscar total de pacientes
      const patientsQuery = client
        .from('clientelA')
        .select('*', { count: 'exact', head: true })
        .eq('empresa', empresaId);

      const { count: totalPatients, error: patientsError } = await patientsQuery;
      if (patientsError) throw patientsError;

      // Confirmações pendentes
      const pendingConfirmations = todayConsultas?.filter(c => c.status === 'pendente').length || 0;

      return {
        success: true,
        data: {
          todayAppointments: todayConsultas?.length || 0,
          totalPatients: totalPatients || 0,
          pendingConfirmations,
          unreadMessages: 0 // TODO: Implementar quando tiver sistema de mensagens
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dia:', error);
      throw error;
    }
  }
}



