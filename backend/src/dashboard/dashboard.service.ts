import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DashboardService {
  constructor(private supabaseService: SupabaseService) {}

  async getMonthlyStats(empresaId?: string) {
    try {
      const client = this.supabaseService.getClient();
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Buscar consultas do mês
      let consultasQuery = client
        .from('consultas')
        .select('*')
        .gte('data_consulta', firstDayOfMonth)
        .lte('data_consulta', lastDayOfMonth);

      if (empresaId) {
        consultasQuery = consultasQuery.eq('empresa_id', empresaId);
      }

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

  async getTodayStats(empresaId?: string) {
    try {
      const client = this.supabaseService.getClient();
      const today = new Date().toISOString().split('T')[0];

      // Buscar consultas de hoje
      let todayQuery = client
        .from('consultas')
        .select('*')
        .eq('data_consulta', today);

      if (empresaId) {
        todayQuery = todayQuery.eq('empresa_id', empresaId);
      }

      const { data: todayConsultas, error: todayError } = await todayQuery;
      if (todayError) throw todayError;

      // Buscar total de pacientes
      let patientsQuery = client
        .from('clientelA')
        .select('*', { count: 'exact', head: true });

      if (empresaId) {
        patientsQuery = patientsQuery.eq('empresa', empresaId);
      }

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



