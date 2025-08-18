import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientDto } from './dto/search-patient.dto';

@ApiTags('Patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os pacientes' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes retornada' })
  findAll() {
    return this.patientsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar pacientes com filtros' })
  @ApiResponse({ status: 200, description: 'Pacientes encontrados' })
  searchPatients(@Query() searchDto: SearchPatientDto) {
    return this.patientsService.searchPatients(searchDto);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Buscar pacientes por status' })
  @ApiResponse({ status: 200, description: 'Pacientes por status' })
  getPatientsByStatus(@Param('status') status: string) {
    return this.patientsService.getPatientsByStatus(status);
  }

  @Get('active')
  @ApiOperation({ summary: 'Listar pacientes ativos' })
  @ApiResponse({ status: 200, description: 'Pacientes ativos' })
  getActivePatients() {
    return this.patientsService.getActivePatients();
  }

  @Get('upcoming-returns')
  @ApiOperation({ summary: 'Pacientes com retornos próximos' })
  @ApiResponse({ status: 200, description: 'Pacientes com retornos' })
  getPatientsWithUpcomingReturns() {
    return this.patientsService.getPatientsWithUpcomingReturns();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo paciente' })
  @ApiResponse({ status: 201, description: 'Paciente criado com sucesso' })
  create(@Body() createPatientDto: CreatePatientDto) {
    console.log('Controller recebeu dados:', createPatientDto);
    return this.patientsService.create(createPatientDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar paciente' })
  @ApiResponse({ status: 200, description: 'Paciente atualizado com sucesso' })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover paciente' })
  @ApiResponse({ status: 200, description: 'Paciente removido com sucesso' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
