import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateFileDto, FileCategory } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
// import { v4 as uuidv4 } from 'uuid';
import { randomUUID } from 'crypto';
import * as path from 'path';

export interface PatientFile {
  id: string;
  patient_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  category: FileCategory;
  description?: string;
  uploaded_by?: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
  public_url?: string;
}

@Injectable()
export class FilesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async uploadFile(
    file: any,
    createFileDto: any,
    empresaId: string
  ): Promise<PatientFile> {
    const supabase = this.supabaseService.getClient();

    try {
      // Validar que o paciente pertence à empresa
      const { data: patient, error: patientError } = await supabase
        .from('clientelA')
        .select('id, empresa')
        .eq('id', createFileDto.patient_id)
        .eq('empresa', empresaId)
        .single();

      if (patientError || !patient) {
        throw new NotFoundException('Paciente não encontrado ou não pertence à empresa');
      }

      // Validar tipo de arquivo
      this.validateFile(file, createFileDto.category);

      // Gerar nome único para o arquivo
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${randomUUID()}${fileExtension}`;
      const filePath = `${createFileDto.patient_id}/${createFileDto.category}/${uniqueFilename}`;

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-files')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        throw new BadRequestException(`Erro no upload: ${uploadError.message}`);
      }

      // Salvar metadados na tabela
      const { data: fileRecord, error: dbError } = await supabase
        .from('patient_files')
        .insert({
          patient_id: createFileDto.patient_id,
          filename: uniqueFilename,
          original_filename: createFileDto.original_filename,
          file_path: filePath,
          file_type: fileExtension.substring(1),
          file_size: createFileDto.file_size,
          mime_type: createFileDto.mime_type,
          category: createFileDto.category,
          description: createFileDto.description,
          uploaded_by: createFileDto.uploaded_by
        })
        .select()
        .single();

      if (dbError) {
        // Limpar arquivo do storage se houve erro no banco
        await supabase.storage.from('patient-files').remove([filePath]);
        throw new BadRequestException(`Erro ao salvar metadados: ${dbError.message}`);
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('patient-files')
        .getPublicUrl(filePath);

      return {
        ...fileRecord,
        public_url: publicUrlData.publicUrl
      };
    } catch (error) {
      throw new BadRequestException(`Erro no upload do arquivo: ${error.message}`);
    }
  }

  async findAllByPatient(patientId: string, empresaId: string): Promise<PatientFile[]> {
    const supabase = this.supabaseService.getClient();

    // Validar que o paciente pertence à empresa
    const { data: patient, error: patientError } = await supabase
      .from('clientelA')
      .select('id, empresa')
      .eq('id', patientId)
      .eq('empresa', empresaId)
      .single();

    if (patientError || !patient) {
      throw new NotFoundException('Paciente não encontrado ou não pertence à empresa');
    }

    const { data, error } = await supabase
      .from('patient_files')
      .select('*')
      .eq('patient_id', patientId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Erro ao buscar arquivos: ${error.message}`);
    }

    // Adicionar URLs públicas
    return data.map(file => {
      const { data: publicUrlData } = supabase.storage
        .from('patient-files')
        .getPublicUrl(file.file_path);

      return {
        ...file,
        public_url: publicUrlData.publicUrl
      };
    });
  }

  async findOne(id: string, empresaId: string): Promise<PatientFile> {
    const supabase = this.supabaseService.getClient();

    // Buscar arquivo primeiro
    const { data: fileData, error: fileError } = await supabase
      .from('patient_files')
      .select('*')
      .eq('id', id)
      .single();

    if (fileError || !fileData) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Validar que o paciente pertence à empresa
    const { data: patient, error: patientError } = await supabase
      .from('clientelA')
      .select('id, empresa')
      .eq('id', fileData.patient_id)
      .eq('empresa', empresaId)
      .single();

    if (patientError || !patient) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const data = fileData;

    // Adicionar URL pública
    const { data: publicUrlData } = supabase.storage
      .from('patient-files')
      .getPublicUrl(data.file_path);

    return {
      ...data,
      public_url: publicUrlData.publicUrl
    };
  }

  async update(id: string, updateFileDto: UpdateFileDto, empresaId: string): Promise<PatientFile> {
    const supabase = this.supabaseService.getClient();

    // Primeiro buscar o arquivo
    const { data: fileData, error: findError } = await supabase
      .from('patient_files')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !fileData) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Validar que o paciente pertence à empresa
    const { data: patient, error: patientError } = await supabase
      .from('clientelA')
      .select('id, empresa')
      .eq('id', fileData.patient_id)
      .eq('empresa', empresaId)
      .single();

    if (patientError || !patient) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const { data, error } = await supabase
      .from('patient_files')
      .update(updateFileDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Arquivo não encontrado para atualização');
    }

    // Adicionar URL pública
    const { data: publicUrlData } = supabase.storage
      .from('patient-files')
      .getPublicUrl(data.file_path);

    return {
      ...data,
      public_url: publicUrlData.publicUrl
    };
  }

  async remove(id: string, empresaId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    // Buscar o arquivo primeiro
    const { data: fileData, error: findError } = await supabase
      .from('patient_files')
      .select('file_path, patient_id')
      .eq('id', id)
      .single();

    if (findError || !fileData) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Validar que o paciente pertence à empresa
    const { data: patient, error: patientError } = await supabase
      .from('clientelA')
      .select('id, empresa')
      .eq('id', fileData.patient_id)
      .eq('empresa', empresaId)
      .single();

    if (patientError || !patient) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Remover do storage
    const { error: storageError } = await supabase.storage
      .from('patient-files')
      .remove([fileData.file_path]);

    if (storageError) {
      throw new BadRequestException(`Erro ao remover arquivo do storage: ${storageError.message}`);
    }

    // Remover do banco
    const { error: dbError } = await supabase
      .from('patient_files')
      .delete()
      .eq('id', id);

    if (dbError) {
      throw new BadRequestException(`Erro ao remover metadados: ${dbError.message}`);
    }
  }

  async getFilesByCategory(patientId: string, category: FileCategory, empresaId: string): Promise<PatientFile[]> {
    const supabase = this.supabaseService.getClient();

    // Validar que o paciente pertence à empresa
    const { data: patient, error: patientError } = await supabase
      .from('clientelA')
      .select('id, empresa')
      .eq('id', patientId)
      .eq('empresa', empresaId)
      .single();

    if (patientError || !patient) {
      throw new NotFoundException('Paciente não encontrado ou não pertence à empresa');
    }

    const { data, error } = await supabase
      .from('patient_files')
      .select('*')
      .eq('patient_id', patientId)
      .eq('category', category)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Erro ao buscar arquivos por categoria: ${error.message}`);
    }

    // Adicionar URLs públicas
    return data.map(file => {
      const { data: publicUrlData } = supabase.storage
        .from('patient-files')
        .getPublicUrl(file.file_path);

      return {
        ...file,
        public_url: publicUrlData.publicUrl
      };
    });
  }

  async getPatientStats(patientId: string, empresaId: string) {
    const supabase = this.supabaseService.getClient();

    // Validar que o paciente pertence à empresa
    const { data: patient, error: patientError } = await supabase
      .from('clientelA')
      .select('id, empresa')
      .eq('id', patientId)
      .eq('empresa', empresaId)
      .single();

    if (patientError || !patient) {
      throw new NotFoundException('Paciente não encontrado ou não pertence à empresa');
    }

    const { data, error } = await supabase
      .from('patient_files')
      .select('category, file_size')
      .eq('patient_id', patientId);

    if (error) {
      throw new BadRequestException(`Erro ao buscar estatísticas: ${error.message}`);
    }

    const stats = {
      total_files: data.length,
      total_size: data.reduce((sum, file) => sum + file.file_size, 0),
      images: data.filter(file => file.category === 'image').length,
      documents: data.filter(file => file.category === 'document').length,
      xrays: data.filter(file => file.category === 'xray').length,
      reports: data.filter(file => file.category === 'report').length
    };

    return stats;
  }

  private validateFile(file: any, category: FileCategory): void {
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Máximo permitido: 10MB');
    }

    const allowedMimeTypes = {
      [FileCategory.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      [FileCategory.DOCUMENT]: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ],
      [FileCategory.XRAY]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
      [FileCategory.REPORT]: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
    };

    if (!allowedMimeTypes[category].includes(file.mimetype)) {
      throw new BadRequestException(`Tipo de arquivo não permitido para a categoria ${category}`);
    }
  }
}
