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
}
