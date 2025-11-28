import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

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
    @EmpresaId() empresaId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.reportsService.getProceduresReport(empresaId, startDate, endDate);
  }

  @Get('financial')
  @ApiOperation({ summary: 'Relatório financeiro' })
  @ApiResponse({ status: 200, description: 'Relatório financeiro retornado' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getFinancialReport(
    @EmpresaId() empresaId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.reportsService.getFinancialReport(empresaId, startDate, endDate);
  }

  @Get('productivity')
  @ApiOperation({ summary: 'Relatório de produtividade' })
  @ApiResponse({ status: 200, description: 'Relatório de produtividade retornado' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getProductivityReport(
    @EmpresaId() empresaId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.reportsService.getProductivityReport(empresaId, startDate, endDate);
  }

  @Get('patients')
  @ApiOperation({ summary: 'Relatório de pacientes' })
  @ApiResponse({ status: 200, description: 'Relatório de pacientes retornado' })
  getPatientsReport(@EmpresaId() empresaId: string) {
    return this.reportsService.getPatientsReport(empresaId);
  }
}

