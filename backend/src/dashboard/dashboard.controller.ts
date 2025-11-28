import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('monthly-stats')
  @ApiOperation({ summary: 'Obter estatísticas do mês atual' })
  @ApiResponse({ status: 200, description: 'Estatísticas mensais retornadas com sucesso' })
  getMonthlyStats(@EmpresaId() empresaId: string) {
    if (!empresaId) {
      throw new Error('Empresa ID não fornecido');
    }
    return this.dashboardService.getMonthlyStats(empresaId);
  }

  @Get('today-stats')
  @ApiOperation({ summary: 'Obter estatísticas do dia' })
  @ApiResponse({ status: 200, description: 'Estatísticas do dia retornadas com sucesso' })
  getTodayStats(@EmpresaId() empresaId: string) {
    return this.dashboardService.getTodayStats(empresaId);
  }
}



