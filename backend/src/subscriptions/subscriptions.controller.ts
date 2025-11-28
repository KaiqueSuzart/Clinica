import { Controller, Get, Post, Put, Request, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto, ChatbotBillingDto, PaymentHistoryDto } from './dto/subscription.dto';
import { TenantGuard } from '../auth/tenant.guard';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(TenantGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // ===== PLANOS DE ASSINATURA =====
  
  @Get('plans')
  @ApiOperation({ summary: 'Listar planos de assinatura disponíveis' })
  @ApiResponse({ status: 200, description: 'Planos listados com sucesso' })
  async getSubscriptionPlans() {
    return this.subscriptionsService.getSubscriptionPlans();
  }

  // ===== ASSINATURA DA EMPRESA =====
  
  @Get('empresa')
  @ApiOperation({ summary: 'Buscar assinatura da empresa' })
  @ApiResponse({ status: 200, description: 'Assinatura encontrada com sucesso' })
  async getEmpresaSubscription(@EmpresaId() empresaId: string) {
    return this.subscriptionsService.getEmpresaSubscription(empresaId);
  }

  @Post('empresa')
  @ApiOperation({ summary: 'Criar assinatura para a empresa' })
  @ApiResponse({ status: 201, description: 'Assinatura criada com sucesso' })
  async createEmpresaSubscription(@EmpresaId() empresaId: string, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.createEmpresaSubscription(empresaId, createSubscriptionDto);
  }

  @Put('empresa')
  @ApiOperation({ summary: 'Atualizar assinatura da empresa' })
  @ApiResponse({ status: 200, description: 'Assinatura atualizada com sucesso' })
  async updateEmpresaSubscription(@EmpresaId() empresaId: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.updateEmpresaSubscription(empresaId, updateSubscriptionDto);
  }

  // ===== COBRANÇA DO CHATBOT =====
  
  @Get('chatbot-billing')
  @ApiOperation({ summary: 'Buscar cobranças do chatbot' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Cobranças encontradas com sucesso' })
  async getChatbotBilling(
    @EmpresaId() empresaId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.subscriptionsService.getChatbotBilling(empresaId, startDate, endDate);
  }

  @Post('chatbot-billing')
  @ApiOperation({ summary: 'Criar cobrança do chatbot' })
  @ApiResponse({ status: 201, description: 'Cobrança criada com sucesso' })
  async createChatbotBilling(@EmpresaId() empresaId: string, @Body() chatbotBillingDto: ChatbotBillingDto) {
    return this.subscriptionsService.createChatbotBilling(empresaId, chatbotBillingDto);
  }

  // ===== HISTÓRICO DE PAGAMENTOS =====
  
  @Get('payment-history')
  @ApiOperation({ summary: 'Buscar histórico de pagamentos' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Histórico encontrado com sucesso' })
  async getPaymentHistory(
    @EmpresaId() empresaId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.subscriptionsService.getPaymentHistory(empresaId, startDate, endDate);
  }

  @Post('payment-history')
  @ApiOperation({ summary: 'Criar registro de pagamento' })
  @ApiResponse({ status: 201, description: 'Registro criado com sucesso' })
  async createPaymentRecord(@EmpresaId() empresaId: string, @Body() paymentHistoryDto: PaymentHistoryDto) {
    return this.subscriptionsService.createPaymentRecord(empresaId, paymentHistoryDto);
  }

  // ===== RESUMO FINANCEIRO =====
  
  @Get('financial-summary')
  @ApiOperation({ summary: 'Buscar resumo financeiro da empresa' })
  @ApiResponse({ status: 200, description: 'Resumo encontrado com sucesso' })
  async getFinancialSummary(@EmpresaId() empresaId: string) {
    return this.subscriptionsService.getFinancialSummary(empresaId);
  }
}
