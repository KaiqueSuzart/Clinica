import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('procedures')
  @ApiOperation({ summary: 'Relatório de procedimentos' })
  @ApiResponse({ status: 200, description: 'Relatório de procedimentos retornado' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getProceduresReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.reportsService.getProceduresReport(undefined, startDate, endDate);
  }

  @Get('financial')
  @ApiOperation({ summary: 'Relatório financeiro' })
  @ApiResponse({ status: 200, description: 'Relatório financeiro retornado' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getFinancialReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.reportsService.getFinancialReport(undefined, startDate, endDate);
  }

  @Get('productivity')
  @ApiOperation({ summary: 'Relatório de produtividade' })
  @ApiResponse({ status: 200, description: 'Relatório de produtividade retornado' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getProductivityReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.reportsService.getProductivityReport(undefined, startDate, endDate);
  }

  @Get('patients')
  @ApiOperation({ summary: 'Relatório de pacientes' })
  @ApiResponse({ status: 200, description: 'Relatório de pacientes retornado' })
  getPatientsReport() {
    return this.reportsService.getPatientsReport();
  }
}

