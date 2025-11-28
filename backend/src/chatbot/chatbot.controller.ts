import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { WebhookDto, ChatMessageDto, ChatbotConfigDto } from './dto/chatbot.dto';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  // Webhook para receber mensagens do n8n
  @Post('webhook')
  async handleWebhook(@Body() webhookData: WebhookDto, @EmpresaId() empresaId: string) {
    return await this.chatbotService.processWebhookMessage(webhookData, empresaId);
  }

  // Endpoint para enviar mensagens para o n8n
  @Post('send-message')
  async sendMessage(@Body() messageData: ChatMessageDto) {
    return await this.chatbotService.sendMessageToN8n(messageData);
  }

  // Obter configurações do chatbot
  @Get('config')
  async getConfig(@EmpresaId() empresaId: string) {
    return await this.chatbotService.getConfig(empresaId);
  }

  // Atualizar configurações do chatbot
  @Post('config')
  async updateConfig(@Body() config: ChatbotConfigDto, @EmpresaId() empresaId: string) {
    return await this.chatbotService.updateConfig(config, empresaId);
  }

  // Obter histórico de conversas
  @Get('conversations/:patientId')
  async getConversations(@Param('patientId') patientId: string, @EmpresaId() empresaId: string) {
    return await this.chatbotService.getConversations(patientId, empresaId);
  }

  // Obter estatísticas do chatbot
  @Get('stats')
  async getStats(@EmpresaId() empresaId: string) {
    return await this.chatbotService.getStats(empresaId);
  }

  // Testar conexão com n8n
  @Post('test-connection')
  async testConnection() {
    return await this.chatbotService.testN8nConnection();
  }
}

