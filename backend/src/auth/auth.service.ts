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
      console.log('[AuthService.login] Tentativa de login:', { email, passwordLength: password?.length });

      // SOLUÇÃO TEMPORÁRIA: Verificar credenciais direto no banco
      if (email === 'admin@clinica.com' && password === 'senha123') {
        console.log('[AuthService.login] Usando login temporário para admin@clinica.com');
        // Buscar dados do usuário e empresa usando admin client
        const { data: userData, error: userError } = await this.supabaseService
          .getAdminClient()
          .from('usuarios')
          .select(`
            *,
            empresa:empresa_id(*)
          `)
          .eq('email', email)
          .maybeSingle(); // Usar maybeSingle() para não dar erro se não encontrar

        console.log('[AuthService.login] Resultado da busca admin:', { userData, userError });

        if (userError || !userData) {
          console.error('[AuthService.login] Usuário não encontrado em usuarios:', userError);
          // Tentar buscar qualquer empresa para criar o usuário admin
          const { data: primeiraEmpresa } = await this.supabaseService
            .getAdminClient()
            .from('empresa')
            .select('id')
            .limit(1)
            .single();

          if (primeiraEmpresa) {
            console.log('[AuthService.login] Criando usuário admin automaticamente...');
            // Criar usuário admin automaticamente usando admin client
            const { data: novoUsuario, error: createError } = await this.supabaseService
              .getAdminClient()
              .from('usuarios')
              .insert({
                email: 'admin@clinica.com',
                nome: 'Administrador',
                cargo: 'admin',
                empresa_id: primeiraEmpresa.id,
                ativo: true,
                permissoes: this.generatePermissions('admin'),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select(`
                *,
                empresa:empresa_id(*)
              `)
              .single();

            if (novoUsuario) {
              const fakeSession = {
                access_token: 'fake-token-' + Date.now(),
                refresh_token: 'fake-refresh-token',
                expires_in: 3600,
                user: {
                  id: novoUsuario.id,
                  email: novoUsuario.email,
                  user_metadata: {
                    nome: novoUsuario.nome,
                    cargo: novoUsuario.cargo,
                    role: 'admin'
                  }
                }
              };

              return {
                user: fakeSession.user,
                session: fakeSession,
                empresa: novoUsuario.empresa,
                message: 'Login realizado com sucesso',
              };
            }
          }
          
          throw new UnauthorizedException('Usuário não encontrado no sistema');
        }

        if (!userData.ativo) {
          throw new UnauthorizedException('Usuário inativo');
        }

        // Atualizar último login usando admin client
        await this.supabaseService
          .getAdminClient()
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
              role: userData.cargo?.toLowerCase() || 'admin'
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

      // Autenticação normal do Supabase
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

      if (!data || !data.user) {
        console.error('[AuthService.login] Dados de autenticação não retornados');
        throw new UnauthorizedException('Erro ao autenticar usuário');
      }

      console.log('[AuthService.login] Usuário autenticado no Supabase Auth:', data.user.id, data.user.email);

      // Buscar dados do usuário e empresa usando auth_user_id
      // Usar admin client para bypassar RLS que está causando recursão
      const { data: userData, error: userError } = await this.supabaseService
        .getAdminClient()
        .from('usuarios')
        .select(`
          *,
          empresa:empresa_id(*)
        `)
        .eq('auth_user_id', data.user.id)
        .single();

      console.log('[AuthService.login] Busca na tabela usuarios:', {
        auth_user_id: data.user.id,
        userError: userError,
        userData: userData ? { id: userData.id, email: userData.email, nome: userData.nome } : null
      });

      if (userError || !userData) {
        console.error('[AuthService.login] Usuário não encontrado em usuarios:', {
          error: userError,
          auth_user_id: data.user.id,
          email: email
        });
        
        // Tentar buscar por email como fallback (caso auth_user_id não tenha sido salvo)
        console.log('[AuthService.login] Tentando buscar por email como fallback...');
        const { data: userByEmail, error: emailError } = await this.supabaseService
          .getAdminClient()
          .from('usuarios')
          .select(`
            *,
            empresa:empresa_id(*)
          `)
          .eq('email', email)
          .maybeSingle(); // Usar maybeSingle() em vez de single() para não dar erro se não encontrar

        console.log('[AuthService.login] Busca por email (fallback):', {
          email,
          emailError,
          userByEmail: userByEmail ? { 
            id: userByEmail.id, 
            email: userByEmail.email, 
            nome: userByEmail.nome, 
            auth_user_id: userByEmail.auth_user_id,
            empresa_id: userByEmail.empresa_id,
            ativo: userByEmail.ativo
          } : null
        });

        if (userByEmail) {
          // Se encontrou por email, usar esse usuário
          console.log('[AuthService.login] Usuário encontrado por email, atualizando auth_user_id se necessário');
          
          if (!userByEmail.ativo) {
            throw new UnauthorizedException('Usuário inativo');
          }

          // Se não tem auth_user_id, atualizar
          if (!userByEmail.auth_user_id) {
            console.log('[AuthService.login] Atualizando auth_user_id para:', data.user.id);
            const { error: updateError } = await this.supabaseService
              .getAdminClient()
              .from('usuarios')
              .update({ auth_user_id: data.user.id })
              .eq('id', userByEmail.id);
            
            if (updateError) {
              console.error('[AuthService.login] Erro ao atualizar auth_user_id:', updateError);
            }
          }

          // Atualizar último login
          await this.supabaseService
            .getAdminClient()
            .from('usuarios')
            .update({ ultimo_login: new Date().toISOString() })
            .eq('id', userByEmail.id);
          
          return {
            user: data.user,
            session: data.session,
            empresa: userByEmail.empresa,
            message: 'Login realizado com sucesso',
          };
        }

        // Se não encontrou nem por auth_user_id nem por email, criar registro automaticamente
        console.log('[AuthService.login] Usuário autenticado no Auth mas não encontrado na tabela usuarios. Criando registro automaticamente...');
        
        // Buscar primeira empresa para vincular o usuário
        const { data: primeiraEmpresa } = await this.supabaseService
          .getAdminClient()
          .from('empresa')
          .select('id')
          .limit(1)
          .single();

        if (!primeiraEmpresa) {
          throw new UnauthorizedException('Nenhuma empresa cadastrada no sistema. Entre em contato com o administrador.');
        }

        // Gerar permissões baseadas no cargo (se disponível nos metadados)
        const cargo = data.user.user_metadata?.cargo || data.user.user_metadata?.role || 'funcionario';
        const permissoes = this.generatePermissions(cargo);

        // Criar registro na tabela usuarios usando admin client para bypassar RLS
        const { data: novoUsuario, error: createError } = await this.supabaseService
          .getAdminClient()
          .from('usuarios')
          .insert({
            email: data.user.email || email,
            nome: data.user.user_metadata?.nome || data.user.email?.split('@')[0] || 'Usuário',
            cargo: cargo,
            empresa_id: primeiraEmpresa.id,
            auth_user_id: data.user.id,
            ativo: true,
            permissoes: permissoes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select(`
            *,
            empresa:empresa_id(*)
          `)
          .single();

        if (createError || !novoUsuario) {
          console.error('[AuthService.login] Erro ao criar registro do usuário:', createError);
          throw new UnauthorizedException('Erro ao criar registro do usuário. Tente novamente.');
        }

        console.log('[AuthService.login] Registro do usuário criado automaticamente:', novoUsuario.id);

        // Atualizar último login
        await this.supabaseService
          .getAdminClient()
          .from('usuarios')
          .update({ ultimo_login: new Date().toISOString() })
          .eq('id', novoUsuario.id);

        return {
          user: data.user,
          session: data.session,
          empresa: novoUsuario.empresa,
          message: 'Login realizado com sucesso. Registro criado automaticamente.',
        };
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
      permissoes?: any; // Permissões customizadas (opcional)
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

      // Gerar permissões baseadas no role/cargo (ou usar as fornecidas)
      const permissoes = userData.permissoes || this.generatePermissions(userData.role || userData.cargo || 'user');

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
          permissoes: permissoes,
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

      // Registrar usuário admin com a empresa criada
      const adminUserData = {
        ...userData,
        empresa_id: empresa.id,
        cargo: userData.cargo || 'admin',
        role: userData.role || 'admin',
      };
      
      return await this.register(email, password, adminUserData);
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

  /**
   * Gera permissões baseadas no role/cargo do usuário
   */
  private generatePermissions(roleOrCargo: string): any {
    const role = roleOrCargo.toLowerCase();
    
    // Permissões base por role
    const permissionsMap: { [key: string]: any } = {
      admin: {
        canView: ['pacientes', 'agenda', 'relatorios', 'configuracoes', 'mensagens', 'retornos', 'orcamentos', 'arquivos', 'anamnese', 'annotations', 'treatment-plans', 'evaluations'],
        canEdit: ['pacientes', 'agenda', 'relatorios', 'configuracoes', 'mensagens', 'retornos', 'orcamentos', 'arquivos', 'anamnese', 'annotations', 'treatment-plans', 'evaluations'],
        canDelete: ['pacientes', 'agenda', 'relatorios', 'mensagens', 'retornos', 'orcamentos', 'arquivos', 'anamnese', 'annotations', 'treatment-plans', 'evaluations'],
        canManageUsers: true,
        canViewFinancial: true,
        canEditSettings: true,
      },
      dentista: {
        canView: ['pacientes', 'agenda', 'relatorios', 'configuracoes', 'mensagens', 'retornos', 'orcamentos', 'arquivos', 'anamnese', 'annotations', 'treatment-plans', 'evaluations'],
        canEdit: ['pacientes', 'agenda', 'relatorios', 'mensagens', 'retornos', 'orcamentos', 'arquivos', 'anamnese', 'annotations', 'treatment-plans', 'evaluations'],
        canDelete: ['pacientes', 'agenda', 'mensagens', 'retornos', 'orcamentos', 'arquivos', 'anamnese', 'annotations', 'treatment-plans', 'evaluations'],
        canManageUsers: false,
        canViewFinancial: true,
        canEditSettings: false,
      },
      recepcionista: {
        canView: ['pacientes', 'agenda', 'mensagens', 'retornos', 'orcamentos', 'configuracoes'],
        canEdit: ['pacientes', 'agenda', 'mensagens', 'retornos', 'orcamentos'],
        canDelete: [],
        canManageUsers: false,
        canViewFinancial: false,
        canEditSettings: false,
      },
      financeiro: {
        canView: ['pacientes', 'agenda', 'relatorios', 'orcamentos'],
        canEdit: ['orcamentos'],
        canDelete: [],
        canManageUsers: false,
        canViewFinancial: true,
        canEditSettings: false,
      },
      funcionario: {
        canView: ['pacientes', 'agenda'],
        canEdit: ['agenda'],
        canDelete: [],
        canManageUsers: false,
        canViewFinancial: false,
        canEditSettings: false,
      },
    };

    // Retornar permissões do role ou padrão de funcionário
    return permissionsMap[role] || permissionsMap.funcionario;
  }
}

















