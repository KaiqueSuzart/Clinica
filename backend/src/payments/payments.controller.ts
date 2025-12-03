import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentMethod } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { EmpresaId } from '../auth/decorators/empresa.decorator';
import { TenantGuard } from '../auth/tenant.guard';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(TenantGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar novo pagamento' })
  @ApiResponse({ status: 201, description: 'Pagamento registrado com sucesso' })
  create(@Body() createPaymentDto: CreatePaymentDto, @EmpresaId() empresaId: string) {
    return this.paymentsService.create(createPaymentDto, empresaId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pagamentos' })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos retornada' })
  findAll(
    @EmpresaId() empresaId: string,
    @Query('paciente_id') pacienteId?: string,
    @Query('consulta_id') consultaId?: string,
    @Query('data_inicio') dataInicio?: string,
    @Query('data_fim') dataFim?: string,
    @Query('forma_pagamento') formaPagamento?: PaymentMethod,
    @Query('confirmado') confirmado?: string,
  ) {
    const filters = {
      paciente_id: pacienteId,
      consulta_id: consultaId,
      data_inicio: dataInicio,
      data_fim: dataFim,
      forma_pagamento: formaPagamento,
      confirmado: confirmado === 'true' ? true : confirmado === 'false' ? false : undefined,
    };
    return this.paymentsService.findAll(empresaId, filters);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obter resumo financeiro' })
  @ApiResponse({ status: 200, description: 'Resumo financeiro retornado' })
  getSummary(
    @EmpresaId() empresaId: string,
    @Query('data_inicio') dataInicio?: string,
    @Query('data_fim') dataFim?: string,
  ) {
    return this.paymentsService.getFinancialSummary(empresaId, dataInicio, dataFim);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pagamento por ID' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  findOne(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.paymentsService.findOne(id, empresaId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento atualizado com sucesso' })
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @EmpresaId() empresaId: string,
  ) {
    return this.paymentsService.update(id, updatePaymentDto, empresaId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento removido com sucesso' })
  remove(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.paymentsService.remove(id, empresaId);
  }
}



