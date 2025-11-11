import { Controller, Get, Put, Request, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { TenantGuard } from '../auth/tenant.guard';

@ApiTags('usuarios')
@Controller('usuarios')
@UseGuards(TenantGuard)
@ApiBearerAuth()
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
}
