import { Controller, Get, Put, Body, UseGuards, Request, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmpresasService } from './empresas.service';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { TenantGuard } from '../auth/tenant.guard';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

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
  async getDadosEmpresa(@EmpresaId() empresaId: string) {
    return this.empresasService.getDadosEmpresa(empresaId);
  }

  @Put('dados')
  @ApiOperation({ summary: 'Atualizar dados da empresa' })
  @ApiResponse({ status: 200, description: 'Dados atualizados com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async updateDadosEmpresa(@EmpresaId() empresaId: string, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    return this.empresasService.updateDadosEmpresa(empresaId, updateEmpresaDto);
  }

  @Post('upload-logo')
  @ApiOperation({ summary: 'Upload de logo da empresa' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Logo enviada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@EmpresaId() empresaId: string, @UploadedFile() file: Express.Multer.File) {
    return this.empresasService.uploadLogo(empresaId, file);
  }
}