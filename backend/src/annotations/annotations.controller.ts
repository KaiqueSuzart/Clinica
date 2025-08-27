import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('annotations')
@Controller('annotations')
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova anotação' })
  @ApiResponse({ status: 201, description: 'Anotação criada com sucesso' })
  create(@Body() createAnnotationDto: CreateAnnotationDto) {
    console.log('🚀 RAW Body recebido:', createAnnotationDto);
    console.log('🔍 Tipos:', {
      patient_id: typeof createAnnotationDto.patient_id,
      patient_id_value: createAnnotationDto.patient_id,
      content: typeof createAnnotationDto.content,
      category: typeof createAnnotationDto.category
    });
    return this.annotationsService.create(createAnnotationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar anotações' })
  @ApiResponse({ status: 200, description: 'Lista de anotações' })
  findAll(@Query('patient_id') patientId?: string) {
    const patientIdNumber = patientId ? parseInt(patientId, 10) : undefined;
    return this.annotationsService.findAll(patientIdNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar anotação por ID' })
  @ApiResponse({ status: 200, description: 'Anotação encontrada' })
  findOne(@Param('id') id: string) {
    return this.annotationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar anotação' })
  @ApiResponse({ status: 200, description: 'Anotação atualizada com sucesso' })
  update(@Param('id') id: string, @Body() updateAnnotationDto: UpdateAnnotationDto) {
    console.log('🔄 UPDATE annotation ID:', id);
    console.log('🚀 UPDATE Body recebido:', updateAnnotationDto);
    console.log('🔍 UPDATE Tipos:', {
      patient_id: typeof updateAnnotationDto.patient_id,
      patient_id_value: updateAnnotationDto.patient_id,
      content: typeof updateAnnotationDto.content,
      category: typeof updateAnnotationDto.category
    });
    return this.annotationsService.update(id, updateAnnotationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover anotação' })
  @ApiResponse({ status: 200, description: 'Anotação removida com sucesso' })
  remove(@Param('id') id: string) {
    return this.annotationsService.remove(id);
  }
}
