import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePaymentDto, PaymentMethod } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

export interface Payment {
  id: string;
  created_at: string;
  updated_at: string;
  empresa_id: string;
  consulta_id?: string;
  paciente_id: string;
  valor: number;
  forma_pagamento: PaymentMethod;
  data_pagamento: string;
  observacoes?: string;
  descricao?: string;
  confirmado: boolean;
  paciente_nome?: string;
  consulta_data?: string;
  consulta_procedimento?: string;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createPaymentDto: CreatePaymentDto, empresaId: string): Promise<Payment> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      // Verificar se o paciente pertence à empresa
      const { data: paciente, error: pacienteError } = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('id, empresa, nome')
        .eq('id', createPaymentDto.paciente_id)
        .maybeSingle();

      if (pacienteError || !paciente) {
        throw new NotFoundException('Paciente não encontrado');
      }

      const pacienteEmpresa = paciente.empresa?.toString();
      const empresaIdStr = empresaId.toString();
      
      if (pacienteEmpresa !== empresaIdStr && Number(pacienteEmpresa) !== Number(empresaIdStr)) {
        throw new BadRequestException('Paciente não pertence à empresa');
      }

      // Se há consulta_id, verificar se a consulta pertence à empresa
      if (createPaymentDto.consulta_id) {
        const { data: consulta, error: consultaError } = await this.supabaseService
          .getAdminClient()
          .from('consultas')
          .select('id, empresa_id, cliente_id, valor, procedimento, data_consulta')
          .eq('id', createPaymentDto.consulta_id)
          .maybeSingle();

        if (consultaError || !consulta) {
          throw new NotFoundException('Consulta não encontrada');
        }

        if (consulta.empresa_id?.toString() !== empresaId.toString()) {
          throw new BadRequestException('Consulta não pertence à empresa');
        }

        // Atualizar a consulta como paga
        await this.supabaseService
          .getAdminClient()
          .from('consultas')
          .update({
            pago: true,
            forma_pagamento: createPaymentDto.forma_pagamento,
            valor: createPaymentDto.valor || consulta.valor,
            updated_at: new Date().toISOString()
          })
          .eq('id', createPaymentDto.consulta_id);
      }

      // Criar registro de pagamento
      // Converter paciente_id de string para integer (clientelA.id é INTEGER)
      const pacienteIdInt = typeof createPaymentDto.paciente_id === 'string' 
        ? parseInt(createPaymentDto.paciente_id, 10) 
        : createPaymentDto.paciente_id;
      
      if (isNaN(pacienteIdInt)) {
        throw new BadRequestException('ID do paciente inválido');
      }

      const paymentData = {
        empresa_id: empresaId,
        consulta_id: createPaymentDto.consulta_id || null,
        paciente_id: pacienteIdInt,
        valor: createPaymentDto.valor,
        forma_pagamento: createPaymentDto.forma_pagamento,
        data_pagamento: createPaymentDto.data_pagamento || new Date().toISOString().split('T')[0],
        observacoes: createPaymentDto.observacoes || null,
        descricao: createPaymentDto.descricao || null,
        confirmado: createPaymentDto.confirmado !== undefined ? createPaymentDto.confirmado : true,
      };

      const { data: payment, error: paymentError } = await this.supabaseService
        .getAdminClient()
        .from('pagamentos')
        .insert(paymentData)
        .select()
        .single();

      if (paymentError) {
        console.error('Erro ao criar pagamento:', paymentError);
        throw new BadRequestException(`Erro ao criar pagamento: ${paymentError.message}`);
      }

      // Buscar dados relacionados para retornar
      return await this.enrichPaymentData(payment);
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }

  async findAll(empresaId: string, filters?: {
    paciente_id?: string;
    consulta_id?: string;
    data_inicio?: string;
    data_fim?: string;
    forma_pagamento?: PaymentMethod;
    confirmado?: boolean;
  }): Promise<Payment[]> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      let query = this.supabaseService
        .getAdminClient()
        .from('pagamentos')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('data_pagamento', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.paciente_id) {
        query = query.eq('paciente_id', filters.paciente_id);
      }

      if (filters?.consulta_id) {
        query = query.eq('consulta_id', filters.consulta_id);
      }

      if (filters?.data_inicio) {
        query = query.gte('data_pagamento', filters.data_inicio);
      }

      if (filters?.data_fim) {
        query = query.lte('data_pagamento', filters.data_fim);
      }

      if (filters?.forma_pagamento) {
        query = query.eq('forma_pagamento', filters.forma_pagamento);
      }

      if (filters?.confirmado !== undefined) {
        query = query.eq('confirmado', filters.confirmado);
      }

      const { data: payments, error } = await query;

      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        throw new BadRequestException(`Erro ao buscar pagamentos: ${error.message}`);
      }

      // Enriquecer dados de cada pagamento
      const enrichedPayments = await Promise.all(
        (payments || []).map(payment => this.enrichPaymentData(payment))
      );

      return enrichedPayments;
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
  }

  async findOne(id: string, empresaId: string): Promise<Payment> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { data: payment, error } = await this.supabaseService
      .getAdminClient()
      .from('pagamentos')
      .select('*')
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .single();

    if (error || !payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return await this.enrichPaymentData(payment);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, empresaId: string): Promise<Payment> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    // Preparar dados de atualização, convertendo paciente_id se necessário
    const updateData: any = {
      ...updatePaymentDto,
      updated_at: new Date().toISOString()
    };

    // Se paciente_id está sendo atualizado, converter para integer
    if (updatePaymentDto.paciente_id !== undefined) {
      const pacienteIdInt = typeof updatePaymentDto.paciente_id === 'string' 
        ? parseInt(updatePaymentDto.paciente_id, 10) 
        : updatePaymentDto.paciente_id;
      
      if (isNaN(pacienteIdInt)) {
        throw new BadRequestException('ID do paciente inválido');
      }
      updateData.paciente_id = pacienteIdInt;
    }

    const { data: payment, error } = await this.supabaseService
      .getAdminClient()
      .from('pagamentos')
      .update(updateData)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .select()
      .single();

    if (error || !payment) {
      throw new NotFoundException('Pagamento não encontrado ou não pertence à empresa');
    }

    return await this.enrichPaymentData(payment);
  }

  async remove(id: string, empresaId: string): Promise<void> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    // Se o pagamento está vinculado a uma consulta, reverter o status de pago
    const { data: payment } = await this.supabaseService
      .getAdminClient()
      .from('pagamentos')
      .select('consulta_id')
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .single();

    if (payment?.consulta_id) {
      await this.supabaseService
        .getAdminClient()
        .from('consultas')
        .update({
          pago: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.consulta_id);
    }

    const { error } = await this.supabaseService
      .getAdminClient()
      .from('pagamentos')
      .delete()
      .eq('id', id)
      .eq('empresa_id', empresaId);

    if (error) {
      throw new NotFoundException('Pagamento não encontrado ou não pertence à empresa');
    }
  }

  async getFinancialSummary(empresaId: string, startDate?: string, endDate?: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      let query = this.supabaseService
        .getAdminClient()
        .from('pagamentos')
        .select('valor, forma_pagamento, confirmado')
        .eq('empresa_id', empresaId)
        .eq('confirmado', true);

      if (startDate) {
        query = query.gte('data_pagamento', startDate);
      }

      if (endDate) {
        query = query.lte('data_pagamento', endDate);
      }

      const { data: payments, error } = await query;

      if (error) {
        throw new BadRequestException(`Erro ao buscar resumo financeiro: ${error.message}`);
      }

      const total = payments?.reduce((sum, p) => sum + (p.valor || 0), 0) || 0;

      const byMethod = payments?.reduce((acc, p) => {
        const method = p.forma_pagamento || 'outros';
        acc[method] = (acc[method] || 0) + (p.valor || 0);
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        total,
        quantidade: payments?.length || 0,
        por_forma_pagamento: byMethod,
        periodo: {
          inicio: startDate || null,
          fim: endDate || null
        }
      };
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      throw error;
    }
  }

  private async enrichPaymentData(payment: any): Promise<Payment> {
    // Buscar dados do paciente
    let pacienteNome = null;
    if (payment.paciente_id) {
      const { data: paciente } = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('nome')
        .eq('id', payment.paciente_id)
        .maybeSingle();
      pacienteNome = paciente?.nome || null;
    }

    // Buscar dados da consulta se houver
    let consultaData = null;
    let consultaProcedimento = null;
    if (payment.consulta_id) {
      const { data: consulta } = await this.supabaseService
        .getAdminClient()
        .from('consultas')
        .select('data_consulta, procedimento')
        .eq('id', payment.consulta_id)
        .maybeSingle();
      consultaData = consulta?.data_consulta || null;
      consultaProcedimento = consulta?.procedimento || null;
    }

    return {
      ...payment,
      paciente_nome: pacienteNome,
      consulta_data: consultaData,
      consulta_procedimento: consultaProcedimento,
    };
  }
}

