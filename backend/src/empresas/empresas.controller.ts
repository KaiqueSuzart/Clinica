import { Controller, Get, Put, Body, UseGuards, Request, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmpresasService } from './empresas.service';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { TenantGuard } from '../auth/tenant.guard';

@ApiTags('empresas')
@Controller('empresas')
@UseGuards(TenantGuard)
@ApiBearerAuth()
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get('dados')
  @ApiOperation({ summary: 'Obter dados da empresa atual' })
  @ApiResponse({ status: 200, description: 'Dados da empresa' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getDadosEmpresa(@Request() req) {
    const empresaId = req.empresa?.id;
    if (!empresaId) {
      throw new Error('Empresa não encontrada');
    }
    return this.empresasService.getDadosEmpresa(empresaId);
  }

  @Put('dados')
  @ApiOperation({ summary: 'Atualizar dados da empresa' })
  @ApiResponse({ status: 200, description: 'Dados atualizados com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async updateDadosEmpresa(@Request() req, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    const empresaId = req.empresa?.id;
    if (!empresaId) {
      throw new Error('Empresa não encontrada');
    }
    return this.empresasService.updateDadosEmpresa(empresaId, updateEmpresaDto);
  }

  @Post('upload-logo')
  @ApiOperation({ summary: 'Upload de logo da empresa' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Logo enviada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const empresaId = req.empresa?.id;
    if (!empresaId) {
      throw new Error('Empresa não encontrada');
    }
    return this.empresasService.uploadLogo(empresaId, file);
  }
}