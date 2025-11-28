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
  async findAll(empresaId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('usuarios')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('nome');

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
    auth_user_id: string;
    permissoes?: any;
    ativo?: boolean;
    telefone?: string;
    avatar_url?: string;
  }) {
    try {
      // Mapear cargo para valores aceitos pelo banco (normalizar para minúsculas)
      const cargoMap: { [key: string]: string } = {
        'admin': 'admin',
        'administrador': 'admin',
        'dentista': 'dentista',
        'recepcionista': 'recepcionista',
        'financeiro': 'financeiro',
        'auxiliar': 'auxiliar',
        'funcionario': 'funcionario'
      };

      const cargoNormalizado = cargoMap[userData.cargo.toLowerCase()] || userData.cargo.toLowerCase();

      // Preparar dados para inserção (remover campos que não existem na tabela)
      const insertData: any = {
        email: userData.email,
        nome: userData.nome,
        cargo: cargoNormalizado, // Usar cargo normalizado
        empresa_id: userData.empresa_id,
        auth_user_id: userData.auth_user_id,
        ativo: userData.ativo !== undefined ? userData.ativo : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Adicionar campos opcionais apenas se existirem
      if (userData.telefone) insertData.telefone = userData.telefone;
      if (userData.avatar_url) insertData.avatar_url = userData.avatar_url;
      if (userData.permissoes) insertData.permissoes = userData.permissoes;

      console.log('Inserindo usuário com dados:', JSON.stringify(insertData, null, 2));

      const { data, error } = await this.supabaseService
        .getClient()
        .from('usuarios')
        .insert(insertData)
        .select('id, email, nome, cargo, empresa_id, auth_user_id, ativo, telefone, avatar_url, permissoes, created_at, updated_at')
        .single();

      if (error) {
        console.error('Erro do Supabase ao inserir usuário:', error);
        throw new Error(`Erro ao criar usuário: ${error.message || JSON.stringify(error)}`);
      }

      console.log('Usuário criado com sucesso:', {
        id: data?.id,
        email: data?.email,
        auth_user_id: data?.auth_user_id,
        empresa_id: data?.empresa_id
      });

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
