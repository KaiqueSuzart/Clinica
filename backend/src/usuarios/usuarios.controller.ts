import { Controller, Get, Post, Put, Delete, Param, Request, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { TenantGuard } from '../auth/tenant.guard';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

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
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada' })
  @ApiQuery({ name: 'empresaId', required: false })
  findAll(@Query('empresaId') empresaId?: string) {
    return this.usuariosService.findAll(empresaId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário (apenas admin)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário (apenas admin)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar usuário (apenas admin)' })
  @ApiResponse({ status: 200, description: 'Usuário desativado' }}  )
  deactivate(@Param('id') id: string) {
    return this.usuariosService.deactivate(id);
  }
}
