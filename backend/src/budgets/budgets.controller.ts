import { Controller, Get, Post, Body, Put, Param, Delete, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

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
  async findAll(@EmpresaId() empresaId: string) {
    console.log('BudgetsController.findAll() chamado');
    try {
      return await this.budgetsService.findAll(empresaId);
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
  findOne(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.budgetsService.findOne(id, empresaId);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Buscar orçamentos por paciente' })
  @ApiParam({ name: 'patientId', description: 'ID do paciente' })
  @ApiResponse({ status: 200, description: 'Orçamentos do paciente retornados com sucesso' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  findByPatient(@Param('patientId') patientId: string, @EmpresaId() empresaId: string) {
    return this.budgetsService.findByPatient(patientId, empresaId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo orçamento' })
  @ApiResponse({ status: 201, description: 'Orçamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async create(@Body() createBudgetDto: CreateBudgetDto, @EmpresaId() empresaId: string) {
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
      const result = await this.budgetsService.create(createBudgetDto, empresaId);
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
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto, @EmpresaId() empresaId: string) {
    return this.budgetsService.update(id, updateBudgetDto, empresaId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Atualizar status do orçamento' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiQuery({ name: 'status', description: 'Novo status do orçamento' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async updateStatus(@Param('id') id: string, @Query('status') status: string, @EmpresaId() empresaId: string) {
    try {
      console.log('[BudgetsController.updateStatus] 📥 Recebido:', { id, status, empresaId });
      const result = await this.budgetsService.updateStatus(id, status, empresaId);
      console.log('[BudgetsController.updateStatus] ✅ Resultado obtido:', { id: result?.id, status: result?.status });
      
      // Retornar apenas os dados essenciais para evitar problemas de serialização
      const response = {
        success: true,
        message: 'Status do orçamento atualizado com sucesso',
        data: {
          id: result?.id,
          status: result?.status,
          updated_at: result?.updated_at
        }
      };
      
      console.log('[BudgetsController.updateStatus] ✅ Retornando resposta:', response);
      return response;
    } catch (error) {
      console.error('[BudgetsController.updateStatus] ❌ Erro:', error);
      // Se for um Error genérico, converter para HttpException
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar orçamento' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({ status: 200, description: 'Orçamento deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  remove(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.budgetsService.remove(id, empresaId);
  }
}
