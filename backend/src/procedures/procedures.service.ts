import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';

@Injectable()
export class ProceduresService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(empresaId: string, categoria?: string, ativo?: boolean) {
    try {
      console.log('[ProceduresService.findAll] 📥 Parâmetros:', { empresaId, categoria, ativo });

      if (!empresaId) {
        throw new Error('empresa_id é obrigatório para listar procedimentos');
      }

      // Usar getAdminClient() para bypassar RLS
      let query = this.supabaseService
        .getAdminClient()
        .from('procedimentos')
        .select('*')
        .eq('empresa_id', empresaId)
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
        console.error('[ProceduresService.findAll] ❌ Erro do Supabase:', error);
        throw new Error(`Erro ao buscar procedimentos: ${error.message}`);
      }

      console.log('[ProceduresService.findAll] ✅ Procedimentos encontrados:', data?.length || 0);

      return {
        success: true,
        data: data || [],
        total: data?.length || 0
      };
    } catch (error) {
      console.error('[ProceduresService.findAll] ❌ Erro genérico:', error);
      throw error;
    }
  }

  async findOne(id: string, empresaId: string) {
    try {
      // Usar getAdminClient() para bypassar RLS
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('procedimentos')
        .select('*')
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .single();

      if (error) {
        console.error('[ProceduresService.findOne] ❌ Erro do Supabase:', error);
        throw new Error(`Erro ao buscar procedimento: ${error.message}`);
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
      console.log('[ProceduresService.create] 📥 Dados recebidos:', { createProcedureDto, empresaId });

      if (!empresaId) {
        throw new Error('empresa_id é obrigatório para criar procedimento');
      }

      const procedureData = {
        ...createProcedureDto,
        empresa_id: empresaId,
        cliente_id: null, // Procedimentos do catálogo não têm cliente_id
        ativo: createProcedureDto.ativo !== undefined ? createProcedureDto.ativo : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('[ProceduresService.create] 📤 Dados para inserir:', procedureData);

      // Usar getAdminClient() para bypassar RLS
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('procedimentos')
        .insert([procedureData])
        .select()
        .single();

      if (error) {
        console.error('[ProceduresService.create] ❌ Erro do Supabase:', error);
        throw new Error(`Erro ao criar procedimento: ${error.message}`);
      }

      if (!data) {
        throw new Error('Procedimento criado mas não retornado');
      }

      console.log('[ProceduresService.create] ✅ Procedimento criado com sucesso:', data);

      return {
        success: true,
        data,
        message: 'Procedimento criado com sucesso'
      };
    } catch (error) {
      console.error('[ProceduresService.create] ❌ Erro genérico:', error);
      throw error;
    }
  }

  async update(id: string, updateProcedureDto: UpdateProcedureDto, empresaId: string) {
    try {
      console.log('[ProceduresService.update] 📥 Dados recebidos:', { id, updateProcedureDto, empresaId });

      const updateData = {
        ...updateProcedureDto,
        updated_at: new Date().toISOString()
      };

      // Usar getAdminClient() para bypassar RLS
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('procedimentos')
        .update(updateData)
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single();

      if (error) {
        console.error('[ProceduresService.update] ❌ Erro do Supabase:', error);
        throw new Error(`Erro ao atualizar procedimento: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundException(`Procedimento com ID ${id} não encontrado`);
      }

      console.log('[ProceduresService.update] ✅ Procedimento atualizado com sucesso:', data);

      return {
        success: true,
        data,
        message: 'Procedimento atualizado com sucesso'
      };
    } catch (error) {
      console.error('[ProceduresService.update] ❌ Erro genérico:', error);
      throw error;
    }
  }

  async remove(id: string, empresaId: string) {
    try {
      // Soft delete - apenas marca como inativo
      // Usar getAdminClient() para bypassar RLS
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('procedimentos')
        .update({ ativo: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single();

      if (error) {
        console.error('[ProceduresService.remove] ❌ Erro do Supabase:', error);
        throw new Error(`Erro ao remover procedimento: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundException(`Procedimento com ID ${id} não encontrado`);
      }

      console.log('[ProceduresService.remove] ✅ Procedimento desativado com sucesso:', data);

      return {
        success: true,
        message: 'Procedimento desativado com sucesso'
      };
    } catch (error) {
      console.error('[ProceduresService.remove] ❌ Erro genérico:', error);
      throw error;
    }
  }

  async getCategorias(empresaId: string) {
    try {
      // Usar getAdminClient() para bypassar RLS
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('procedimentos')
        .select('categoria')
        .eq('empresa_id', empresaId)
        .not('categoria', 'is', null)
        .is('cliente_id', null);

      if (error) {
        console.error('[ProceduresService.getCategorias] ❌ Erro do Supabase:', error);
        throw new Error(`Erro ao buscar categorias: ${error.message}`);
      }

      // Retornar lista única de categorias
      const uniqueCategories = data ? [...new Set(data.map(item => item.categoria).filter(Boolean))] : [];
      
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



