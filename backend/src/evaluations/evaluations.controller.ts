import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

class CreateEvaluationDto {
  patient_id: string;
  appointment_id: string;
  diagnosis: string;
  treatment_plan: string;
  notes?: string;
  next_appointment?: string;
}

class UpdateEvaluationDto {
  patient_id?: string;
  appointment_id?: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  next_appointment?: string;
}

@ApiTags('Evaluations')
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as avaliações' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações retornada' })
  findAll(@EmpresaId() empresaId: string) {
    return this.evaluationsService.findAll(empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar avaliação por ID' })
  @ApiResponse({ status: 200, description: 'Avaliação encontrada' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  findOne(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.evaluationsService.findOne(id, empresaId);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Buscar avaliações por paciente' })
  @ApiResponse({ status: 200, description: 'Avaliações do paciente retornadas' })
  findByPatient(@Param('patientId') patientId: string, @EmpresaId() empresaId: string) {
    return this.evaluationsService.findByPatient(patientId, empresaId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova avaliação' })
  @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso' })
  create(@Body() createEvaluationDto: CreateEvaluationDto, @EmpresaId() empresaId: string) {
    return this.evaluationsService.create(createEvaluationDto, empresaId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação atualizada com sucesso' })
  update(@Param('id') id: string, @Body() updateEvaluationDto: UpdateEvaluationDto, @EmpresaId() empresaId: string) {
    return this.evaluationsService.update(id, updateEvaluationDto, empresaId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação removida com sucesso' })
  remove(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.evaluationsService.remove(id, empresaId);
  }
}


















