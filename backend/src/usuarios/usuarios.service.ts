import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class UsuariosService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getPerfilUsuario(authUserId: string) {
    try {
      console.log('[UsuariosService.getPerfilUsuario] 📥 Buscando perfil para:', authUserId);

      // Usar getAdminClient() para garantir que a busca funcione mesmo com RLS
      // Tentar buscar primeiro pelo id (caso seja token fake) e depois pelo auth_user_id
      let { data, error } = await this.supabaseService
        .getAdminClient()
        .from('usuarios')
        .select(`
          *,
          empresa:empresa_id(*)
        `)
        .eq('id', authUserId)
        .single();

      // Se não encontrou pelo id, tentar pelo auth_user_id
      if (error && error.code === 'PGRST116') {
        console.log('[UsuariosService.getPerfilUsuario] 🔄 Não encontrado pelo id, tentando pelo auth_user_id');
        const result = await this.supabaseService
          .getAdminClient()
          .from('usuarios')
          .select(`
            *,
            empresa:empresa_id(*)
          `)
          .eq('auth_user_id', authUserId)
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('[UsuariosService.getPerfilUsuario] ❌ Erro ao buscar perfil:', error);
        
        // Se não encontrou o usuário, retornar 404
        if (error.code === 'PGRST116') {
          throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
        }
        
        throw new HttpException(
          `Erro ao buscar perfil do usuário: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      if (!data) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }

      console.log('[UsuariosService.getPerfilUsuario] ✅ Perfil encontrado:', { id: data.id, nome: data.nome, telefone: data.telefone });

      return data;
    } catch (error) {
      console.error('[UsuariosService.getPerfilUsuario] ❌ Erro genérico:', error);
      
      // Se já é uma HttpException, re-lançar
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error.message || 'Erro ao buscar perfil do usuário',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updatePerfilUsuario(authUserId: string, updateData: UpdateUsuarioDto) {
    try {
      console.log('[UsuariosService.updatePerfilUsuario] 📥 Dados recebidos:', { authUserId, updateData });

      // Preparar dados para atualização, garantindo que campos vazios sejam null
      const dataToUpdate: any = {
        updated_at: new Date().toISOString(),
      };

      // Processar nome
      if (updateData.nome !== undefined && updateData.nome !== null) {
        dataToUpdate.nome = String(updateData.nome).trim();
      }

      // Processar telefone - garantir que seja salvo mesmo se vazio (permitir null)
      if (updateData.telefone !== undefined) {
        if (updateData.telefone && updateData.telefone.trim() !== '') {
          dataToUpdate.telefone = String(updateData.telefone).trim();
        } else {
          dataToUpdate.telefone = null; // Permitir null para limpar o telefone
        }
        console.log('[UsuariosService.updatePerfilUsuario] 📞 Telefone processado:', {
          original: updateData.telefone,
          final: dataToUpdate.telefone
        });
      }

      // Processar cargo
      if (updateData.cargo !== undefined && updateData.cargo !== null) {
        dataToUpdate.cargo = String(updateData.cargo).trim().toLowerCase();
      }

      // Processar avatar_url
      if (updateData.avatar_url !== undefined) {
        dataToUpdate.avatar_url = updateData.avatar_url ? String(updateData.avatar_url).trim() : null;
      }

      console.log('[UsuariosService.updatePerfilUsuario] 📤 Dados para atualizar:', dataToUpdate);

      // Usar getAdminClient() para garantir que a atualização funcione mesmo com RLS
      // Tentar buscar primeiro pelo id (caso seja token fake) e depois pelo auth_user_id
      let query = this.supabaseService
        .getAdminClient()
        .from('usuarios')
        .update(dataToUpdate);

      // Verificar se authUserId é um UUID válido (id da tabela usuarios) ou auth_user_id
      // Primeiro tentar pelo id
      let { data, error } = await query
        .eq('id', authUserId)
        .select(`
          *,
          empresa:empresa_id(*)
        `)
        .single();

      // Se não encontrou pelo id, tentar pelo auth_user_id
      if (error && error.code === 'PGRST116') {
        console.log('[UsuariosService.updatePerfilUsuario] 🔄 Não encontrado pelo id, tentando pelo auth_user_id');
        const result = await this.supabaseService
          .getAdminClient()
          .from('usuarios')
          .update(dataToUpdate)
          .eq('auth_user_id', authUserId)
          .select(`
            *,
            empresa:empresa_id(*)
          `)
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('[UsuariosService.updatePerfilUsuario] ❌ Erro ao atualizar:', error);
        
        // Se não encontrou o usuário, retornar 404
        if (error.code === 'PGRST116') {
          throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
        }
        
        throw new HttpException(
          `Erro ao atualizar perfil do usuário: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      if (!data) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }

      console.log('[UsuariosService.updatePerfilUsuario] ✅ Perfil atualizado com sucesso:', data);

      return {
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: data,
      };
    } catch (error) {
      console.error('[UsuariosService.updatePerfilUsuario] ❌ Erro genérico:', error);
      
      // Se já é uma HttpException, re-lançar
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error.message || 'Erro ao atualizar perfil do usuário',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async uploadAvatar(authUserId: string, file: Express.Multer.File) {
    try {
      console.log('[UsuariosService.uploadAvatar] 📤 Upload de avatar iniciado:', { authUserId, filename: file.originalname });

      const supabase = this.supabaseService.getAdminClient();

      // Gerar nome único para o arquivo
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${randomUUID()}${fileExtension}`;
      const filePath = `avatars/${authUserId}/${uniqueFilename}`;

      // Upload para o Supabase Storage (usar bucket 'patient-files' ou criar um 'avatars')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-files') // Usar bucket existente ou criar 'avatars'
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error('[UsuariosService.uploadAvatar] ❌ Erro no upload:', uploadError);
        throw new BadRequestException(`Erro no upload: ${uploadError.message}`);
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('patient-files')
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      // Atualizar avatar_url no banco de dados
      // Tentar buscar primeiro pelo id (caso seja token fake) e depois pelo auth_user_id
      let query = supabase
        .from('usuarios')
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() });

      let { data, error } = await query
        .eq('id', authUserId)
        .select(`
          *,
          empresa:empresa_id(*)
        `)
        .single();

      // Se não encontrou pelo id, tentar pelo auth_user_id
      if (error && error.code === 'PGRST116') {
        console.log('[UsuariosService.uploadAvatar] 🔄 Não encontrado pelo id, tentando pelo auth_user_id');
        const result = await supabase
          .from('usuarios')
          .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
          .eq('auth_user_id', authUserId)
          .select(`
            *,
            empresa:empresa_id(*)
          `)
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('[UsuariosService.uploadAvatar] ❌ Erro ao atualizar avatar_url:', error);
        // Limpar arquivo do storage se houve erro no banco
        await supabase.storage.from('patient-files').remove([filePath]);
        throw new HttpException(
          `Erro ao atualizar avatar: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      if (!data) {
        // Limpar arquivo do storage se não encontrou usuário
        await supabase.storage.from('patient-files').remove([filePath]);
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }

      console.log('[UsuariosService.uploadAvatar] ✅ Avatar atualizado com sucesso:', avatarUrl);

      return {
        success: true,
        message: 'Avatar atualizado com sucesso',
        data: {
          ...data,
          avatar_url: avatarUrl
        }
      };
    } catch (error) {
      console.error('[UsuariosService.uploadAvatar] ❌ Erro genérico:', error);
      
      if (error instanceof HttpException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new HttpException(
        error.message || 'Erro ao fazer upload do avatar',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
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
      // Validar ID
      if (!id) {
        throw new HttpException('ID do usuário é obrigatório', HttpStatus.BAD_REQUEST);
      }

      // Preparar dados para atualização, removendo campos undefined/null
      const dataToUpdate: any = {
        updated_at: new Date().toISOString()
      };

      console.log('[UsuariosService.update] 📥 Dados recebidos do controller:', JSON.stringify(updateData, null, 2));

      // Adicionar apenas campos que foram fornecidos e não são vazios
      if (updateData.nome !== undefined && updateData.nome !== null && updateData.nome !== '') {
        dataToUpdate.nome = String(updateData.nome).trim();
      }
      if (updateData.telefone !== undefined && updateData.telefone !== null) {
        dataToUpdate.telefone = updateData.telefone ? String(updateData.telefone).trim() : null;
      }
      
      // SEMPRE normalizar cargo se fornecido (CRÍTICO para constraint do banco)
      // Verificar se cargo existe de qualquer forma (undefined, null, string vazia, etc)
      if ('cargo' in updateData && updateData.cargo !== undefined && updateData.cargo !== null && String(updateData.cargo).trim() !== '') {
        console.log('[UsuariosService.update] ⚠️ Cargo recebido (ANTES da normalização):', updateData.cargo, 'Tipo:', typeof updateData.cargo);
        
        // Normalizar cargo para minúsculas (mesma lógica do create)
        const cargoMap: { [key: string]: string } = {
          'admin': 'admin',
          'administrador': 'admin',
          'dentista': 'dentista',
          'recepcionista': 'recepcionista',
          'financeiro': 'financeiro',
          'auxiliar': 'auxiliar',
          'funcionario': 'funcionario'
        };
        
        const cargoInput = String(updateData.cargo).trim().toLowerCase();
        const cargoNormalizado = cargoMap[cargoInput] || cargoInput;
        dataToUpdate.cargo = cargoNormalizado;
        
        console.log('[UsuariosService.update] ✅ Cargo normalizado:', {
          original: updateData.cargo,
          lowercase: cargoInput,
          normalizado: cargoNormalizado,
          'será salvo como': dataToUpdate.cargo
        });
      } else {
        console.log('[UsuariosService.update] ⚠️ Cargo NÃO fornecido ou vazio:', {
          temCargo: 'cargo' in updateData,
          cargo: updateData.cargo,
          tipo: typeof updateData.cargo
        });
      }
      if (updateData.ativo !== undefined && updateData.ativo !== null) {
        // Garantir que seja boolean (pode vir como string "true"/"false" do JSON)
        if (typeof updateData.ativo === 'string') {
          dataToUpdate.ativo = updateData.ativo.toLowerCase() === 'true';
        } else {
          dataToUpdate.ativo = Boolean(updateData.ativo);
        }
      }
      if (updateData.avatar_url !== undefined && updateData.avatar_url !== null) {
        dataToUpdate.avatar_url = updateData.avatar_url ? String(updateData.avatar_url).trim() : null;
      }
      
      console.log('[UsuariosService.update] Dados recebidos:', updateData);
      console.log('[UsuariosService.update] Dados para atualizar:', dataToUpdate);

      console.log('[UsuariosService.update] Atualizando usuário:', { id, dataToUpdate });

      // Verificar se há algo para atualizar além do updated_at
      if (Object.keys(dataToUpdate).length === 1) {
        throw new HttpException('Nenhum campo válido para atualizar', HttpStatus.BAD_REQUEST);
      }

      // ID é UUID (string), não precisa converter
      console.log('[UsuariosService.update] ID recebido:', id, 'Tipo:', typeof id);

      const { data, error } = await this.supabaseService
        .getAdminClient() // Usar admin client para evitar problemas de RLS
        .from('usuarios')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[UsuariosService.update] Erro do Supabase:', error);
        
        // Se não encontrou o usuário
        if (error.code === 'PGRST116') {
          throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
        }
        
        throw new HttpException(
          `Erro ao atualizar usuário: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      if (!data) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data,
        message: 'Usuário atualizado com sucesso'
      };
    } catch (error) {
      console.error('[UsuariosService.update] Erro genérico:', error);
      
      // Se já é uma HttpException, re-lançar
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error.message || 'Erro ao atualizar usuário',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
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

  // Listar apenas dentistas (para seleção em agendamentos)
  async findAllDentistas(empresaId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('usuarios')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('cargo', 'dentista') // Apenas dentistas, não admins
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        total: data?.length || 0
      };
    } catch (error) {
      console.error('Erro ao listar dentistas:', error);
      throw error;
    }
  }
}
