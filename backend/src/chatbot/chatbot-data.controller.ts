import { Controller, Get, Query } from '@nestjs/common';
import { ChatbotDataService } from './chatbot-data.service';

@Controller('chatbot/data')
export class ChatbotDataController {
  constructor(private readonly chatbotDataService: ChatbotDataService) {}

  // Obter procedimentos disponíveis
  @Get('procedimentos')
  async getProcedimentos(@Query('categoria') categoria?: string) {
    return await this.chatbotDataService.getProcedimentos(categoria);
  }

  // Obter horários de funcionamento
  @Get('horarios')
  async getHorarios() {
    return await this.chatbotDataService.getHorarios();
  }

  // Obter informações de contato
  @Get('contato')
  async getContato() {
    return await this.chatbotDataService.getContato();
  }

  // Obter FAQ
  @Get('faq')
  async getFAQ(@Query('categoria') categoria?: string) {
    return await this.chatbotDataService.getFAQ(categoria);
  }

  // Obter políticas da empresa
  @Get('politicas')
  async getPoliticas(@Query('tipo') tipo?: string) {
    return await this.chatbotDataService.getPoliticas(tipo);
  }

  // Obter promoções ativas
  @Get('promocoes')
  async getPromocoes() {
    return await this.chatbotDataService.getPromocoes();
  }

  // Obter especialidades
  @Get('especialidades')
  async getEspecialidades() {
    return await this.chatbotDataService.getEspecialidades();
  }

  // Obter profissionais
  @Get('profissionais')
  async getProfissionais(@Query('especialidade') especialidade?: string) {
    return await this.chatbotDataService.getProfissionais(especialidade);
  }

  // Buscar informações gerais (para o chatbot)
  @Get('search')
  async searchInfo(@Query('query') query: string) {
    return await this.chatbotDataService.searchInfo(query);
  }

  // Obter dados completos da empresa (resumo)
  @Get('empresa')
  async getEmpresaInfo() {
    return await this.chatbotDataService.getEmpresaInfo();
  }
}







