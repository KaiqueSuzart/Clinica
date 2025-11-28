import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientDto } from './dto/search-patient.dto';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

@ApiTags('Patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os pacientes' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes retornada' })
  findAll(@EmpresaId() empresaId: string) {
    if (!empresaId) {
      throw new Error('Empresa ID não fornecido');
    }
    return this.patientsService.findAll(empresaId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar pacientes com filtros' })
  @ApiResponse({ status: 200, description: 'Pacientes encontrados' })
  searchPatients(@Query() searchDto: SearchPatientDto, @EmpresaId() empresaId: string) {
    return this.patientsService.searchPatients(searchDto, empresaId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Buscar pacientes por status' })
  @ApiResponse({ status: 200, description: 'Pacientes por status' })
  getPatientsByStatus(@Param('status') status: string, @EmpresaId() empresaId: string) {
    return this.patientsService.getPatientsByStatus(status, empresaId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Listar pacientes ativos' })
  @ApiResponse({ status: 200, description: 'Pacientes ativos' })
  getActivePatients(@EmpresaId() empresaId: string) {
    return this.patientsService.getActivePatients(empresaId);
  }

  @Get('upcoming-returns')
  @ApiOperation({ summary: 'Pacientes com retornos próximos' })
  @ApiResponse({ status: 200, description: 'Pacientes com retornos' })
  getPatientsWithUpcomingReturns(@EmpresaId() empresaId: string) {
    return this.patientsService.getPatientsWithUpcomingReturns(empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  findOne(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.patientsService.findOne(id, empresaId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo paciente' })
  @ApiResponse({ status: 201, description: 'Paciente criado com sucesso' })
  create(@Body() createPatientDto: CreatePatientDto, @EmpresaId() empresaId: string) {
    console.log('Controller recebeu dados:', createPatientDto);
    return this.patientsService.create(createPatientDto, empresaId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar paciente' })
  @ApiResponse({ status: 200, description: 'Paciente atualizado com sucesso' })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto, @EmpresaId() empresaId: string) {
    return this.patientsService.update(id, updatePatientDto, empresaId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover paciente' })
  @ApiResponse({ status: 200, description: 'Paciente removido com sucesso' })
  remove(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.patientsService.remove(id, empresaId);
  }
}
