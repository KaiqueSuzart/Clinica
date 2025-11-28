import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

@ApiTags('annotations')
@Controller('annotations')
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova anotação' })
  @ApiResponse({ status: 201, description: 'Anotação criada com sucesso' })
  create(@Body() createAnnotationDto: CreateAnnotationDto, @EmpresaId() empresaId: string) {
    console.log('🚀 [Controller.create] RAW Body recebido:', createAnnotationDto);
    console.log('🔍 [Controller.create] Tipos:', {
      patient_id: typeof createAnnotationDto.patient_id,
      patient_id_value: createAnnotationDto.patient_id,
      content: typeof createAnnotationDto.content,
      category: typeof createAnnotationDto.category,
      empresaId,
      empresaIdTipo: typeof empresaId
    });
    return this.annotationsService.create(createAnnotationDto, empresaId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar anotações' })
  @ApiResponse({ status: 200, description: 'Lista de anotações' })
  findAll(@EmpresaId() empresaId: string, @Query('patient_id') patientId?: string) {
    const patientIdNumber = patientId ? parseInt(patientId, 10) : undefined;
    return this.annotationsService.findAll(empresaId, patientIdNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar anotação por ID' })
  @ApiResponse({ status: 200, description: 'Anotação encontrada' })
  findOne(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.annotationsService.findOne(id, empresaId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar anotação' })
  @ApiResponse({ status: 200, description: 'Anotação atualizada com sucesso' })
  update(@Param('id') id: string, @Body() updateAnnotationDto: UpdateAnnotationDto, @EmpresaId() empresaId: string) {
    console.log('🔄 UPDATE annotation ID:', id);
    console.log('🚀 UPDATE Body recebido:', updateAnnotationDto);
    console.log('🔍 UPDATE Tipos:', {
      patient_id: typeof updateAnnotationDto.patient_id,
      patient_id_value: updateAnnotationDto.patient_id,
      content: typeof updateAnnotationDto.content,
      category: typeof updateAnnotationDto.category
    });
    return this.annotationsService.update(id, updateAnnotationDto, empresaId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover anotação' })
  @ApiResponse({ status: 200, description: 'Anotação removida com sucesso' })
  remove(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.annotationsService.remove(id, empresaId);
  }
}
