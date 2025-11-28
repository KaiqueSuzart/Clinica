import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

class CreateAppointmentDto {
  patient_id: string;
  date: string;
  time: string;
  duration?: number;
  procedure: string;
  professional?: string;
  type?: string;
  notes?: string;
  status?: string;
}

class UpdateAppointmentDto {
  patient_id?: string;
  date?: string;
  time?: string;
  duration?: number;
  procedure?: string;
  professional?: string;
  type?: string;
  notes?: string;
  status?: string;
}

class CheckAvailabilityDto {
  date: string;
  time: string;
  professional?: string;
}

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('today')
  @ApiOperation({ summary: 'Buscar consultas do dia' })
  @ApiResponse({ status: 200, description: 'Consultas do dia retornadas' })
  findTodayAppointments(@EmpresaId() empresaId: string) {
    return this.appointmentsService.findTodayAppointments(empresaId);
  }

  @Get('completed')
  @ApiOperation({ summary: 'Buscar histórico de consultas realizadas' })
  @ApiResponse({ status: 200, description: 'Histórico de consultas retornado' })
  findCompletedAppointments(@EmpresaId() empresaId: string) {
    return this.appointmentsService.findCompletedAppointments(empresaId);
  }

  @Get('week')
  @ApiOperation({ summary: 'Buscar consultas da semana atual' })
  @ApiResponse({ status: 200, description: 'Consultas da semana retornadas' })
  findWeekAppointments(@EmpresaId() empresaId: string) {
    return this.appointmentsService.findWeekAppointments(empresaId);
  }

  @Get('month')
  @ApiOperation({ summary: 'Buscar consultas do mês atual' })
  @ApiResponse({ status: 200, description: 'Consultas do mês retornadas' })
  findMonthAppointments(@EmpresaId() empresaId: string) {
    return this.appointmentsService.findMonthAppointments(empresaId);
  }

  @Get('period')
  @ApiOperation({ summary: 'Buscar consultas por período personalizado' })
  @ApiResponse({ status: 200, description: 'Consultas do período retornadas' })
  findAppointmentsByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @EmpresaId() empresaId: string
  ) {
    return this.appointmentsService.findAppointmentsByPeriod(startDate, endDate, empresaId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as consultas' })
  @ApiResponse({ status: 200, description: 'Lista de consultas retornada' })
  findAll(@EmpresaId() empresaId: string) {
    return this.appointmentsService.findAll(empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar consulta por ID' })
  @ApiResponse({ status: 200, description: 'Consulta encontrada' })
  @ApiResponse({ status: 404, description: 'Consulta não encontrada' })
  findOne(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.appointmentsService.findOne(id, empresaId);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Buscar consultas por paciente' })
  @ApiResponse({ status: 200, description: 'Consultas do paciente retornadas' })
  findByPatient(@Param('patientId') patientId: string, @EmpresaId() empresaId: string) {
    return this.appointmentsService.findByPatient(patientId, empresaId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova consulta' })
  @ApiResponse({ status: 201, description: 'Consulta criada com sucesso' })
  create(@Body() createAppointmentDto: CreateAppointmentDto, @EmpresaId() empresaId: string) {
    return this.appointmentsService.create(createAppointmentDto, empresaId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar consulta' })
  @ApiResponse({ status: 200, description: 'Consulta atualizada com sucesso' })
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto, @EmpresaId() empresaId: string) {
    return this.appointmentsService.update(id, updateAppointmentDto, empresaId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover consulta' })
  @ApiResponse({ status: 200, description: 'Consulta removida com sucesso' })
  remove(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.appointmentsService.remove(id, empresaId);
  }

  @Post('check-availability')
  @ApiOperation({ summary: 'Verificar disponibilidade de horário' })
  @ApiResponse({ status: 200, description: 'Disponibilidade verificada' })
  async checkAvailability(@Body() checkAvailabilityDto: CheckAvailabilityDto, @EmpresaId() empresaId: string) {
    const available = await this.appointmentsService.checkAvailability(
      checkAvailabilityDto.date,
      checkAvailabilityDto.time,
      empresaId,
      checkAvailabilityDto.professional
    );
    return { available };
  }

  @Get('available-times')
  @ApiOperation({ summary: 'Buscar horários disponíveis' })
  @ApiResponse({ status: 200, description: 'Horários disponíveis retornados' })
  getAvailableTimes(
    @Query('date') date: string,
    @EmpresaId() empresaId: string,
    @Query('professional') professional?: string
  ) {
    return this.appointmentsService.getAvailableTimes(date, empresaId, professional);
  }

  @Get('next-hour')
  @ApiOperation({ summary: 'Consultas na próxima hora para confirmação (N8N)' })
  @ApiResponse({ status: 200, description: 'Consultas da próxima hora retornadas' })
  getNextHourAppointments(@EmpresaId() empresaId: string) {
    return this.appointmentsService.findNextHourAppointments(empresaId);
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirmar consulta via WhatsApp (N8N)' })
  @ApiResponse({ status: 200, description: 'Consulta confirmada' })
  confirmAppointment(@Param('id') id: string, @Body() data: { confirmed: boolean }, @EmpresaId() empresaId: string) {
    const status = data.confirmed ? 'confirmado' : 'cancelado';
    return this.appointmentsService.update(id, { status }, empresaId);
  }

  @Get('patient/:patientId/procedures')
  @ApiOperation({ summary: 'Buscar histórico de procedimentos do paciente' })
  @ApiResponse({ status: 200, description: 'Histórico de procedimentos retornado' })
  getPatientProcedures(@Param('patientId') patientId: string, @EmpresaId() empresaId: string) {
    return this.appointmentsService.getPatientProcedures(patientId, empresaId);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Marcar consulta como realizada' })
  @ApiResponse({ status: 200, description: 'Consulta marcada como realizada' })
  markAsCompleted(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.appointmentsService.markAsCompleted(id, empresaId);
  }
}










