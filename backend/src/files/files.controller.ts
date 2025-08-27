import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { CreateFileDto, FileCategory } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Body() body: any
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    console.log('Dados recebidos:', body);
    console.log('Arquivo recebido:', file);

    // Extrair dados do FormData
    const fileData = {
      patient_id: body.patient_id,
      category: body.category,
      description: body.description || '',
      original_filename: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size
    };

    // Validar dados básicos
    if (!fileData.patient_id) {
      throw new BadRequestException('patient_id é obrigatório');
    }
    if (!fileData.category) {
      throw new BadRequestException('category é obrigatório');
    }

    return await this.filesService.uploadFile(file, fileData);
  }

  @Get('patient/:patientId')
  async findAllByPatient(@Param('patientId') patientId: string) {
    return await this.filesService.findAllByPatient(patientId);
  }

  @Get('patient/:patientId/category/:category')
  async getFilesByCategory(
    @Param('patientId') patientId: string,
    @Param('category') category: FileCategory
  ) {
    return await this.filesService.getFilesByCategory(patientId, category);
  }

  @Get('patient/:patientId/stats')
  async getPatientStats(@Param('patientId') patientId: string) {
    return await this.filesService.getPatientStats(patientId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.filesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return await this.filesService.update(id, updateFileDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.filesService.remove(id);
    return { message: 'Arquivo removido com sucesso' };
  }
}
