import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('monthly-stats')
  @ApiOperation({ summary: 'Obter estatísticas do mês atual' })
  @ApiResponse({ status: 200, description: 'Estatísticas mensais retornadas com sucesso' })
  getMonthlyStats(@Headers('x-empresa-id') empresaId?: string) {
    return this.dashboardService.getMonthlyStats(empresaId);
  }

  @Get('today-stats')
  @ApiOperation({ summary: 'Obter estatísticas do dia' })
  @ApiResponse({ status: 200, description: 'Estatísticas do dia retornadas com sucesso' })
  getTodayStats(@Headers('x-empresa-id') empresaId?: string) {
    return this.dashboardService.getTodayStats(empresaId);
  }
}



