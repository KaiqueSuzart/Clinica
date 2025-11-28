import { Controller, Get, Query } from '@nestjs/common';
import { ChatbotDataService } from './chatbot-data.service';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

@Controller('chatbot/data')
export class ChatbotDataController {
  constructor(private readonly chatbotDataService: ChatbotDataService) {}

  // Obter procedimentos disponíveis
  @Get('procedimentos')
  async getProcedimentos(@EmpresaId() empresaId: string, @Query('categoria') categoria?: string) {
    return await this.chatbotDataService.getProcedimentos(empresaId, categoria);
  }

  // Obter horários de funcionamento
  @Get('horarios')
  async getHorarios(@EmpresaId() empresaId: string) {
    return await this.chatbotDataService.getHorarios(empresaId);
  }

  // Obter informações de contato
  @Get('contato')
  async getContato(@EmpresaId() empresaId: string) {
    return await this.chatbotDataService.getContato(empresaId);
  }

  // Obter FAQ
  @Get('faq')
  async getFAQ(@EmpresaId() empresaId: string, @Query('categoria') categoria?: string) {
    return await this.chatbotDataService.getFAQ(empresaId, categoria);
  }

  // Obter políticas da empresa
  @Get('politicas')
  async getPoliticas(@EmpresaId() empresaId: string, @Query('tipo') tipo?: string) {
    return await this.chatbotDataService.getPoliticas(empresaId, tipo);
  }

  // Obter promoções ativas
  @Get('promocoes')
  async getPromocoes(@EmpresaId() empresaId: string) {
    return await this.chatbotDataService.getPromocoes(empresaId);
  }

  // Obter especialidades
  @Get('especialidades')
  async getEspecialidades(@EmpresaId() empresaId: string) {
    return await this.chatbotDataService.getEspecialidades(empresaId);
  }

  // Obter profissionais
  @Get('profissionais')
  async getProfissionais(@EmpresaId() empresaId: string, @Query('especialidade') especialidade?: string) {
    return await this.chatbotDataService.getProfissionais(empresaId, especialidade);
  }

  // Buscar informações gerais (para o chatbot)
  @Get('search')
  async searchInfo(@Query('query') query: string, @EmpresaId() empresaId: string) {
    return await this.chatbotDataService.searchInfo(query, empresaId);
  }

  // Obter dados completos da empresa (resumo)
  @Get('empresa')
  async getEmpresaInfo(@EmpresaId() empresaId: string) {
    return await this.chatbotDataService.getEmpresaInfo(empresaId);
  }
}









