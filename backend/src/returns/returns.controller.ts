import { Controller, Get, Post, Body, Put, Param, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';

@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os retornos' })
  @ApiResponse({ status: 200, description: 'Lista de retornos retornada' })
  findAll() {
    return this.returnsService.findAll();
  }

  @Get('confirmed')
  @ApiOperation({ summary: 'Listar retornos confirmados' })
  @ApiResponse({ status: 200, description: 'Lista de retornos confirmados' })
  findConfirmed() {
    return this.returnsService.findConfirmedReturns();
  }

  @Get('possible')
  @ApiOperation({ summary: 'Listar possíveis retornos (pendentes)' })
  @ApiResponse({ status: 200, description: 'Lista de possíveis retornos' })
  findPossible() {
    return this.returnsService.findPossibleReturns();
  }

  @Get('completed')
  @ApiOperation({ summary: 'Listar retornos realizados (histórico)' })
  @ApiResponse({ status: 200, description: 'Lista de retornos realizados' })
  findCompleted() {
    return this.returnsService.findCompletedReturns();
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Listar retornos atrasados' })
  @ApiResponse({ status: 200, description: 'Lista de retornos atrasados' })
  findOverdue() {
    return this.returnsService.findOverdueReturns();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar retorno por ID' })
  @ApiResponse({ status: 200, description: 'Retorno encontrado' })
  @ApiResponse({ status: 404, description: 'Retorno não encontrado' })
  findOne(@Param('id') id: string) {
    return this.returnsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo retorno' })
  @ApiResponse({ status: 201, description: 'Retorno criado com sucesso' })
  create(@Body() createReturnDto: CreateReturnDto) {
    return this.returnsService.create(createReturnDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar retorno' })
  @ApiResponse({ status: 200, description: 'Retorno atualizado com sucesso' })
  update(@Param('id') id: string, @Body() updateReturnDto: UpdateReturnDto) {
    return this.returnsService.update(id, updateReturnDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover retorno' })
  @ApiResponse({ status: 200, description: 'Retorno removido com sucesso' })
  remove(@Param('id') id: string) {
    return this.returnsService.remove(id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirmar retorno' })
  @ApiResponse({ status: 200, description: 'Retorno confirmado com sucesso' })
  confirm(@Param('id') id: string) {
    return this.returnsService.confirmReturn(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Marcar retorno como realizado' })
  @ApiResponse({ status: 200, description: 'Retorno marcado como realizado' })
  complete(@Param('id') id: string) {
    return this.returnsService.markAsCompleted(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar retorno' })
  @ApiResponse({ status: 200, description: 'Retorno cancelado com sucesso' })
  cancel(@Param('id') id: string) {
    return this.returnsService.cancelReturn(id);
  }

  @Post('setup-table')
  @ApiOperation({ summary: 'Criar tabela de retornos' })
  @ApiResponse({ status: 200, description: 'Tabela criada com sucesso' })
  async setupTable() {
    return this.returnsService.setupTable();
  }
}
