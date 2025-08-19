import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnamneseService } from './anamnese.service';
import { CreateAnamneseDto } from './dto/create-anamnese.dto';
import { UpdateAnamneseDto } from './dto/update-anamnese.dto';

@ApiTags('Anamnese')
@Controller('anamnese')
export class AnamneseController {
  constructor(private readonly anamneseService: AnamneseService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova anamnese' })
  @ApiResponse({ status: 201, description: 'Anamnese criada com sucesso' })
  create(@Body() createAnamneseDto: CreateAnamneseDto) {
    return this.anamneseService.create(createAnamneseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as anamneses' })
  @ApiResponse({ status: 200, description: 'Lista de anamneses retornada' })
  findAll() {
    return this.anamneseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar anamnese por ID' })
  @ApiResponse({ status: 200, description: 'Anamnese encontrada' })
  @ApiResponse({ status: 404, description: 'Anamnese não encontrada' })
  findOne(@Param('id') id: string) {
    return this.anamneseService.findOne(id);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Buscar anamneses por paciente' })
  @ApiResponse({ status: 200, description: 'Anamneses do paciente retornadas' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.anamneseService.findByPatient(parseInt(patientId));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar anamnese' })
  @ApiResponse({ status: 200, description: 'Anamnese atualizada com sucesso' })
  update(@Param('id') id: string, @Body() updateAnamneseDto: UpdateAnamneseDto) {
    return this.anamneseService.update(id, updateAnamneseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover anamnese' })
  @ApiResponse({ status: 200, description: 'Anamnese removida com sucesso' })
  remove(@Param('id') id: string) {
    return this.anamneseService.remove(id);
  }
}
