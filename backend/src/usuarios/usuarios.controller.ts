import { Controller, Get, Put, Post, Request, Body, UseGuards, Param, HttpException, HttpStatus, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
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
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getPerfilUsuario(@Request() req) {
    const authUserId = req.user?.id;
    if (!authUserId) {
      throw new HttpException('Usuário não autenticado', HttpStatus.UNAUTHORIZED);
    }

    try {
      return await this.usuariosService.getPerfilUsuario(authUserId);
    } catch (error) {
      console.error('[UsuariosController.getPerfilUsuario] Erro:', error);
      throw new HttpException(
        error.message || 'Erro ao buscar perfil do usuário',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('perfil')
  @ApiOperation({ summary: 'Atualizar perfil do usuário logado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async updatePerfilUsuario(@Request() req, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    const authUserId = req.user?.id;
    if (!authUserId) {
      throw new HttpException('Usuário não autenticado', HttpStatus.UNAUTHORIZED);
    }

    try {
      return await this.usuariosService.updatePerfilUsuario(authUserId, updateUsuarioDto);
    } catch (error) {
      console.error('[UsuariosController.updatePerfilUsuario] Erro:', error);
      throw error; // Re-lançar HttpException do service
    }
  }

  @Post('perfil/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload de avatar do usuário' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar atualizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const authUserId = req.user?.id;
    if (!authUserId) {
      throw new HttpException('Usuário não autenticado', HttpStatus.UNAUTHORIZED);
    }

    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // Validar tipo de arquivo
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP');
    }

    try {
      return await this.usuariosService.uploadAvatar(authUserId, file);
    } catch (error) {
      console.error('[UsuariosController.uploadAvatar] Erro:', error);
      throw error;
    }
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
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    try {
      console.log('[UsuariosController.update] Recebido:', { id, updateUsuarioDto });
      const result = await this.usuariosService.update(id, updateUsuarioDto);
      console.log('[UsuariosController.update] Sucesso:', result);
      return result;
    } catch (error) {
      console.error('[UsuariosController.update] Erro completo:', error);
      console.error('[UsuariosController.update] Stack:', error.stack);
      throw error; // Re-lançar HttpException do service
    }
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Desativar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário desativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async deactivate(@Param('id') id: string) {
    return this.usuariosService.deactivate(id);
  }

  @Get('dentistas')
  @ApiOperation({ summary: 'Listar apenas dentistas da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de dentistas' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAllDentistas(@EmpresaId() empresaId: string) {
    return this.usuariosService.findAllDentistas(empresaId);
  }
}
