import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PatientsService {
  constructor(private supabaseService: SupabaseService) {}
  
  // Função auxiliar para normalizar empresa_id (pode ser string ou number)
  private normalizeEmpresaId(empresaId: string | number): { num: number | null; str: string } {
    const str = empresaId?.toString() || '';
    const num = Number(empresaId);
    return {
      num: !isNaN(num) ? num : null,
      str
    };
  }

  async findAll(empresaId: string) {
    if (!empresaId) {
      console.error('[PatientsService.findAll] Empresa ID não fornecido');
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      // Converter empresaId para número se necessário (o campo empresa no BD pode ser numérico)
      const empresaIdNum = Number(empresaId);
      const empresaIdStr = empresaId?.toString();
      
      console.log('[PatientsService.findAll] Buscando pacientes para empresa:', {
        empresaId,
        empresaIdNum,
        empresaIdStr,
        tipo: typeof empresaId
      });
      
      // Tentar primeiro como número, depois como string
      let query = this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('*');
      
      // Tentar como número primeiro (mais comum)
      if (!isNaN(empresaIdNum)) {
        query = query.eq('empresa', empresaIdNum);
      } else {
        query = query.eq('empresa', empresaIdStr);
      }
      
      const { data, error } = await query.order('nome');

      if (error) {
        console.error('[PatientsService.findAll] Erro do Supabase:', error);
        // Se falhou como número, tentar como string
        if (!isNaN(empresaIdNum)) {
          console.log('[PatientsService.findAll] Tentando novamente como string...');
          const { data: dataStr, error: errorStr } = await this.supabaseService
            .getAdminClient()
            .from('clientelA')
            .select('*')
            .eq('empresa', empresaIdStr)
            .order('nome');
          
          if (errorStr) {
            console.error('[PatientsService.findAll] Erro também como string:', errorStr);
            throw errorStr;
          }
          
          console.log('[PatientsService.findAll] Pacientes encontrados (string):', dataStr?.length || 0);
          return dataStr || [];
        }
        throw error;
      }
      
      console.log('[PatientsService.findAll] Pacientes encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('[PatientsService.findAll] Erro completo:', error);
      throw error;
    }
  }

  async findOne(id: string, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { num, str } = this.normalizeEmpresaId(empresaId);
    let query = this.supabaseService
      .getClient()
      .from('clientelA')
      .select('*')
      .eq('id', id);
    
    if (num !== null) {
      query = query.eq('empresa', num);
    } else {
      query = query.eq('empresa', str);
    }
    
    const { data, error } = await query.single();

    if (error || !data) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return data;
  }

  async create(patientData: any, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    console.log('[PatientsService.create] Dados recebidos para criação:', patientData);
    console.log('[PatientsService.create] Empresa ID:', empresaId, typeof empresaId);
    
    try {
      // Converter empresaId para número se necessário (a tabela pode esperar número)
      const empresaIdNum = typeof empresaId === 'string' ? parseInt(empresaId, 10) : Number(empresaId);
      
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .insert({
          ...patientData,
          empresa: empresaIdNum
        })
        .select()
        .single();

      if (error) {
        console.error('[PatientsService.create] Erro ao criar paciente:', error);
        throw error;
      }
      
      console.log('[PatientsService.create] Paciente criado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('[PatientsService.create] Erro completo:', error);
      throw error;
    }
  }

  async update(id: string, patientData: any, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .update(patientData)
      .eq('id', id)
      .eq('empresa', empresaId)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      throw new NotFoundException('Paciente não encontrado');
    }
    return data;
  }

  async remove(id: string, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .delete()
      .eq('id', id)
      .eq('empresa', empresaId);

    if (error) throw error;
    return { message: 'Paciente removido com sucesso' };
  }

  async searchPatients(searchDto: any, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    let query = this.supabaseService
      .getClient()
      .from('clientelA')
      .select('*')
      .eq('empresa', empresaId);

    // Filtros de busca
    if (searchDto.nome) {
      query = query.ilike('nome', `%${searchDto.nome}%`);
    }
    if (searchDto.Cpf) {
      query = query.eq('Cpf', searchDto.Cpf);
    }
    if (searchDto.Email) {
      query = query.ilike('Email', `%${searchDto.Email}%`);
    }
    if (searchDto.status) {
      query = query.eq('status', searchDto.status);
    }
    if (searchDto.iaativa !== undefined) {
      query = query.eq('iaativa', searchDto.iaativa);
    }

    const { data, error } = await query.order('nome');
    if (error) throw error;
    return data;
  }

  async getPatientsByStatus(status: string, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .select('*')
      .eq('status', status)
      .eq('empresa', empresaId)
      .order('nome');

    if (error) throw error;
    return data;
  }

  async getActivePatients(empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .select('*')
      .eq('iaativa', true)
      .eq('empresa', empresaId)
      .order('nome');

    if (error) throw error;
    return data;
  }

  async getPatientsWithUpcomingReturns(empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .select('*')
      .eq('empresa', empresaId)
      .gte('proximo_retorno', today)
      .order('proximo_retorno');

    if (error) throw error;
    return data;
  }
}
