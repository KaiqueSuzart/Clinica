import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ReportsService {
  constructor(private supabaseService: SupabaseService) {}

  async getProceduresReport(empresaId?: string, startDate?: string, endDate?: string) {
    try {
      const client = this.supabaseService.getClient();
      
      // Buscar consultas realizadas
      let query = client
        .from('consultas')
        .select('*')
        .eq('status', 'realizado');

      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      if (startDate) {
        query = query.gte('data_consulta', startDate);
      }

      if (endDate) {
        query = query.lte('data_consulta', endDate);
      }

      const { data, error } = await query.order('data_consulta', { ascending: false });

      if (error) throw error;

      // Agrupar por procedimento
      const procedureStats = (data || []).reduce((acc: any, consulta: any) => {
        const nome = consulta.procedimento || 'Não especificado';
        if (!acc[nome]) {
          acc[nome] = {
            name: nome,
            quantity: 0,
            revenue: 0,
            totalDuration: 0,
            avgDuration: 0
          };
        }
        acc[nome].quantity += 1;
        acc[nome].revenue += consulta.valor || 0;
        acc[nome].totalDuration += consulta.duracao_minutos || 0;
        acc[nome].avgDuration = acc[nome].totalDuration / acc[nome].quantity;
        return acc;
      }, {});

      return {
        success: true,
        data: Object.values(procedureStats),
        total: data?.length || 0
      };
    } catch (error) {
      console.error('Erro ao buscar relatório de procedimentos:', error);
      throw error;
    }
  }

  async getFinancialReport(empresaId?: string, startDate?: string, endDate?: string) {
    try {
      const client = this.supabaseService.getClient();

      // Buscar consultas realizadas
      let consultasQuery = client
        .from('consultas')
        .select('*')
        .eq('status', 'realizado');

      if (empresaId) {
        consultasQuery = consultasQuery.eq('empresa_id', empresaId);
      }

      if (startDate) {
        consultasQuery = consultasQuery.gte('data_consulta', startDate);
      }

      if (endDate) {
        consultasQuery = consultasQuery.lte('data_consulta', endDate);
      }

      const { data: consultas, error: consultasError } = await consultasQuery;

      if (consultasError) throw consultasError;

      // Buscar orçamentos
      let orcamentosQuery = client
        .from('orcamentos')
        .select('*');

      if (empresaId) {
        orcamentosQuery = orcamentosQuery.eq('empresa_id', empresaId);
      }

      if (startDate) {
        orcamentosQuery = orcamentosQuery.gte('created_at', startDate);
      }

      if (endDate) {
        orcamentosQuery = orcamentosQuery.lte('created_at', endDate);
      }

      const { data: orcamentos, error: orcamentosError } = await orcamentosQuery;

      if (orcamentosError) throw orcamentosError;

      // Calcular estatísticas
      const totalRevenue = consultas?.filter(c => c.pago).reduce((sum, c) => sum + (c.valor || 0), 0) || 0;
      const totalProcedures = consultas?.length || 0;
      const avgTicket = totalProcedures > 0 ? totalRevenue / totalProcedures : 0;

      // Orçamentos
      const totalBudgets = orcamentos?.length || 0;
      const approvedBudgets = orcamentos?.filter(o => o.status === 'aprovado').length || 0;
      const pendingBudgets = orcamentos?.filter(o => o.status === 'pendente').length || 0;
      const rejectedBudgets = orcamentos?.filter(o => o.status === 'recusado').length || 0;
      const approvalRate = totalBudgets > 0 ? (approvedBudgets / totalBudgets) * 100 : 0;

      const totalBudgetValue = orcamentos?.reduce((sum, o) => sum + (o.valor_total || 0), 0) || 0;
      const approvedBudgetValue = orcamentos?.filter(o => o.status === 'aprovado').reduce((sum, o) => sum + (o.valor_final || o.valor_total || 0), 0) || 0;

      return {
        success: true,
        data: {
          totalRevenue,
          totalProcedures,
          avgTicket,
          budgets: {
            total: totalBudgets,
            approved: approvedBudgets,
            pending: pendingBudgets,
            rejected: rejectedBudgets,
            approvalRate,
            totalValue: totalBudgetValue,
            approvedValue: approvedBudgetValue
          }
        }
      };
    } catch (error) {
      console.error('Erro ao buscar relatório financeiro:', error);
      throw error;
    }
  }

  async getProductivityReport(empresaId?: string, startDate?: string, endDate?: string) {
    try {
      const client = this.supabaseService.getClient();

      // Buscar consultas por profissional
      let query = client
        .from('consultas')
        .select('*')
        .eq('status', 'realizado');

      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      if (startDate) {
        query = query.gte('data_consulta', startDate);
      }

      if (endDate) {
        query = query.lte('data_consulta', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Buscar nomes dos dentistas separadamente
      const dentistasIds = [...new Set((data || []).map(c => c.dentista_id).filter(Boolean))];
      const dentistasMap: any = {};
      
      if (dentistasIds.length > 0) {
        const { data: dentistas } = await client
          .from('usuarios')
          .select('id, nome')
          .in('id', dentistasIds);
        
        (dentistas || []).forEach(d => {
          dentistasMap[d.id] = d.nome;
        });
      }

      // Agrupar por profissional
      const professionalStats = (data || []).reduce((acc: any, consulta: any) => {
        const nome = dentistasMap[consulta.dentista_id] || 'Não especificado';
        if (!acc[nome]) {
          acc[nome] = {
            name: nome,
            procedures: 0,
            revenue: 0,
            totalDuration: 0
          };
        }
        acc[nome].procedures += 1;
        acc[nome].revenue += consulta.valor || 0;
        acc[nome].totalDuration += consulta.duracao_minutos || 0;
        return acc;
      }, {});

      // Calcular taxa de ocupação da agenda
      const totalConsultas = await client
        .from('consultas')
        .select('*', { count: 'exact', head: true })
        .gte('data_consulta', startDate || '2024-01-01')
        .lte('data_consulta', endDate || new Date().toISOString().split('T')[0]);

      const consultasRealizadas = await client
        .from('consultas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'realizado')
        .gte('data_consulta', startDate || '2024-01-01')
        .lte('data_consulta', endDate || new Date().toISOString().split('T')[0]);

      const consultasCanceladas = await client
        .from('consultas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelado')
        .gte('data_consulta', startDate || '2024-01-01')
        .lte('data_consulta', endDate || new Date().toISOString().split('T')[0]);

      const totalCount = totalConsultas.count || 0;
      const realizedCount = consultasRealizadas.count || 0;
      const cancelledCount = consultasCanceladas.count || 0;
      const occupationRate = totalCount > 0 ? (realizedCount / totalCount) * 100 : 0;
      const cancellationRate = totalCount > 0 ? (cancelledCount / totalCount) * 100 : 0;

      return {
        success: true,
        data: {
          professionals: Object.values(professionalStats),
          schedule: {
            totalSlots: totalCount,
            completed: realizedCount,
            cancelled: cancelledCount,
            occupationRate,
            cancellationRate
          }
        }
      };
    } catch (error) {
      console.error('Erro ao buscar relatório de produtividade:', error);
      throw error;
    }
  }

  async getPatientsReport(empresaId?: string) {
    try {
      const client = this.supabaseService.getClient();

      // Total de pacientes
      let patientsQuery = client
        .from('clientelA')
        .select('*', { count: 'exact', head: true });

      if (empresaId) {
        patientsQuery = patientsQuery.eq('empresa', empresaId);
      }

      const { count: totalPatients } = await patientsQuery;

      // Pacientes ativos
      const { count: activePatients } = await client
        .from('clientelA')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo');

      // Novos pacientes este mês
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);

      const { count: newPatientsThisMonth } = await client
        .from('clientelA')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      return {
        success: true,
        data: {
          totalPatients: totalPatients || 0,
          activePatients: activePatients || 0,
          newPatientsThisMonth: newPatientsThisMonth || 0
        }
      };
    } catch (error) {
      console.error('Erro ao buscar relatório de pacientes:', error);
      throw error;
    }
  }
}

