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
    console.log('🚀 AnnotationsController.create chamado com:', createAnnotationDto);
    console.log('📋 Tipo dos dados:', {
      patient_id: typeof createAnnotationDto.patient_id,
      content: typeof createAnnotationDto.content,
      category: typeof createAnnotationDto.category
    });
    console.log('🔍 Validação dos dados:', {
      patient_id_valid: !isNaN(createAnnotationDto.patient_id),
      content_valid: typeof createAnnotationDto.content === 'string' && createAnnotationDto.content.length > 0,
      category_valid: typeof createAnnotationDto.category === 'string' && createAnnotationDto.category.length > 0
    });
    
    try {
      const result = this.annotationsService.create(createAnnotationDto);
      console.log('✅ Anotação criada com sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar anotação:', error);
      throw error;
    }
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
    return this.annotationsService.update(id, updateAnnotationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover anotação' })
  @ApiResponse({ status: 200, description: 'Anotação removida com sucesso' })
  remove(@Param('id') id: string) {
    return this.annotationsService.remove(id);
  }
}
