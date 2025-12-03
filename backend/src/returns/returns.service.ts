import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, NotificationPriority } from '../notifications/dto/create-notification.dto';

export interface ReturnWithPatient {
  id: string;
  created_at: string;
  updated_at: string;
  empresa_id: string;
  cliente_id: string;
  consulta_original_id: string | null;
  data_retorno: string;
  hora_retorno: string;
  motivo: string;
  procedimento: string;
  status: string;
  observacoes: string | null;
  // Dados do paciente
  paciente_nome: string;
  paciente_telefone: string;
  paciente_email: string | null;
  // Dados da consulta original (se existir)
  consulta_original_data?: string;
  consulta_original_procedimento?: string;
}

@Injectable()
export class ReturnsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService
  ) {}

  async findAll(empresaId: string): Promise<ReturnWithPatient[]> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('retornos')
      .select(`
        *,
        clientelA (
          nome,
          telefone,
          Email
        )
      `)
      .eq('empresa_id', empresaId)
      .order('data_retorno', { ascending: true });

    if (error) {
      console.error('Erro ao buscar retornos:', error);
      throw new Error(`Erro ao buscar retornos: ${error.message}`);
    }

    return data.map(returnItem => ({
      id: returnItem.id,
      created_at: returnItem.created_at,
      updated_at: returnItem.updated_at,
      empresa_id: returnItem.empresa_id,
      cliente_id: returnItem.cliente_id.toString(),
      consulta_original_id: returnItem.consulta_original_id,
      data_retorno: returnItem.data_retorno,
      hora_retorno: returnItem.hora_retorno,
      motivo: returnItem.motivo,
      procedimento: returnItem.procedimento,
      status: returnItem.status,
      observacoes: returnItem.observacoes,
      paciente_nome: returnItem.clientelA?.nome || 'Nome não encontrado',
      paciente_telefone: returnItem.clientelA?.telefone || 'Telefone não encontrado',
      paciente_email: returnItem.clientelA?.Email,
      consulta_original_data: null, // Temporariamente null
      consulta_original_procedimento: null, // Temporariamente null
    }));
  }

  async findConfirmedReturns(empresaId: string): Promise<ReturnWithPatient[]> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('retornos')
      .select(`
        *,
        clientelA (
          nome,
          telefone,
          Email
        )
      `)
      .eq('empresa_id', empresaId)
      .in('status', ['pendente', 'confirmado', 'realizado'])
      .order('data_retorno', { ascending: true });

    if (error) {
      console.error('Erro ao buscar retornos confirmados:', error);
      throw new Error(`Erro ao buscar retornos confirmados: ${error.message}`);
    }

    const now = new Date();
    
    // Filtrar retornos que não estão atrasados
    const notOverdue = data.filter(returnItem => {
      const returnDateTime = new Date(`${returnItem.data_retorno}T${returnItem.hora_retorno || '00:00:00'}`);
      return returnDateTime >= now;
    });

    console.log('[ReturnsService.findConfirmedReturns] Total de retornos encontrados:', notOverdue.length);
    notOverdue.forEach((returnItem, index) => {
      console.log(`[ReturnsService.findConfirmedReturns] Retorno ${index + 1}:`, {
        id: returnItem.id,
        cliente_id: returnItem.cliente_id,
        clientelA: returnItem.clientelA,
        paciente_nome: returnItem.clientelA?.nome || `Paciente ${returnItem.cliente_id}`
      });
    });

    return notOverdue.map(returnItem => {
      const pacienteNome = returnItem.clientelA?.nome || `Paciente ${returnItem.cliente_id}`;
      console.log(`[ReturnsService.findConfirmedReturns] Mapeando retorno ${returnItem.id}: paciente_nome = ${pacienteNome}`);
      
      return {
        id: returnItem.id,
        created_at: returnItem.created_at,
        updated_at: returnItem.updated_at,
        empresa_id: returnItem.empresa_id,
        cliente_id: returnItem.cliente_id.toString(),
        consulta_original_id: returnItem.consulta_original_id,
        data_retorno: returnItem.data_retorno,
        hora_retorno: returnItem.hora_retorno,
        motivo: returnItem.motivo,
        procedimento: returnItem.procedimento,
        status: returnItem.status,
        observacoes: returnItem.observacoes,
        paciente_nome: pacienteNome,
        paciente_telefone: returnItem.clientelA?.telefone || 'Telefone não encontrado',
        paciente_email: returnItem.clientelA?.Email || null,
        consulta_original_data: null,
        consulta_original_procedimento: null,
      };
    });
  }

  async findPossibleReturns(empresaId: string): Promise<ReturnWithPatient[]> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('retornos')
      .select(`
        *,
        clientelA (
          nome,
          telefone,
          Email
        )
      `)
      .eq('empresa_id', empresaId)
      .eq('status', 'pendente')
      .order('data_retorno', { ascending: true });

    if (error) {
      console.error('Erro ao buscar possíveis retornos:', error);
      throw new Error(`Erro ao buscar possíveis retornos: ${error.message}`);
    }

    console.log('[ReturnsService.findPossibleReturns] Total de retornos encontrados:', data.length);
    data.forEach((returnItem, index) => {
      console.log(`[ReturnsService.findPossibleReturns] Retorno ${index + 1}:`, {
        id: returnItem.id,
        cliente_id: returnItem.cliente_id,
        clientelA: returnItem.clientelA,
        paciente_nome: returnItem.clientelA?.nome || `Paciente ${returnItem.cliente_id}`
      });
    });

    return data.map(returnItem => {
      const pacienteNome = returnItem.clientelA?.nome || `Paciente ${returnItem.cliente_id}`;
      return {
        id: returnItem.id,
        created_at: returnItem.created_at,
        updated_at: returnItem.updated_at,
        empresa_id: returnItem.empresa_id,
        cliente_id: returnItem.cliente_id.toString(),
        consulta_original_id: returnItem.consulta_original_id,
        data_retorno: returnItem.data_retorno,
        hora_retorno: returnItem.hora_retorno,
        motivo: returnItem.motivo,
        procedimento: returnItem.procedimento,
        status: returnItem.status,
        observacoes: returnItem.observacoes,
        paciente_nome: pacienteNome,
        paciente_telefone: returnItem.clientelA?.telefone || 'Telefone não encontrado',
        paciente_email: returnItem.clientelA?.Email || null,
        consulta_original_data: null,
        consulta_original_procedimento: null,
      };
    });
  }

  async findCompletedReturns(empresaId: string): Promise<ReturnWithPatient[]> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('retornos')
      .select(`
        *,
        clientelA (
          nome,
          telefone,
          Email
        )
      `)
      .eq('empresa_id', empresaId)
      .eq('status', 'realizado')
      .order('data_retorno', { ascending: false });

    if (error) {
      console.error('Erro ao buscar retornos realizados:', error);
      throw new Error(`Erro ao buscar retornos realizados: ${error.message}`);
    }

    console.log('[ReturnsService.findCompletedReturns] Total de retornos encontrados:', data.length);
    data.forEach((returnItem, index) => {
      console.log(`[ReturnsService.findCompletedReturns] Retorno ${index + 1}:`, {
        id: returnItem.id,
        cliente_id: returnItem.cliente_id,
        clientelA: returnItem.clientelA,
        paciente_nome: returnItem.clientelA?.nome || `Paciente ${returnItem.cliente_id}`
      });
    });

    return data.map(returnItem => {
      const pacienteNome = returnItem.clientelA?.nome || `Paciente ${returnItem.cliente_id}`;
      return {
        id: returnItem.id,
        created_at: returnItem.created_at,
        updated_at: returnItem.updated_at,
        empresa_id: returnItem.empresa_id,
        cliente_id: returnItem.cliente_id.toString(),
        consulta_original_id: returnItem.consulta_original_id,
        data_retorno: returnItem.data_retorno,
        hora_retorno: returnItem.hora_retorno,
        motivo: returnItem.motivo,
        procedimento: returnItem.procedimento,
        status: returnItem.status,
        observacoes: returnItem.observacoes,
        paciente_nome: pacienteNome,
        paciente_telefone: returnItem.clientelA?.telefone || 'Telefone não encontrado',
        paciente_email: returnItem.clientelA?.Email || null,
        consulta_original_data: null,
        consulta_original_procedimento: null,
      };
    });
  }

  async findOverdueReturns(empresaId: string): Promise<ReturnWithPatient[]> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('retornos')
        .select(`
          *,
          clientelA (
            nome,
            telefone,
            email
          )
        `)
        .eq('empresa_id', empresaId)
        .in('status', ['pendente', 'confirmado'])
        .lt('data_retorno', today);

      if (error) {
        console.error('Erro ao buscar retornos atrasados:', error);
        throw new Error(`Erro ao buscar retornos atrasados: ${error.message}`);
      }

      // Filtrar também por hora para retornos do mesmo dia
      const overdue = data.filter(returnItem => {
        try {
          const returnDateTime = new Date(`${returnItem.data_retorno}T${returnItem.hora_retorno || '00:00:00'}`);
          return returnDateTime < now;
        } catch (dateError) {
          console.error('Erro ao processar data do retorno:', returnItem.id, dateError);
          return false;
        }
      });

      console.log('[ReturnsService.findOverdueReturns] Total de retornos atrasados encontrados:', overdue.length);
      overdue.forEach((returnItem, index) => {
        console.log(`[ReturnsService.findOverdueReturns] Retorno ${index + 1}:`, {
          id: returnItem.id,
          cliente_id: returnItem.cliente_id,
          clientelA: returnItem.clientelA,
          paciente_nome: returnItem.clientelA?.nome || `Paciente ${returnItem.cliente_id}`
        });
      });

      return overdue.map(returnItem => {
        const pacienteNome = returnItem.clientelA?.nome || `Paciente ${returnItem.cliente_id}`;
        return {
          id: returnItem.id,
          created_at: returnItem.created_at,
          updated_at: returnItem.updated_at,
          empresa_id: returnItem.empresa_id,
          cliente_id: returnItem.cliente_id.toString(),
          consulta_original_id: returnItem.consulta_original_id,
          data_retorno: returnItem.data_retorno,
          hora_retorno: returnItem.hora_retorno,
          motivo: returnItem.motivo,
          procedimento: returnItem.procedimento,
          status: returnItem.status,
          observacoes: returnItem.observacoes,
          paciente_nome: pacienteNome,
          paciente_telefone: returnItem.clientelA?.telefone || 'Telefone não encontrado',
          paciente_email: returnItem.clientelA?.Email || null,
          consulta_original_data: null,
          consulta_original_procedimento: null,
        };
      });
    } catch (error) {
      console.error('Erro geral em findOverdueReturns:', error);
      return []; // Retornar array vazio em caso de erro
    }
  }

  async findOne(id: string, empresaId: string): Promise<ReturnWithPatient> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('retornos')
      .select(`
        *,
        clientelA (
          nome,
          telefone,
          Email
        )
      `)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .single();

    if (error) {
      console.error('Erro ao buscar retorno:', error);
      throw new Error(`Erro ao buscar retorno: ${error.message}`);
    }

    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      empresa_id: data.empresa_id,
      cliente_id: data.cliente_id.toString(),
      consulta_original_id: data.consulta_original_id,
      data_retorno: data.data_retorno,
      hora_retorno: data.hora_retorno,
      motivo: data.motivo,
      procedimento: data.procedimento,
      status: data.status,
      observacoes: data.observacoes,
      paciente_nome: data.clientelA?.nome || 'Nome não encontrado',
      paciente_telefone: data.clientelA?.telefone || 'Telefone não encontrado',
      paciente_email: data.clientelA?.Email,
      consulta_original_data: null, // Temporariamente null
      consulta_original_procedimento: null, // Temporariamente null
    };
  }

  async create(createReturnDto: any, empresaId: string): Promise<ReturnWithPatient> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      console.log('Dados recebidos para criar retorno:', createReturnDto);
      
      const clienteId = parseInt(createReturnDto.cliente_id);
      if (isNaN(clienteId)) {
        throw new Error(`cliente_id inválido: ${createReturnDto.cliente_id}`);
      }
      
      console.log('cliente_id convertido:', clienteId);
      
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('retornos')
        .insert({
          cliente_id: clienteId,
          consulta_original_id: createReturnDto.consulta_original_id,
          data_retorno: createReturnDto.data_retorno,
          hora_retorno: createReturnDto.hora_retorno,
          motivo: createReturnDto.motivo,
          procedimento: createReturnDto.procedimento,
          status: createReturnDto.status || 'pendente',
          observacoes: createReturnDto.observacoes,
          empresa_id: empresaId,
        })
      .select(`*`)
      .single();

    if (error) {
      console.error('Erro ao criar retorno:', error);
      throw new Error(`Erro ao criar retorno: ${error.message}`);
    }

    // Buscar dados do cliente separadamente
    const { data: clienteData, error: clienteError } = await this.supabaseService
      .getAdminClient()
      .from('clientelA')
      .select('nome, telefone, email')
      .eq('id', data.cliente_id)
      .single();

    // Criar notificação automática para retorno agendado
    try {
      const returnDate = new Date(`${data.data_retorno}T${data.hora_retorno || '09:00'}`);
      const now = new Date();
      const daysUntilReturn = (returnDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      // Se o retorno for amanhã ou hoje, criar notificação
      if (daysUntilReturn <= 1 && daysUntilReturn >= 0) {
        await this.notificationsService.create({
          type: NotificationType.RETURN,
          title: daysUntilReturn < 1 ? '🔄 Retorno Hoje' : '🔄 Retorno Amanhã',
          message: `Retorno de ${clienteData?.nome || 'Paciente'} ${daysUntilReturn < 1 ? 'hoje' : 'amanhã'} às ${data.hora_retorno || '09:00'} - ${data.procedimento || 'Retorno'}`,
          priority: NotificationPriority.NORMAL,
          data: {
            return_id: data.id,
            patient_name: clienteData?.nome,
            patient_id: data.cliente_id,
            date: data.data_retorno,
            time: data.hora_retorno,
            procedure: data.procedimento
          }
        }, empresaId);
        console.log('✅ Notificação criada para retorno agendado');
      }
    } catch (notifError) {
      console.error('Erro ao criar notificação automática (não crítico):', notifError);
      // Não falhar a criação do retorno se a notificação falhar
    }

    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      empresa_id: data.empresa_id?.toString() || '1',
      cliente_id: data.cliente_id.toString(),
      consulta_original_id: data.consulta_original_id,
      data_retorno: data.data_retorno,
      hora_retorno: data.hora_retorno,
      motivo: data.motivo,
      procedimento: data.procedimento,
      status: data.status,
      observacoes: data.observacoes,
      paciente_nome: clienteData?.nome || 'Nome não encontrado',
      paciente_telefone: clienteData?.telefone || 'Telefone não encontrado',
      paciente_email: clienteData?.email || null,
      consulta_original_data: null,
      consulta_original_procedimento: null,
    };
    } catch (error) {
      console.error('Erro no método create:', error);
      throw new Error(`Erro ao criar retorno: ${error.message}`);
    }
  }

  async update(id: string, updateReturnDto: any, empresaId: string): Promise<ReturnWithPatient> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('retornos')
      .update({
        ...updateReturnDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .select(`
        *,
        clientelA (
          nome,
          telefone,
          Email
        )
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar retorno:', error);
      throw new Error(`Erro ao atualizar retorno: ${error.message}`);
    }

    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      empresa_id: data.empresa_id,
      cliente_id: data.cliente_id.toString(),
      consulta_original_id: data.consulta_original_id,
      data_retorno: data.data_retorno,
      hora_retorno: data.hora_retorno,
      motivo: data.motivo,
      procedimento: data.procedimento,
      status: data.status,
      observacoes: data.observacoes,
      paciente_nome: data.clientelA?.nome || 'Nome não encontrado',
      paciente_telefone: data.clientelA?.telefone || 'Telefone não encontrado',
      paciente_email: data.clientelA?.Email,
      consulta_original_data: null, // Temporariamente null
      consulta_original_procedimento: null, // Temporariamente null
    };
  }

  async remove(id: string, empresaId: string): Promise<void> {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { error } = await this.supabaseService
      .getAdminClient()
      .from('retornos')
      .delete()
      .eq('id', id)
      .eq('empresa_id', empresaId);

    if (error) {
      console.error('Erro ao remover retorno:', error);
      throw new Error(`Erro ao remover retorno: ${error.message}`);
    }
  }

  async confirmReturn(id: string, empresaId: string): Promise<ReturnWithPatient> {
    return this.update(id, { status: 'confirmado' }, empresaId);
  }

  async markAsCompleted(id: string, empresaId: string): Promise<ReturnWithPatient> {
    return this.update(id, { status: 'realizado' }, empresaId);
  }

  async cancelReturn(id: string, empresaId: string): Promise<ReturnWithPatient> {
    return this.update(id, { status: 'cancelado' }, empresaId);
  }

  async setupTable(): Promise<{ message: string }> {
    try {
      // Tentar inserir dados de teste para verificar se a tabela existe
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('retornos')
        .select('count')
        .limit(1);

      if (error) {
        return { 
          message: `Tabela retornos não existe. Execute o SQL no Supabase SQL Editor:\n\n${this.getCreateTableSQL()}` 
        };
      }

      return { message: 'Tabela retornos já existe e está funcionando!' };
    } catch (error) {
      console.error('Erro ao verificar tabela:', error);
      return { 
        message: `Tabela retornos não existe. Execute o SQL no Supabase SQL Editor:\n\n${this.getCreateTableSQL()}` 
      };
    }
  }

  private getCreateTableSQL(): string {
    return `
-- =========================================
-- CRIAR TABELA DE RETORNOS - EXECUTE NO SUPABASE
-- =========================================

-- 1. Criar a tabela retornos se não existir
CREATE TABLE IF NOT EXISTS retornos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    empresa_id TEXT,
    cliente_id INTEGER NOT NULL,
    consulta_original_id UUID REFERENCES consultas(id),
    data_retorno DATE NOT NULL,
    hora_retorno TIME NOT NULL,
    motivo TEXT NOT NULL,
    procedimento TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    observacoes TEXT
);

-- 2. Desabilitar RLS temporariamente para teste
ALTER TABLE retornos DISABLE ROW LEVEL SECURITY;

-- 3. Inserir alguns retornos de teste baseados nas consultas existentes
INSERT INTO retornos (
    cliente_id, 
    consulta_original_id,
    data_retorno, 
    hora_retorno, 
    motivo, 
    procedimento, 
    status, 
    observacoes
) VALUES 
    (12, (SELECT id FROM consultas WHERE cliente_id = 12 LIMIT 1), 
     CURRENT_DATE + INTERVAL '30 days', '14:00', 
     'Avaliação pós-limpeza', 'Avaliação pós-limpeza', 'pendente', 
     'Retorno para avaliação após limpeza'),
    (7, (SELECT id FROM consultas WHERE cliente_id = 7 LIMIT 1), 
     CURRENT_DATE + INTERVAL '15 days', '15:30', 
     'Controle do canal', 'Controle do canal', 'confirmado', 
     'Retorno confirmado para controle')
ON CONFLICT DO NOTHING;

-- 4. Verificar se a tabela foi criada
SELECT 'Tabela retornos criada com sucesso!' as status;
    `;
  }
}
