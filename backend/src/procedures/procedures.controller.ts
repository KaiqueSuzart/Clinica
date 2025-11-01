import { Controller, Get, Post, Body, Put, Param, Delete, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';

@ApiTags('Procedures')
@Controller('procedures')
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os procedimentos' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoria' })
  @ApiQuery({ name: 'ativo', required: false, description: 'Filtrar por status ativo' })
  @ApiResponse({ status: 200, description: 'Lista de procedimentos retornada com sucesso' })
  findAll(
    @Query('categoria') categoria?: string,
    @Query('ativo') ativo?: string
  ) {
    const ativoBoolean = ativo !== undefined ? ativo === 'true' : undefined;
    return this.proceduresService.findAll(categoria, ativoBoolean);
  }

  @Get('categorias')
  @ApiOperation({ summary: 'Listar todas as categorias de procedimentos' })
  @ApiResponse({ status: 200, description: 'Lista de categorias retornada com sucesso' })
  getCategorias() {
    return this.proceduresService.getCategorias();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar procedimento por ID' })
  @ApiResponse({ status: 200, description: 'Procedimento encontrado' })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.proceduresService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo procedimento' })
  @ApiResponse({ status: 201, description: 'Procedimento criado com sucesso' })
  create(
    @Body() createProcedureDto: CreateProcedureDto,
    @Headers('x-empresa-id') empresaId?: string
  ) {
    return this.proceduresService.create(createProcedureDto, empresaId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar procedimento' })
  @ApiResponse({ status: 200, description: 'Procedimento atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado' })
  update(@Param('id') id: string, @Body() updateProcedureDto: UpdateProcedureDto) {
    return this.proceduresService.update(id, updateProcedureDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar procedimento' })
  @ApiResponse({ status: 200, description: 'Procedimento desativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado' })
  remove(@Param('id') id: string) {
    return this.proceduresService.remove(id);
  }
}

