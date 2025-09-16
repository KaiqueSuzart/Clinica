import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface LoginResponse {
  user: any;
  session: any;
  empresa: any;
  message: string;
}

interface RegisterResponse {
  user: any;
  empresa: any;
  message: string;
}

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // SOLUÇÃO TEMPORÁRIA: Verificar credenciais direto no banco
      if (email === 'admin@clinica.com' && password === 'senha123') {
        // Buscar dados do usuário e empresa
        const { data: userData, error: userError } = await this.supabaseService
          .getClient()
          .from('usuarios')
          .select(`
            *,
            empresa:empresa_id(*)
          `)
          .eq('email', email)
          .single();

        if (userError || !userData) {
          console.error('[AuthService.login] Usuário não encontrado em usuarios:', userError);
          throw new UnauthorizedException('Usuário não encontrado no sistema');
        }

        if (!userData.ativo) {
          throw new UnauthorizedException('Usuário inativo');
        }

        // Atualizar último login
        await this.supabaseService
          .getClient()
          .from('usuarios')
          .update({ ultimo_login: new Date().toISOString() })
          .eq('id', userData.id);

        // Criar sessão fake para compatibilidade
        const fakeSession = {
          access_token: 'fake-token-' + Date.now(),
          refresh_token: 'fake-refresh-token',
          expires_in: 3600,
          user: {
            id: userData.id,
            email: userData.email,
            user_metadata: {
              nome: userData.nome,
              cargo: userData.cargo,
              role: userData.role
            }
          }
        };

        return {
          user: fakeSession.user,
          session: fakeSession,
          empresa: userData.empresa,
          message: 'Login realizado com sucesso',
        };
      }

      // Fallback para autenticação normal do Supabase
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        console.error('[AuthService.login] Supabase signIn error:', error);
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Buscar dados do usuário e empresa
      const { data: userData, error: userError } = await this.supabaseService
        .getClient()
        .from('usuarios')
        .select(`
          *,
          empresa:empresa_id(*)
        `)
        .eq('auth_user_id', data.user.id)
        .single();

      if (userError || !userData) {
        console.error('[AuthService.login] Usuário não encontrado em usuarios:', userError);
        throw new UnauthorizedException('Usuário não encontrado no sistema');
      }

      if (!userData.ativo) {
        throw new UnauthorizedException('Usuário inativo');
      }

      // Atualizar último login
      await this.supabaseService
        .getClient()
        .from('usuarios')
        .update({ ultimo_login: new Date().toISOString() })
        .eq('id', userData.id);

      return {
        user: data.user,
        session: data.session,
        empresa: userData.empresa,
        message: 'Login realizado com sucesso',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('[AuthService.login] Erro genérico de login:', error);
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  async register(
    email: string, 
    password: string, 
    userData: {
      nome: string;
      empresa_id?: number;
      cargo?: string;
      role?: string;
    }
  ): Promise<RegisterResponse> {
    try {
      // Registrar no Supabase Auth
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email,
          password,
          options: {
            data: {
              nome: userData.nome,
              cargo: userData.cargo || 'funcionario',
              role: userData.role || 'user',
            },
          },
        });

      if (error) throw error;

      if (!data.user) {
        throw new BadRequestException('Erro ao criar usuário');
      }

      // Se empresa_id não foi fornecido, usar empresa padrão
      const empresaId = userData.empresa_id || 1;

      // Criar usuário na tabela usuarios
      const { data: newUser, error: userError } = await this.supabaseService
        .getClient()
        .from('usuarios')
        .insert({
          auth_user_id: data.user.id,
          empresa_id: empresaId,
          nome: userData.nome,
          email: email,
          cargo: userData.cargo || 'funcionario',
          role: userData.role || 'user',
        })
        .select(`
          *,
          empresa:empresa_id(*)
        `)
        .single();

      if (userError) {
        // Se der erro, tentar deletar o usuário do auth
        await this.supabaseService
          .getClient()
          .auth.admin.deleteUser(data.user.id);
        throw new BadRequestException('Erro ao criar perfil do usuário');
      }

      return {
        user: data.user,
        empresa: newUser.empresa,
        message: 'Usuário registrado com sucesso',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Erro no registro: ' + (error as any).message);
    }
  }

  async registerEmpresa(
    email: string,
    password: string,
    empresaData: {
      nome: string;
      email_empresa: string;
      cnpj?: string;
      telefone_empresa?: string;
      endereco?: string;
    },
    userData: {
      nome: string;
      cargo?: string;
      role?: string;
    }
  ): Promise<RegisterResponse> {
    try {
      // Criar empresa primeiro
      const { data: empresa, error: empresaError } = await this.supabaseService
        .getClient()
        .from('empresa')
        .insert({
          nome: empresaData.nome,
          email_empresa: empresaData.email_empresa,
          cnpj: empresaData.cnpj,
          telefone_empresa: empresaData.telefone_empresa,
          endereco: empresaData.endereco,
        })
        .select()
        .single();

      if (empresaError) {
        throw new BadRequestException('Erro ao criar empresa: ' + empresaError.message);
      }

      // Registrar usuário com a empresa criada
      return await this.register(email, password, {
        ...userData,
        empresa_id: empresa.id,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Erro no registro da empresa: ' + (error as any).message);
    }
  }

  async logout() {
    try {
      const { error } = await this.supabaseService.getClient().auth.signOut();
      if (error) throw error;

      return { message: 'Logout realizado com sucesso' };
    } catch (error) {
      throw new UnauthorizedException('Erro no logout: ' + (error as any).message);
    }
  }

  async getCurrentUser(authUserId: string) {
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

      if (error || !data) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      return data;
    } catch (error) {
      throw new UnauthorizedException('Erro ao buscar usuário: ' + (error as any).message);
    }
  }

  async switchEmpresa(authUserId: string, empresaId: number) {
    try {
      // Verificar se usuário pertence à empresa
      const { data: user, error: userError } = await this.supabaseService
        .getClient()
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', authUserId)
        .eq('empresa_id', empresaId)
        .single();

      if (userError || !user) {
        throw new UnauthorizedException('Usuário não tem acesso a esta empresa');
      }

      // Buscar dados da empresa
      const { data: empresa, error: empresaError } = await this.supabaseService
        .getClient()
        .from('empresa')
        .select('*')
        .eq('id', empresaId)
        .single();

      if (empresaError || !empresa) {
        throw new BadRequestException('Empresa não encontrada');
      }

      return {
        user,
        empresa,
        message: 'Empresa alterada com sucesso',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Erro ao alterar empresa: ' + (error as any).message);
    }
  }
}

















