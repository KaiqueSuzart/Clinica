import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getPerfilUsuario(authUserId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('usuarios')
        .select(`
          *,
          empresa:empresa_id(*)
        `)
        .eq('auth_user_id', authUserId)
        .single();

      if (error) {
        console.error('[UsuariosService.getPerfilUsuario] Erro ao buscar perfil:', error);
        throw new Error('Erro ao buscar perfil do usuário');
      }

      return data;
    } catch (error) {
      console.error('[UsuariosService.getPerfilUsuario] Erro genérico:', error);
      throw new Error('Erro ao buscar perfil do usuário');
    }
  }

  async updatePerfilUsuario(authUserId: string, updateData: UpdateUsuarioDto) {
    try {
      // Adicionar timestamp de atualização
      const dataToUpdate = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabaseService
        .getClient()
        .from('usuarios')
        .update(dataToUpdate)
        .eq('auth_user_id', authUserId)
        .select(`
          *,
          empresa:empresa_id(*)
        `)
        .single();

      if (error) {
        console.error('[UsuariosService.updatePerfilUsuario] Erro ao atualizar:', error);
        throw new Error('Erro ao atualizar perfil do usuário');
      }

      return {
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: data,
      };
    } catch (error) {
      console.error('[UsuariosService.updatePerfilUsuario] Erro genérico:', error);
      throw new Error('Erro ao atualizar perfil do usuário');
    }
  }

  // Listar todos os usuários (apenas admin)
  async findAll(empresaId?: string) {
    try {
      let query = this.supabaseService
        .getClient()
        .from('usuarios')
        .select('*')
        .order('nome');

      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        total: data?.length || 0
      };
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  }

  // Criar novo usuário (apenas admin)
  async create(userData: {
    email: string;
    nome: string;
    cargo: string;
    empresa_id: string;
    permissoes?: any;
    ativo?: boolean;
  }) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('usuarios')
        .insert({
          ...userData,
          ativo: userData.ativo !== undefined ? userData.ativo : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Usuário criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  // Atualizar usuário (apenas admin)
  async update(id: string, updateData: any) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('usuarios')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Usuário atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // Desativar usuário (apenas admin)
  async deactivate(id: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('usuarios')
        .update({
          ativo: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Usuário desativado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
    }
  }
}
