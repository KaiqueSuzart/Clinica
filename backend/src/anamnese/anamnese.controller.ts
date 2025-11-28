import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnamneseService } from './anamnese.service';
import { CreateAnamneseDto } from './dto/create-anamnese.dto';
import { UpdateAnamneseDto } from './dto/update-anamnese.dto';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

@ApiTags('Anamnese')
@Controller('anamnese')
export class AnamneseController {
  constructor(private readonly anamneseService: AnamneseService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova anamnese' })
  @ApiResponse({ status: 201, description: 'Anamnese criada com sucesso' })
  create(@Body() createAnamneseDto: CreateAnamneseDto, @EmpresaId() empresaId: string) {
    console.log('🎯 [Controller.create] Recebido:', { createAnamneseDto, empresaId });
    return this.anamneseService.create(createAnamneseDto, empresaId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as anamneses' })
  @ApiResponse({ status: 200, description: 'Lista de anamneses retornada' })
  findAll(@EmpresaId() empresaId: string) {
    return this.anamneseService.findAll(empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar anamnese por ID' })
  @ApiResponse({ status: 200, description: 'Anamnese encontrada' })
  @ApiResponse({ status: 404, description: 'Anamnese não encontrada' })
  findOne(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.anamneseService.findOne(id, empresaId);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Buscar anamneses por paciente' })
  @ApiResponse({ status: 200, description: 'Anamneses do paciente retornadas' })
  findByPatient(@Param('patientId') patientId: string, @EmpresaId() empresaId: string) {
    console.log('🎯 [Controller.findByPatient] Recebido:', {
      patientId,
      empresaId,
      tipos: {
        patientId: typeof patientId,
        empresaId: typeof empresaId
      }
    });
    return this.anamneseService.findByPatient(parseInt(patientId), empresaId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar anamnese' })
  @ApiResponse({ status: 200, description: 'Anamnese atualizada com sucesso' })
  update(@Param('id') id: string, @Body() updateAnamneseDto: UpdateAnamneseDto, @EmpresaId() empresaId: string) {
    return this.anamneseService.update(id, updateAnamneseDto, empresaId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover anamnese' })
  @ApiResponse({ status: 200, description: 'Anamnese removida com sucesso' })
  remove(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.anamneseService.remove(id, empresaId);
  }
}
