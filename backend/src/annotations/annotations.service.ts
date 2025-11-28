import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';

@Injectable()
export class AnnotationsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createAnnotationDto: CreateAnnotationDto, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    // Verificar se o paciente pertence à empresa
    const patientId = Number(createAnnotationDto.patient_id);
    console.log('🔍 [AnnotationsService.create] Verificando paciente:', { patientId, empresaId });
    
    const { data: paciente, error: pacienteError } = await this.supabaseService
      .getAdminClient()
      .from('clientelA')
      .select('id, empresa')
      .eq('id', patientId)
      .maybeSingle();

    if (pacienteError) {
      console.error('❌ [AnnotationsService.create] Erro ao buscar paciente:', pacienteError);
      throw new NotFoundException('Erro ao buscar paciente');
    }

    if (!paciente) {
      console.error('❌ [AnnotationsService.create] Paciente não encontrado:', patientId);
      throw new NotFoundException('Paciente não encontrado');
    }

    console.log('🔍 [AnnotationsService.create] Paciente encontrado:', {
      pacienteId: paciente.id,
      pacienteEmpresa: paciente.empresa,
      empresaId,
      tipos: {
        pacienteEmpresa: typeof paciente.empresa,
        empresaId: typeof empresaId
      }
    });

    // Comparação robusta de empresa_id
    const pacienteEmpresaStr = paciente.empresa?.toString();
    const empresaIdStr = empresaId?.toString();
    const pacienteEmpresaNum = Number(paciente.empresa);
    const empresaIdNum = Number(empresaId);

    let isSameEmpresa = false;
    if (pacienteEmpresaStr === empresaIdStr) {
      isSameEmpresa = true;
    } else if (pacienteEmpresaNum === empresaIdNum && !isNaN(pacienteEmpresaNum) && !isNaN(empresaIdNum)) {
      isSameEmpresa = true;
    } else if (paciente.empresa === empresaId) {
      isSameEmpresa = true;
    }

    if (!isSameEmpresa) {
      console.error('❌ [AnnotationsService.create] Paciente não pertence à empresa:', {
        pacienteEmpresa: pacienteEmpresaStr,
        empresaId: empresaIdStr
      });
      throw new BadRequestException('Paciente não pertence à empresa');
    }

    console.log('✅ [AnnotationsService.create] Validação passou, criando anotação');

    // Garantir que patient_id seja number
    const processedDto = {
      ...createAnnotationDto,
      patient_id: patientId
    };

    console.log('📝 Service create - DTO processado:', processedDto);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('annotations')
      .insert(processedDto)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro do Supabase:', error);
      throw error;
    }
    
    console.log('✅ Annotation criada:', data);
    return data;
  }

  async findAll(empresaId: string, patientId?: number) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      // Buscar IDs dos pacientes da empresa primeiro usando admin client
      const { data: pacientes, error: pacientesError } = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('id')
        .eq('empresa', empresaId);

      if (pacientesError) {
        console.error('❌ Erro ao buscar pacientes:', pacientesError);
        return [];
      }

      const pacienteIds = pacientes?.map(p => p.id) || [];
      
      if (pacienteIds.length === 0) {
        return [];
      }

      // Se patientId foi fornecido, filtrar apenas esse paciente
      const finalPatientIds = patientId 
        ? pacienteIds.filter(id => id === patientId)
        : pacienteIds;

      if (finalPatientIds.length === 0) {
        return [];
      }

      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('annotations')
        .select('*')
        .in('patient_id', finalPatientIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar annotations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro completo ao buscar annotations:', error);
      return [];
    }
  }

  async findOne(id: string, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    // Buscar anotação e verificar se o paciente pertence à empresa
    const { data, error } = await this.supabaseService
      .getClient()
      .from('annotations')
      .select(`
        *,
        clientelA!annotations_patient_id_fkey (
          empresa
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Anotação não encontrada');
    }

    // Verificar se o paciente pertence à empresa
    if (data.clientelA?.empresa !== empresaId) {
      throw new NotFoundException('Anotação não encontrada');
    }

    // Remover dados do cliente do retorno
    const { clientelA, ...annotationData } = data;
    return annotationData;
  }

  async update(id: string, updateAnnotationDto: UpdateAnnotationDto, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    // Verificar se a anotação pertence à empresa antes de atualizar
    const { data: annotation, error: annotationError } = await this.supabaseService
      .getClient()
      .from('annotations')
      .select(`
        *,
        clientelA!annotations_patient_id_fkey (
          empresa
        )
      `)
      .eq('id', id)
      .single();

    if (annotationError || !annotation) {
      throw new NotFoundException('Anotação não encontrada');
    }

    if (annotation.clientelA?.empresa !== empresaId) {
      throw new NotFoundException('Anotação não encontrada');
    }

    // Garantir que patient_id seja number se fornecido
    const processedDto = {
      ...updateAnnotationDto,
      ...(updateAnnotationDto.patient_id ? { patient_id: Number(updateAnnotationDto.patient_id) } : {})
    };

    console.log('📝 Service update - DTO processado:', processedDto);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('annotations')
      .update(processedDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro do Supabase no update:', error);
      throw error;
    }
    
    console.log('✅ Annotation atualizada:', data);
    return data;
  }

  async remove(id: string, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    // Verificar se a anotação pertence à empresa antes de deletar
    const { data: annotation, error: annotationError } = await this.supabaseService
      .getClient()
      .from('annotations')
      .select(`
        *,
        clientelA!annotations_patient_id_fkey (
          empresa
        )
      `)
      .eq('id', id)
      .single();

    if (annotationError || !annotation) {
      throw new NotFoundException('Anotação não encontrada');
    }

    if (annotation.clientelA?.empresa !== empresaId) {
      throw new NotFoundException('Anotação não encontrada');
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('annotations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Anotação removida com sucesso' };
  }
}








