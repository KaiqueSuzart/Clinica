import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';

@Controller('budgets')
export class BudgetsControllerSimple {
  @Get()
  findAll() {
    console.log('BudgetsControllerSimple.findAll() chamado');
    return [];
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { id, message: 'Orçamento encontrado' };
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return [];
  }

  @Post()
  create(@Body() createBudgetDto: any) {
    return { message: 'Orçamento criado', data: createBudgetDto };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBudgetDto: any) {
    return { message: 'Orçamento atualizado', id, data: updateBudgetDto };
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Query('status') status: string) {
    return { message: 'Status atualizado', id, status };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { message: 'Orçamento deletado', id };
  }
}
