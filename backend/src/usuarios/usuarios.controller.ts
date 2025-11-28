import { Controller, Get, Put, Post, Request, Body, UseGuards, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { TenantGuard } from '../auth/tenant.guard';
import { EmpresaId } from '../auth/decorators/empresa.decorator';
import { SupabaseService } from '../supabase/supabase.service';

@ApiTags('usuarios')
@Controller('usuarios')
@UseGuards(TenantGuard)
@ApiBearerAuth()
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly supabaseService: SupabaseService
  ) {}

  @Get('perfil')
  @ApiOperation({ summary: 'Buscar perfil do usuário logado' })
  @ApiResponse({ status: 200, description: 'Perfil encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getPerfilUsuario(@Request() req) {
    const authUserId = req.user?.id;
    if (!authUserId) {
      throw new Error('Usuário não encontrado');
    }

    return this.usuariosService.getPerfilUsuario(authUserId);
  }

  @Put('perfil')
  @ApiOperation({ summary: 'Atualizar perfil do usuário logado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async updatePerfilUsuario(@Request() req, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    const authUserId = req.user?.id;
    if (!authUserId) {
      throw new Error('Usuário não encontrado');
    }

    return this.usuariosService.updatePerfilUsuario(authUserId, updateUsuarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAll(@EmpresaId() empresaId: string) {
    return this.usuariosService.findAll(empresaId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@EmpresaId() empresaId: string, @Body() createUsuarioDto: CreateUsuarioDto) {
    try {
      // Usar empresaId do decorator e também criar no Supabase Auth
      const { email, nome, cargo, permissoes, ativo, telefone, avatar_url, password } = createUsuarioDto;
      
      // Validar campos obrigatórios
      if (!email || !nome || !cargo) {
        throw new HttpException(
          'Email, nome e cargo são obrigatórios',
          HttpStatus.BAD_REQUEST
        );
      }

      // Verificar se o email já existe na tabela usuarios
      const supabase = this.supabaseService.getClient();
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id, email, nome')
        .eq('email', email)
        .eq('empresa_id', empresaId)
        .single();

      if (existingUser) {
        throw new HttpException(
          `Já existe um usuário cadastrado com o email ${email}`,
          HttpStatus.CONFLICT
        );
      }

      // Verificar se o email já existe no Supabase Auth
      const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
      const emailExists = authUsers?.users?.some((u: any) => u.email === email);

      if (emailExists && authUsers?.users) {
        // Se existe no Auth mas não na tabela usuarios, tentar buscar o auth_user_id
        const existingAuthUser = authUsers.users.find((u: any) => u.email === email);
        
        if (existingAuthUser) {
          // Verificar se já existe na tabela usuarios com esse auth_user_id
          const { data: userWithAuthId } = await supabase
            .from('usuarios')
            .select('id, email')
            .eq('auth_user_id', existingAuthUser.id)
            .single();

          if (userWithAuthId) {
            throw new HttpException(
              `Já existe um usuário cadastrado com o email ${email}`,
              HttpStatus.CONFLICT
            );
          }

          // Se não existe na tabela, criar registro vinculando ao auth existente
          const result = await this.usuariosService.create({
            email,
            nome,
            cargo,
            empresa_id: empresaId,
            permissoes,
            ativo: ativo !== undefined ? ativo : true,
            telefone,
            avatar_url,
            auth_user_id: existingAuthUser.id,
          });

          return {
            ...result,
            message: 'Usuário criado com sucesso vinculando a conta existente no sistema de autenticação.'
          };
        }
      }

      // Usar senha fornecida ou gerar senha temporária
      const senhaFinal = password || (Math.random().toString(36).slice(-8) + 'A1!');
      const senhaGerada = !password; // Flag para saber se foi gerada
      
      // Criar usuário no Supabase Auth primeiro usando o SupabaseService
      const supabaseAdmin = this.supabaseService.getClient();
      
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: senhaFinal,
        email_confirm: true,
        user_metadata: {
          nome,
          cargo,
          role: cargo.toLowerCase(),
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário no Supabase Auth:', authError);
        
        // Se o erro for de email já existente, retornar mensagem mais clara
        if (authError.code === 'email_exists' || authError.message?.includes('already been registered')) {
          throw new HttpException(
            `Já existe um usuário cadastrado com o email ${email}. Por favor, use outro email.`,
            HttpStatus.CONFLICT
          );
        }
        
        throw new HttpException(
          'Erro ao criar usuário no sistema de autenticação: ' + authError.message,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!authData || !authData.user) {
        throw new HttpException(
          'Erro ao criar usuário: dados de autenticação não retornados',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Criar usuário na tabela usuarios
      const result = await this.usuariosService.create({
        email,
        nome,
        cargo,
        empresa_id: empresaId,
        permissoes,
        ativo: ativo !== undefined ? ativo : true,
        telefone,
        avatar_url,
        auth_user_id: authData.user.id,
      });

      // Retornar resultado com senha (se foi gerada, mostrar; se foi fornecida, não mostrar por segurança)
      return {
        ...result,
        password_temporaria: senhaGerada ? senhaFinal : undefined,
        message: senhaGerada 
          ? 'Usuário criado com sucesso. Senha temporária: ' + senhaFinal
          : 'Usuário criado com sucesso com a senha fornecida.'
      };
    } catch (error) {
      console.error('Erro completo ao criar usuário:', error);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Desativar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário desativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async deactivate(@Param('id') id: string) {
    return this.usuariosService.deactivate(id);
  }
}
