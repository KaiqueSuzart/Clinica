import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('Budgets')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {
    console.log('BudgetsController inicializado');
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os orçamentos' })
  @ApiResponse({ status: 200, description: 'Lista de orçamentos retornada com sucesso' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async findAll() {
    console.log('BudgetsController.findAll() chamado');
    try {
      return await this.budgetsService.findAll();
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      return [];
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar orçamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({ status: 200, description: 'Orçamento encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  findOne(@Param('id') id: string) {
    return this.budgetsService.findOne(id);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Buscar orçamentos por paciente' })
  @ApiParam({ name: 'patientId', description: 'ID do paciente' })
  @ApiResponse({ status: 200, description: 'Orçamentos do paciente retornados com sucesso' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.budgetsService.findByPatient(patientId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo orçamento' })
  @ApiResponse({ status: 201, description: 'Orçamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async create(@Body() createBudgetDto: CreateBudgetDto) {
    try {
      console.log('BudgetsController.create - Dados recebidos:', JSON.stringify(createBudgetDto, null, 2));
      
      // Validar se os dados estão corretos
      if (!createBudgetDto.cliente_id) {
        throw new Error('cliente_id é obrigatório');
      }
      if (!createBudgetDto.data_validade) {
        throw new Error('data_validade é obrigatória');
      }
      // Itens são opcionais, mas se fornecidos devem ser válidos
      if (createBudgetDto.itens && createBudgetDto.itens.length === 0) {
        throw new Error('se itens forem fornecidos, deve haver pelo menos um item');
      }
      
      console.log('BudgetsController.create - Validação passou, chamando service...');
      const result = await this.budgetsService.create(createBudgetDto);
      console.log('BudgetsController.create - Resultado:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('BudgetsController.create - Erro:', error);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar orçamento' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({ status: 200, description: 'Orçamento atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.update(id, updateBudgetDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Atualizar status do orçamento' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiQuery({ name: 'status', description: 'Novo status do orçamento' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  updateStatus(@Param('id') id: string, @Query('status') status: string) {
    return this.budgetsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar orçamento' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({ status: 200, description: 'Orçamento deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  remove(@Param('id') id: string) {
    return this.budgetsService.remove(id);
  }
}
