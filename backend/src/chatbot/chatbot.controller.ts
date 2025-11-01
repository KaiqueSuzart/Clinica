import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { WebhookDto, ChatMessageDto, ChatbotConfigDto } from './dto/chatbot.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  // Webhook para receber mensagens do n8n
  @Post('webhook')
  async handleWebhook(@Body() webhookData: WebhookDto) {
    return await this.chatbotService.processWebhookMessage(webhookData);
  }

  // Endpoint para enviar mensagens para o n8n
  @Post('send-message')
  async sendMessage(@Body() messageData: ChatMessageDto) {
    return await this.chatbotService.sendMessageToN8n(messageData);
  }

  // Obter configurações do chatbot
  @Get('config')
  async getConfig() {
    return await this.chatbotService.getConfig();
  }

  // Atualizar configurações do chatbot
  @Post('config')
  async updateConfig(@Body() config: ChatbotConfigDto) {
    return await this.chatbotService.updateConfig(config);
  }

  // Obter histórico de conversas
  @Get('conversations/:patientId')
  async getConversations(@Param('patientId') patientId: string) {
    return await this.chatbotService.getConversations(patientId);
  }

  // Obter estatísticas do chatbot
  @Get('stats')
  async getStats() {
    return await this.chatbotService.getStats();
  }

  // Testar conexão com n8n
  @Post('test-connection')
  async testConnection() {
    return await this.chatbotService.testN8nConnection();
  }
}

