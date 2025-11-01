import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';

@Injectable()
export class ProceduresService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(categoria?: string, ativo?: boolean) {
    try {
      let query = this.supabaseService
        .getClient()
        .from('procedimentos')
        .select('*')
        .is('cliente_id', null) // Apenas procedimentos do catálogo, não vinculados a clientes
        .order('nome', { ascending: true });

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      if (ativo !== undefined) {
        query = query.eq('ativo', ativo);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        total: data?.length || 0
      };
    } catch (error) {
      console.error('Erro ao buscar procedimentos:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('procedimentos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new NotFoundException(`Procedimento com ID ${id} não encontrado`);
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro ao buscar procedimento:', error);
      throw error;
    }
  }

  async create(createProcedureDto: CreateProcedureDto, empresaId?: string) {
    try {
      const procedureData = {
        ...createProcedureDto,
        empresa_id: empresaId || null,
        ativo: createProcedureDto.ativo !== undefined ? createProcedureDto.ativo : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabaseService
        .getClient()
        .from('procedimentos')
        .insert([procedureData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: 'Procedimento criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar procedimento:', error);
      throw error;
    }
  }

  async update(id: string, updateProcedureDto: UpdateProcedureDto) {
    try {
      const updateData = {
        ...updateProcedureDto,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabaseService
        .getClient()
        .from('procedimentos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new NotFoundException(`Procedimento com ID ${id} não encontrado`);
      }

      return {
        success: true,
        data,
        message: 'Procedimento atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar procedimento:', error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Soft delete - apenas marca como inativo
      const { data, error } = await this.supabaseService
        .getClient()
        .from('procedimentos')
        .update({ ativo: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new NotFoundException(`Procedimento com ID ${id} não encontrado`);
      }

      return {
        success: true,
        message: 'Procedimento desativado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao remover procedimento:', error);
      throw error;
    }
  }

  async getCategorias() {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('procedimentos')
        .select('categoria')
        .not('categoria', 'is', null)
        .is('cliente_id', null);

      if (error) {
        throw error;
      }

      // Retornar lista única de categorias
      const uniqueCategories = [...new Set(data?.map(item => item.categoria).filter(Boolean))] || [];
      
      return {
        success: true,
        data: uniqueCategories.sort(),
        total: uniqueCategories.length
      };
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }
}

