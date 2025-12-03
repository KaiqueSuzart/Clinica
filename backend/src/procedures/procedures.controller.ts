import { Controller, Get, Post, Body, Put, Param, Delete, Query, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

@ApiTags('Procedures')
@Controller('procedures')
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os procedimentos' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoria' })
  @ApiQuery({ name: 'ativo', required: false, description: 'Filtrar por status ativo' })
  @ApiResponse({ status: 200, description: 'Lista de procedimentos retornada com sucesso' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async findAll(
    @EmpresaId() empresaId: string,
    @Query('categoria') categoria?: string,
    @Query('ativo') ativo?: string
  ) {
    try {
      const ativoBoolean = ativo !== undefined ? ativo === 'true' : undefined;
      return await this.proceduresService.findAll(empresaId, categoria, ativoBoolean);
    } catch (error) {
      console.error('[ProceduresController.findAll] ❌ Erro:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Erro interno do servidor ao listar procedimentos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('categorias')
  @ApiOperation({ summary: 'Listar todas as categorias de procedimentos' })
  @ApiResponse({ status: 200, description: 'Lista de categorias retornada com sucesso' })
  getCategorias(@EmpresaId() empresaId: string) {
    return this.proceduresService.getCategorias(empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar procedimento por ID' })
  @ApiResponse({ status: 200, description: 'Procedimento encontrado' })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado' })
  findOne(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.proceduresService.findOne(id, empresaId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo procedimento' })
  @ApiResponse({ status: 201, description: 'Procedimento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async create(
    @Body() createProcedureDto: CreateProcedureDto,
    @EmpresaId() empresaId: string
  ) {
    try {
      console.log('[ProceduresController.create] 📥 Recebido:', { createProcedureDto, empresaId });
      const result = await this.proceduresService.create(createProcedureDto, empresaId);
      console.log('[ProceduresController.create] ✅ Resultado:', result);
      return result;
    } catch (error) {
      console.error('[ProceduresController.create] ❌ Erro:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Erro interno do servidor ao criar procedimento',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar procedimento' })
  @ApiResponse({ status: 200, description: 'Procedimento atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado' })
  update(@Param('id') id: string, @Body() updateProcedureDto: UpdateProcedureDto, @EmpresaId() empresaId: string) {
    return this.proceduresService.update(id, updateProcedureDto, empresaId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar procedimento' })
  @ApiResponse({ status: 200, description: 'Procedimento desativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado' })
  remove(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.proceduresService.remove(id, empresaId);
  }
}



