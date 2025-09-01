import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';

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

  @Get()
  @ApiOperation({ summary: 'Listar todas as consultas' })
  @ApiResponse({ status: 200, description: 'Lista de consultas retornada' })
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar consulta por ID' })
  @ApiResponse({ status: 200, description: 'Consulta encontrada' })
  @ApiResponse({ status: 404, description: 'Consulta não encontrada' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Buscar consultas por paciente' })
  @ApiResponse({ status: 200, description: 'Consultas do paciente retornadas' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.appointmentsService.findByPatient(patientId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova consulta' })
  @ApiResponse({ status: 201, description: 'Consulta criada com sucesso' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar consulta' })
  @ApiResponse({ status: 200, description: 'Consulta atualizada com sucesso' })
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover consulta' })
  @ApiResponse({ status: 200, description: 'Consulta removida com sucesso' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Post('check-availability')
  @ApiOperation({ summary: 'Verificar disponibilidade de horário' })
  @ApiResponse({ status: 200, description: 'Disponibilidade verificada' })
  async checkAvailability(@Body() checkAvailabilityDto: CheckAvailabilityDto) {
    const available = await this.appointmentsService.checkAvailability(
      checkAvailabilityDto.date,
      checkAvailabilityDto.time,
      checkAvailabilityDto.professional
    );
    return { available };
  }

  @Get('available-times')
  @ApiOperation({ summary: 'Buscar horários disponíveis' })
  @ApiResponse({ status: 200, description: 'Horários disponíveis retornados' })
  getAvailableTimes(
    @Query('date') date: string,
    @Query('professional') professional?: string
  ) {
    return this.appointmentsService.getAvailableTimes(date, professional);
  }

  @Get('next-hour')
  @ApiOperation({ summary: 'Consultas na próxima hora para confirmação (N8N)' })
  @ApiResponse({ status: 200, description: 'Consultas da próxima hora retornadas' })
  getNextHourAppointments() {
    return this.appointmentsService.findNextHourAppointments();
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirmar consulta via WhatsApp (N8N)' })
  @ApiResponse({ status: 200, description: 'Consulta confirmada' })
  confirmAppointment(@Param('id') id: string, @Body() data: { confirmed: boolean }) {
    const status = data.confirmed ? 'confirmado' : 'cancelado';
    return this.appointmentsService.update(id, { status });
  }

  @Get('patient/:patientId/procedures')
  @ApiOperation({ summary: 'Buscar histórico de procedimentos do paciente' })
  @ApiResponse({ status: 200, description: 'Histórico de procedimentos retornado' })
  getPatientProcedures(@Param('patientId') patientId: string) {
    return this.appointmentsService.getPatientProcedures(patientId);
  }
}










