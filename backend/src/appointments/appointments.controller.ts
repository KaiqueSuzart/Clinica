import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';

class CreateAppointmentDto {
  patient_id: string;
  date: string;
  time: string;
  type: string;
  notes?: string;
  status: string;
}

class UpdateAppointmentDto {
  patient_id?: string;
  date?: string;
  time?: string;
  type?: string;
  notes?: string;
  status?: string;
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
}









