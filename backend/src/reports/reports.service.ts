import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ReportsService {
  constructor(private supabaseService: SupabaseService) {}

  async getProceduresReport(empresaId: string, startDate?: string, endDate?: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      const client = this.supabaseService.getAdminClient();
      
      // Buscar consultas realizadas
      let query = client
        .from('consultas')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('status', 'realizado');

      if (startDate) {
        query = query.gte('data_consulta', startDate);
      }

      if (endDate) {
        query = query.lte('data_consulta', endDate);
      }

      const { data, error } = await query.order('data_consulta', { ascending: false });

      if (error) throw error;

      // Buscar catálogo de procedimentos para pegar duração estimada
      const { data: procedimentosCatalogo, error: errorProcedimentos } = await client
        .from('procedimentos')
        .select('nome, tempo_estimado_min')
        .eq('empresa_id', empresaId)
        .eq('ativo', true);

      if (errorProcedimentos) {
        console.error('[ReportsService.getProceduresReport] Erro ao buscar procedimentos:', errorProcedimentos);
      }

      // Criar mapa de duração por nome do procedimento (case-insensitive)
      const duracaoPorProcedimento: any = {};
      (procedimentosCatalogo || []).forEach((proc: any) => {
        if (proc.nome && proc.tempo_estimado_min) {
          const nomeNormalizado = proc.nome.toLowerCase().trim();
          duracaoPorProcedimento[nomeNormalizado] = proc.tempo_estimado_min;
        }
      });

      console.log('[ReportsService.getProceduresReport] Catálogo de procedimentos:', {
        total: procedimentosCatalogo?.length || 0,
        duracaoPorProcedimento
      });

      // Buscar pagamentos relacionados às consultas para ter receita real
      const consultaIds = (data || []).map(c => c.id);
      let pagamentosPorConsulta: any = {};
      
      if (consultaIds.length > 0) {
        const { data: pagamentos } = await client
          .from('pagamentos')
          .select('consulta_id, valor, descricao')
          .eq('empresa_id', empresaId)
          .eq('confirmado', true)
          .in('consulta_id', consultaIds);
        
        (pagamentos || []).forEach(p => {
          if (p.consulta_id) {
            if (!pagamentosPorConsulta[p.consulta_id]) {
              pagamentosPorConsulta[p.consulta_id] = 0;
            }
            pagamentosPorConsulta[p.consulta_id] += p.valor || 0;
          }
        });
      }

      // Buscar também pagamentos sem consulta_id (pagamentos diretos) para incluir nos procedimentos
      let pagamentosDiretosQuery = client
        .from('pagamentos')
        .select('descricao, valor')
        .eq('empresa_id', empresaId)
        .eq('confirmado', true)
        .is('consulta_id', null);

      if (startDate) {
        pagamentosDiretosQuery = pagamentosDiretosQuery.gte('data_pagamento', startDate);
      }

      if (endDate) {
        pagamentosDiretosQuery = pagamentosDiretosQuery.lte('data_pagamento', endDate);
      }

      const { data: pagamentosDiretos } = await pagamentosDiretosQuery;

      // Agrupar pagamentos diretos por descrição (procedimento)
      const pagamentosDiretosPorProcedimento: any = {};
      (pagamentosDiretos || []).forEach((p: any) => {
        const nome = p.descricao || 'Pagamento Direto';
        if (!pagamentosDiretosPorProcedimento[nome]) {
          pagamentosDiretosPorProcedimento[nome] = {
            revenue: 0,
            quantity: 0
          };
        }
        pagamentosDiretosPorProcedimento[nome].revenue += p.valor || 0;
        pagamentosDiretosPorProcedimento[nome].quantity += 1;
      });

      // Agrupar por procedimento das consultas
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
        // Usar receita dos pagamentos se disponível, senão usar valor da consulta
        const receita = pagamentosPorConsulta[consulta.id] || consulta.valor || 0;
        acc[nome].revenue += receita;
        
        // Buscar duração da consulta ou do catálogo de procedimentos
        const duracaoConsulta = consulta.duracao_minutos || 0;
        const nomeProcedimentoNormalizado = consulta.procedimento 
          ? consulta.procedimento.toLowerCase().trim() 
          : '';
        const duracaoCatalogo = nomeProcedimentoNormalizado 
          ? duracaoPorProcedimento[nomeProcedimentoNormalizado] || 0
          : 0;
        
        // Priorizar duração da consulta, senão usar do catálogo, senão usar 30 minutos como padrão
        const duracao = duracaoConsulta || duracaoCatalogo || 30;
        
        acc[nome].totalDuration += duracao;
        // Calcular duração média sempre que adicionar uma nova consulta
        acc[nome].avgDuration = acc[nome].quantity > 0 ? acc[nome].totalDuration / acc[nome].quantity : 0;
        
        // Log para debug
        if (duracao === 0 || !duracaoConsulta) {
          console.log('[ReportsService.getProceduresReport] Duração encontrada:', {
            procedimento: consulta.procedimento,
            duracaoConsulta,
            duracaoCatalogo,
            duracaoFinal: duracao,
            nomeProcedimentoNormalizado,
            encontradoNoCatalogo: !!duracaoCatalogo
          });
        }
        
        return acc;
      }, {});

      // Adicionar procedimentos de pagamentos diretos
      Object.entries(pagamentosDiretosPorProcedimento).forEach(([nome, stats]: [string, any]) => {
        if (!procedureStats[nome]) {
          procedureStats[nome] = {
            name: nome,
            quantity: 0,
            revenue: 0,
            totalDuration: 0,
            avgDuration: 0
          };
        }
        procedureStats[nome].quantity += stats.quantity;
        procedureStats[nome].revenue += stats.revenue;
        // Tentar buscar duração do catálogo de procedimentos para pagamentos diretos
        const nomeNormalizado = nome.toLowerCase().trim();
        const duracaoCatalogo = duracaoPorProcedimento[nomeNormalizado] || 0;
        const duracaoFinal = duracaoCatalogo || 30; // Usar 30 minutos como padrão se não encontrar
        procedureStats[nome].totalDuration += duracaoFinal * stats.quantity;
        procedureStats[nome].avgDuration = procedureStats[nome].totalDuration / procedureStats[nome].quantity;
      });

      const proceduresArray = Object.values(procedureStats);
      
      // Garantir que todos os procedimentos tenham duração média calculada
      proceduresArray.forEach((proc: any) => {
        if (proc.avgDuration === 0 && proc.quantity > 0) {
          // Se ainda está zerado, tentar buscar do catálogo novamente
          const nomeNormalizado = proc.name.toLowerCase().trim();
          const duracaoCatalogo = duracaoPorProcedimento[nomeNormalizado] || 0;
          if (duracaoCatalogo > 0) {
            proc.totalDuration = duracaoCatalogo * proc.quantity;
            proc.avgDuration = duracaoCatalogo;
          } else {
            // Usar 30 minutos como padrão
            proc.totalDuration = 30 * proc.quantity;
            proc.avgDuration = 30;
          }
        }
      });

      console.log('[ReportsService.getProceduresReport] Procedimentos encontrados:', {
        empresaId,
        totalConsultas: data?.length || 0,
        totalPagamentosDiretos: pagamentosDiretos?.length || 0,
        totalProcedimentos: proceduresArray.length,
        duracaoPorProcedimento,
        procedures: proceduresArray.map((p: any) => ({
          name: p.name,
          quantity: p.quantity,
          revenue: p.revenue,
          avgDuration: p.avgDuration,
          totalDuration: p.totalDuration
        })),
        consultasSample: data?.slice(0, 3).map((c: any) => ({
          procedimento: c.procedimento,
          duracao_minutos: c.duracao_minutos
        }))
      });

      return {
        success: true,
        data: proceduresArray,
        total: proceduresArray.length
      };
    } catch (error) {
      console.error('Erro ao buscar relatório de procedimentos:', error);
      throw error;
    }
  }

  async getFinancialReport(empresaId: string, startDate?: string, endDate?: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      const client = this.supabaseService.getAdminClient();

      // Buscar pagamentos confirmados (fonte principal de receita)
      let pagamentosQuery = client
        .from('pagamentos')
        .select('*')
        .eq('empresa_id', Number(empresaId))
        .eq('confirmado', true);

      if (startDate) {
        pagamentosQuery = pagamentosQuery.gte('data_pagamento', startDate);
      }

      if (endDate) {
        pagamentosQuery = pagamentosQuery.lte('data_pagamento', endDate);
      }

      const { data: pagamentos, error: pagamentosError } = await pagamentosQuery;

      if (pagamentosError) throw pagamentosError;

      // Buscar consultas realizadas (para estatísticas de procedimentos)
      let consultasQuery = client
        .from('consultas')
        .select('*')
        .eq('empresa_id', Number(empresaId))
        .eq('status', 'realizado');

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
        .select('*')
        .eq('empresa_id', Number(empresaId));

      if (startDate) {
        orcamentosQuery = orcamentosQuery.gte('created_at', startDate);
      }

      if (endDate) {
        orcamentosQuery = orcamentosQuery.lte('created_at', endDate);
      }

      const { data: orcamentos, error: orcamentosError } = await orcamentosQuery;

      if (orcamentosError) throw orcamentosError;

      // Calcular estatísticas baseadas em PAGAMENTOS (fonte de verdade)
      const totalRevenue = pagamentos?.reduce((sum, p) => sum + (p.valor || 0), 0) || 0;
      const totalPayments = pagamentos?.length || 0;
      const avgTicket = totalPayments > 0 ? totalRevenue / totalPayments : 0;

      // Estatísticas por forma de pagamento
      const byPaymentMethod = pagamentos?.reduce((acc, p) => {
        const method = p.forma_pagamento || 'outros';
        acc[method] = (acc[method] || 0) + (p.valor || 0);
        return acc;
      }, {} as Record<string, number>) || {};

      // Estatísticas de procedimentos
      const totalProcedures = consultas?.length || 0;
      const paidProcedures = consultas?.filter(c => c.pago).length || 0;
      const paymentRate = totalProcedures > 0 ? (paidProcedures / totalProcedures) * 100 : 0;

      // Orçamentos
      const totalBudgets = orcamentos?.length || 0;
      const approvedBudgets = orcamentos?.filter(o => {
        const status = (o.status || '').toLowerCase();
        return status === 'aprovado';
      }).length || 0;
      const pendingBudgets = orcamentos?.filter(o => {
        const status = (o.status || '').toLowerCase();
        return status === 'enviado' || status === 'rascunho';
      }).length || 0;
      const rejectedBudgets = orcamentos?.filter(o => {
        const status = (o.status || '').toLowerCase();
        return status === 'recusado' || status === 'cancelado';
      }).length || 0;
      // Taxa de aprovação: aprovados / (aprovados + recusados) - não incluir pendentes/rascunhos
      const processedBudgets = approvedBudgets + rejectedBudgets;
      const approvalRate = processedBudgets > 0 ? (approvedBudgets / processedBudgets) * 100 : 0;

      const totalBudgetValue = orcamentos?.reduce((sum, o) => sum + (o.valor_total || 0), 0) || 0;
      const approvedBudgetValue = orcamentos?.filter(o => {
        const status = (o.status || '').toLowerCase();
        return status === 'aprovado';
      }).reduce((sum, o) => sum + (o.valor_final || o.valor_total || 0), 0) || 0;

      console.log('[ReportsService.getFinancialReport] Estatísticas de orçamentos:', {
        totalBudgets,
        approvedBudgets,
        pendingBudgets,
        rejectedBudgets,
        processedBudgets,
        approvalRate,
        totalBudgetValue,
        approvedBudgetValue
      });

      return {
        success: true,
        data: {
          totalRevenue, // Baseado em pagamentos confirmados
          totalPayments,
          totalProcedures,
          paidProcedures,
          paymentRate,
          avgTicket,
          byPaymentMethod,
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

  async getProductivityReport(empresaId: string, startDate?: string, endDate?: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      const client = this.supabaseService.getAdminClient();

      // Buscar consultas por profissional
      let query = client
        .from('consultas')
        .select('*')
        .eq('empresa_id', Number(empresaId))
        .eq('status', 'realizado');

      if (startDate) {
        query = query.gte('data_consulta', startDate);
      }

      if (endDate) {
        query = query.lte('data_consulta', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Buscar nomes dos dentistas separadamente (filtrar por empresa também)
      const dentistasIds = [...new Set((data || []).map(c => c.dentista_id).filter(Boolean))];
      const dentistasMap: any = {};
      
      if (dentistasIds.length > 0) {
        const { data: dentistas } = await client
          .from('usuarios')
          .select('id, nome')
          .eq('empresa_id', empresaId)
          .in('id', dentistasIds);
        
        (dentistas || []).forEach(d => {
          dentistasMap[d.id] = d.nome;
        });
      }

      // Buscar receita dos pagamentos para cada profissional
      const consultaIds = (data || []).map(c => c.id);
      let pagamentosPorConsulta: any = {};
      
      if (consultaIds.length > 0) {
        const { data: pagamentos } = await client
          .from('pagamentos')
          .select('consulta_id, valor')
          .eq('empresa_id', empresaId)
          .eq('confirmado', true)
          .in('consulta_id', consultaIds);
        
        (pagamentos || []).forEach(p => {
          if (p.consulta_id) {
            if (!pagamentosPorConsulta[p.consulta_id]) {
              pagamentosPorConsulta[p.consulta_id] = 0;
            }
            pagamentosPorConsulta[p.consulta_id] += p.valor || 0;
          }
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
        // Usar receita dos pagamentos se disponível, senão usar valor da consulta
        const receita = pagamentosPorConsulta[consulta.id] || consulta.valor || 0;
        acc[nome].revenue += receita;
        acc[nome].totalDuration += consulta.duracao_minutos || 0;
        return acc;
      }, {});

      // Calcular taxa de ocupação da agenda
      const dateStart = startDate || '2024-01-01';
      const dateEnd = endDate || new Date().toISOString().split('T')[0];

      // Converter empresaId para número se necessário (banco usa número)
      const empresaIdNum = typeof empresaId === 'string' ? Number(empresaId) : empresaId;

      console.log('[ReportsService.getProductivityReport] Buscando consultas para taxa de ocupação:', {
        empresaId,
        empresaIdNum,
        dateStart,
        dateEnd,
        empresaIdType: typeof empresaId
      });

      // Primeiro, verificar se há consultas para esta empresa (sem filtro de data)
      const { data: todasConsultasEmpresa, count: totalEmpresa } = await client
        .from('consultas')
        .select('id, status, data_consulta, empresa_id', { count: 'exact' })
        .eq('empresa_id', empresaIdNum)
        .limit(5);

      console.log('[ReportsService.getProductivityReport] Consultas da empresa (amostra):', {
        totalEmpresa,
        amostra: todasConsultasEmpresa
      });

      // Buscar todas as consultas no período (independente de status)
      const { data: todasConsultas, error: errorTodas } = await client
        .from('consultas')
        .select('id, status, data_consulta, empresa_id')
        .eq('empresa_id', empresaIdNum)
        .gte('data_consulta', dateStart)
        .lte('data_consulta', dateEnd);

      if (errorTodas) {
        console.error('[ReportsService.getProductivityReport] Erro ao buscar todas consultas:', errorTodas);
      }

      // Buscar consultas realizadas OU confirmadas (ambas contam como ocupadas)
      const { data: consultasRealizadasData, error: errorRealizadas } = await client
        .from('consultas')
        .select('id, status, data_consulta, empresa_id')
        .eq('empresa_id', empresaIdNum)
        .in('status', ['realizado', 'confirmado'])
        .gte('data_consulta', dateStart)
        .lte('data_consulta', dateEnd);

      if (errorRealizadas) {
        console.error('[ReportsService.getProductivityReport] Erro ao buscar consultas realizadas:', errorRealizadas);
      }

      // Buscar consultas canceladas
      const { data: consultasCanceladasData, error: errorCanceladas } = await client
        .from('consultas')
        .select('id, status, data_consulta, empresa_id')
        .eq('empresa_id', empresaIdNum)
        .eq('status', 'cancelado')
        .gte('data_consulta', dateStart)
        .lte('data_consulta', dateEnd);

      if (errorCanceladas) {
        console.error('[ReportsService.getProductivityReport] Erro ao buscar consultas canceladas:', errorCanceladas);
      }

      const totalCount = todasConsultas?.length || 0;
      const realizedCount = consultasRealizadasData?.length || 0;
      const cancelledCount = consultasCanceladasData?.length || 0;
      const occupationRate = totalCount > 0 ? (realizedCount / totalCount) * 100 : 0;
      const cancellationRate = totalCount > 0 ? (cancelledCount / totalCount) * 100 : 0;

      console.log('[ReportsService.getProductivityReport] Taxa de ocupação:', {
        empresaId,
        totalCount,
        realizedCount,
        cancelledCount,
        occupationRate,
        cancellationRate,
        dateStart,
        dateEnd,
        todasConsultasCount: todasConsultas?.length,
        consultasRealizadasCount: consultasRealizadasData?.length,
        consultasCanceladasCount: consultasCanceladasData?.length,
        todasConsultasSample: todasConsultas?.slice(0, 5).map((c: any) => ({ 
          id: c.id, 
          status: c.status, 
          data: c.data_consulta, 
          empresa_id: c.empresa_id 
        })),
        consultasRealizadasSample: consultasRealizadasData?.slice(0, 3).map((c: any) => ({ 
          id: c.id, 
          status: c.status, 
          data: c.data_consulta 
        }))
      });

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

  async getPatientsReport(empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      const client = this.supabaseService.getAdminClient();

      // Normalizar empresaId para comparação
      const empresaIdNum = Number(empresaId);
      const empresaIdStr = empresaId.toString();

      // Total de pacientes
      const { count: totalPatients } = await client
        .from('clientelA')
        .select('*', { count: 'exact', head: true })
        .or(`empresa.eq.${empresaIdNum},empresa.eq.${empresaIdStr}`);

      // Pacientes ativos
      const { count: activePatients } = await client
        .from('clientelA')
        .select('*', { count: 'exact', head: true })
        .or(`empresa.eq.${empresaIdNum},empresa.eq.${empresaIdStr}`)
        .eq('status', 'ativo');

      // Novos pacientes este mês
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);

      const { count: newPatientsThisMonth } = await client
        .from('clientelA')
        .select('*', { count: 'exact', head: true })
        .or(`empresa.eq.${empresaIdNum},empresa.eq.${empresaIdStr}`)
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

