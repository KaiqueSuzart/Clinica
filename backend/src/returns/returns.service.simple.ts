import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface ReturnWithPatient {
  id: string;
  created_at: string;
  updated_at: string;
  empresa_id: string;
  cliente_id: string;
  consulta_original_id?: string;
  data_retorno: string;
  hora_retorno: string;
  motivo: string;
  procedimento: string;
  status: string;
  observacoes?: string;
  data_consulta_original?: string; // Data da consulta original
  // Dados do paciente (populados via join ou busca separada)
  paciente_nome: string;
  paciente_telefone: string;
  paciente_email: string | null;
  // Dados da consulta original (se existir)
  consulta_original_data?: string;
  consulta_original_procedimento?: string;
}

@Injectable()
export class ReturnsServiceSimple {
  private returns: ReturnWithPatient[] = [];
  private nextId = 1;

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<ReturnWithPatient[]> {
    try {
      // Buscar do banco de dados
      const { data: dbData, error: dbError } = await this.supabaseService
        .getClient()
        .from('retornos')
        .select('*')
        .order('data_retorno', { ascending: true });

      if (dbError) {
        console.error('Erro ao buscar retornos do banco:', dbError);
        // Fallback para dados em memória
        return this.returns;
      }

      // Buscar dados dos clientes para cada retorno
      const returnsWithPatients = await Promise.all(
        dbData.map(async (returnItem) => {
          let clienteData = null;
          try {
            console.log(`Buscando cliente ID: ${returnItem.cliente_id}`);
            const { data: clienteDataResult, error: clienteError } = await this.supabaseService
              .getClient()
              .from('clientelA')
              .select('nome, telefone, Email')
              .eq('id', returnItem.cliente_id)
              .single();
            
            console.log('Resultado da busca do cliente:', { clienteDataResult, clienteError });
            
            if (clienteDataResult) {
              clienteData = clienteDataResult;
              console.log('Dados do cliente encontrados:', clienteData);
            } else {
              console.log('Cliente não encontrado ou erro:', clienteError);
            }
          } catch (error) {
            console.log('Erro ao buscar cliente:', error);
          }

          return {
            id: returnItem.id,
            created_at: returnItem.created_at,
            updated_at: returnItem.updated_at,
            empresa_id: returnItem.empresa_id?.toString() || '1',
            cliente_id: returnItem.cliente_id.toString(),
            consulta_original_id: returnItem.consulta_original_id,
            data_retorno: returnItem.data_retorno,
            hora_retorno: returnItem.hora_retorno,
            motivo: returnItem.motivo,
            procedimento: returnItem.procedimento,
            status: returnItem.status,
            observacoes: returnItem.observacoes,
            data_consulta_original: returnItem.data_consulta_original,
            paciente_nome: clienteData?.nome || `Paciente ${returnItem.cliente_id}`,
            paciente_telefone: clienteData?.telefone || 'Telefone não encontrado',
            paciente_email: clienteData?.Email || null,
            consulta_original_data: null,
            consulta_original_procedimento: null,
          };
        })
      );

      console.log('Retornos carregados do banco:', returnsWithPatients.length);
      return returnsWithPatients;
      
    } catch (error) {
      console.error('Erro ao buscar retornos:', error);
      // Fallback para dados em memória
      return this.returns;
    }
  }

  async findConfirmedReturns(): Promise<ReturnWithPatient[]> {
    const allReturns = await this.findAll();
    const now = new Date();
    
    // Retornos confirmados: status 'confirmado' OU (status 'pendente' com horário específico marcado)
    // MAS que NÃO estejam atrasados
    const confirmed = allReturns.filter(r => {
      // Construir data/hora do retorno corretamente
      const returnDate = r.data_retorno; // Formato: YYYY-MM-DD
      const returnTime = r.hora_retorno || '00:00:00'; // Formato: HH:MM:SS
      const returnDateTime = new Date(`${returnDate}T${returnTime}`);
      const isOverdue = returnDateTime < now;
      
      // Se status é confirmado, verificar se não está atrasado
      if (r.status === 'confirmado') {
        return !isOverdue;
      }
      
      // Se status é pendente, incluir todos os retornos pendentes (incluindo horário padrão 09:00)
      if (r.status === 'pendente') {
        return !isOverdue;
      }
      
      return false;
    });
    
    // Ordenar por data e horário mais próximo (mais antigo primeiro)
    const sorted = confirmed.sort((a, b) => {
      const dateA = new Date(`${a.data_retorno}T${a.hora_retorno || '00:00:00'}`);
      const dateB = new Date(`${b.data_retorno}T${b.hora_retorno || '00:00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    return sorted;
  }

  async findPossibleReturns(): Promise<ReturnWithPatient[]> {
    const allReturns = await this.findAll();
    
    // Possíveis retornos: status 'pendente' SEM horário específico marcado
    const possible = allReturns.filter(r => {
      // Só incluir se status é pendente
      if (r.status !== 'pendente') return false;
      
      // Se não tem horário ou é horário padrão, incluir
      return !r.hora_retorno || r.hora_retorno === '09:00' || r.hora_retorno === '09:00:00';
    });
    
    // Ordenar por data mais próxima (mais antigo primeiro)
    return possible.sort((a, b) => {
      const dateA = new Date(`${a.data_retorno}T${a.hora_retorno || '00:00:00'}`);
      const dateB = new Date(`${b.data_retorno}T${b.hora_retorno || '00:00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });
  }

  async findCompletedReturns(): Promise<ReturnWithPatient[]> {
    const allReturns = await this.findAll();
    
    // Retornos realizados: status 'realizado'
    const completed = allReturns.filter(r => r.status === 'realizado');
    
    // Ordenar por data mais recente primeiro (mais recente primeiro)
    return completed.sort((a, b) => {
      const dateA = new Date(`${a.data_retorno}T${a.hora_retorno || '00:00:00'}`);
      const dateB = new Date(`${b.data_retorno}T${b.hora_retorno || '00:00:00'}`);
      return dateB.getTime() - dateA.getTime();
    });
  }

  async findOverdueReturns(): Promise<ReturnWithPatient[]> {
    const allReturns = await this.findAll();
    const now = new Date();
    
    // Retornos atrasados: status 'pendente' ou 'confirmado' com data/hora passada
    const overdue = allReturns.filter(r => {
      // Só incluir se status é pendente ou confirmado (não realizado)
      if (r.status === 'realizado' || r.status === 'cancelado') return false;
      
      // Verificar se a data/hora já passou
      const returnDateTime = new Date(`${r.data_retorno}T${r.hora_retorno || '00:00:00'}`);
      return returnDateTime < now;
    });
    
    // Ordenar por data mais atrasada primeiro (mais atrasado primeiro)
    return overdue.sort((a, b) => {
      const dateA = new Date(`${a.data_retorno}T${a.hora_retorno || '00:00:00'}`);
      const dateB = new Date(`${b.data_retorno}T${b.hora_retorno || '00:00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });
  }

  async findOne(id: string): Promise<ReturnWithPatient> {
    const returnItem = this.returns.find(r => r.id === id);
    if (!returnItem) {
      throw new Error('Retorno não encontrado');
    }
    return returnItem;
  }

  async create(createReturnDto: any): Promise<ReturnWithPatient> {
    try {
      console.log('Dados recebidos para criar retorno:', createReturnDto);
      console.log('Tipo do cliente_id:', typeof createReturnDto.cliente_id);
      
      const clienteId = parseInt(createReturnDto.cliente_id);
      if (isNaN(clienteId)) {
        console.error('Erro na conversão do cliente_id:', createReturnDto.cliente_id);
        throw new Error(`cliente_id inválido: ${createReturnDto.cliente_id}`);
      }
      
      console.log('cliente_id convertido:', clienteId);
    
    // Buscar dados do cliente no Supabase
    let clienteData = null;
    try {
      const { data: clienteDataResult, error: clienteError } = await this.supabaseService
        .getClient()
        .from('clientelA')
        .select('nome, telefone, Email')
        .eq('id', clienteId)
        .single();
      
      if (!clienteError && clienteDataResult) {
        clienteData = clienteDataResult;
        console.log('Dados do cliente encontrados:', clienteData);
      } else {
        console.log('Cliente não encontrado, usando dados padrão');
      }
    } catch (error) {
      console.log('Erro ao buscar cliente, usando dados padrão:', error);
    }
    
    // SALVAR NO BANCO DE DADOS REAL
    try {
      const { data: dbData, error: dbError } = await this.supabaseService
        .getClient()
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
          empresa_id: 1,
        })
        .select('*')
        .single();

      if (dbError) {
        console.error('Erro ao salvar no banco:', dbError);
        throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
      }

      console.log('Retorno salvo no banco de dados:', dbData);

      const newReturn: ReturnWithPatient = {
        id: dbData.id,
        created_at: dbData.created_at,
        updated_at: dbData.updated_at,
        empresa_id: dbData.empresa_id?.toString() || '1',
        cliente_id: createReturnDto.cliente_id,
        consulta_original_id: createReturnDto.consulta_original_id,
        data_retorno: createReturnDto.data_retorno,
        hora_retorno: createReturnDto.hora_retorno,
        motivo: createReturnDto.motivo,
        procedimento: createReturnDto.procedimento,
        status: createReturnDto.status || 'pendente',
        observacoes: createReturnDto.observacoes,
        data_consulta_original: createReturnDto.data_consulta_original,
        paciente_nome: clienteData?.nome || `Paciente ${clienteId}`,
        paciente_telefone: clienteData?.telefone || 'Telefone não encontrado',
        paciente_email: clienteData?.Email || null,
        consulta_original_data: null,
        consulta_original_procedimento: null,
      };
      
      // Também salvar em memória para consultas rápidas
      this.returns.push(newReturn);
      console.log('Retorno criado e salvo:', newReturn);
      console.log('Total de retornos:', this.returns.length);
      
      return newReturn;
      
    } catch (error) {
      console.error('Erro ao salvar no banco de dados:', error);
      throw new Error(`Erro ao salvar retorno: ${error.message}`);
    }
    } catch (error) {
      console.error('Erro geral na criação do retorno:', error);
      throw new Error(`Erro ao criar retorno: ${error.message}`);
    }
  }

  async update(id: string, updateReturnDto: any): Promise<ReturnWithPatient> {
    console.log('Atualizando retorno com ID:', id, 'Dados:', updateReturnDto);
    console.log('Horário sendo atualizado:', updateReturnDto.hora_retorno);
    
    // Atualizar no banco de dados
    try {
      const { data: dbData, error: dbError } = await this.supabaseService
        .getClient()
        .from('retornos')
        .update({
          ...updateReturnDto,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (dbError) {
        console.error('Erro ao atualizar retorno no banco:', dbError);
        throw new Error(`Erro ao atualizar retorno: ${dbError.message}`);
      }

      console.log('Retorno atualizado no banco:', dbData);
      console.log('Horário salvo no banco:', dbData.hora_retorno);
      console.log('Status salvo no banco:', dbData.status);

      // Buscar dados do paciente para retornar
      const { data: clientData, error: clientError } = await this.supabaseService
        .getClient()
        .from('clientelA')
        .select('nome, telefone, Email')
        .eq('id', dbData.cliente_id)
        .single();

      if (clientError) {
        console.error('Erro ao buscar dados do cliente:', clientError);
        // Continuar mesmo sem dados do cliente
      }

      const returnWithPatient: ReturnWithPatient = {
        ...dbData,
        paciente_nome: clientData?.nome || 'Cliente não encontrado',
        paciente_telefone: clientData?.telefone || 'Telefone não encontrado',
        paciente_email: clientData?.Email || null
      };

      // Atualizar também em memória
      const index = this.returns.findIndex(r => r.id === id);
      if (index !== -1) {
        this.returns[index] = returnWithPatient;
      }
      
      return returnWithPatient;
      
    } catch (error) {
      console.error('Erro ao atualizar retorno:', error);
      // Fallback para atualização em memória
      const index = this.returns.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('Retorno não encontrado');
      }
      
      this.returns[index] = {
        ...this.returns[index],
        ...updateReturnDto,
        updated_at: new Date().toISOString(),
      };
      
      return this.returns[index];
    }
  }

  async remove(id: string): Promise<void> {
    const index = this.returns.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Retorno não encontrado');
    }
    
    this.returns.splice(index, 1);
  }

  async confirmReturn(id: string): Promise<ReturnWithPatient> {
    console.log('Confirmando retorno com ID:', id);
    
    // Primeiro, verificar se o retorno existe
    try {
      const { data: existingReturn, error: findError } = await this.supabaseService
        .getClient()
        .from('retornos')
        .select('*')
        .eq('id', id)
        .single();

      if (findError) {
        console.error('Erro ao buscar retorno:', findError);
        throw new Error(`Retorno não encontrado: ${findError.message}`);
      }

      console.log('Retorno encontrado:', existingReturn);

      // Atualizar no banco de dados
      const { data: dbData, error: dbError } = await this.supabaseService
        .getClient()
        .from('retornos')
        .update({ status: 'confirmado', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (dbError) {
        console.error('Erro ao confirmar retorno no banco:', dbError);
        throw new Error(`Erro ao confirmar retorno: ${dbError.message}`);
      }

      console.log('Retorno confirmado no banco:', dbData);

      // Buscar dados do paciente para retornar
      const { data: clientData, error: clientError } = await this.supabaseService
        .getClient()
        .from('clientelA')
        .select('nome, telefone, Email')
        .eq('id', dbData.cliente_id)
        .single();

      if (clientError) {
        console.error('Erro ao buscar dados do cliente:', clientError);
        // Continuar mesmo sem dados do cliente
      }

      const returnWithPatient: ReturnWithPatient = {
        ...dbData,
        paciente_nome: clientData?.nome || 'Cliente não encontrado',
        paciente_telefone: clientData?.telefone || 'Telefone não encontrado',
        paciente_email: clientData?.Email || null
      };

      // Atualizar também em memória
      const updatedReturn = await this.update(id, { status: 'confirmado' });
      return returnWithPatient;
      
    } catch (error) {
      console.error('Erro ao confirmar retorno:', error);
      // Fallback para atualização em memória
      return this.update(id, { status: 'confirmado' });
    }
  }

  async markAsCompleted(id: string): Promise<ReturnWithPatient> {
    // Atualizar no banco de dados
    try {
      const { data: dbData, error: dbError } = await this.supabaseService
        .getClient()
        .from('retornos')
        .update({ status: 'realizado', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (dbError) {
        console.error('Erro ao marcar retorno como realizado no banco:', dbError);
        throw new Error(`Erro ao marcar retorno como realizado: ${dbError.message}`);
      }

      console.log('Retorno marcado como realizado no banco:', dbData);
      return this.update(id, { status: 'realizado' });
      
    } catch (error) {
      console.error('Erro ao marcar retorno como realizado:', error);
      return this.update(id, { status: 'realizado' });
    }
  }

  async cancelReturn(id: string): Promise<ReturnWithPatient> {
    // Atualizar no banco de dados
    try {
      const { data: dbData, error: dbError } = await this.supabaseService
        .getClient()
        .from('retornos')
        .update({ status: 'cancelado', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (dbError) {
        console.error('Erro ao cancelar retorno no banco:', dbError);
        throw new Error(`Erro ao cancelar retorno: ${dbError.message}`);
      }

      console.log('Retorno cancelado no banco:', dbData);
      return this.update(id, { status: 'cancelado' });
      
    } catch (error) {
      console.error('Erro ao cancelar retorno:', error);
      return this.update(id, { status: 'cancelado' });
    }
  }

  async setupTable(): Promise<{ message: string }> {
    return { message: 'Sistema de retornos funcionando com dados em memória!' };
  }
}