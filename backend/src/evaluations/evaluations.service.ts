import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class EvaluationsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(empresaId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('evaluations')
      .select(`
        *,
        patients:patient_id!evaluations_patient_id_fkey(id, empresa),
        appointments(date, time)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Filtrar por empresa via patient
    const filtered = data?.filter(evaluation => evaluation.patients?.empresa === empresaId) || [];
    return filtered;
  }

  async findOne(id: string, empresaId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('evaluations')
      .select(`
        *,
        patients:patient_id!evaluations_patient_id_fkey(id, empresa),
        appointments(date, time)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    // Validar que o paciente pertence à empresa
    if (data.patients?.empresa !== empresaId) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    return data;
  }

  async create(evaluationData: any, empresaId: string) {
    // Validar que o paciente pertence à empresa
    const { data: patient, error: patientError } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .select('id, empresa')
      .eq('id', evaluationData.patient_id)
      .eq('empresa', empresaId)
      .single();

    if (patientError || !patient) {
      throw new NotFoundException('Paciente não encontrado ou não pertence à empresa');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('evaluations')
      .insert(evaluationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, evaluationData: any, empresaId: string) {
    // Primeiro validar que a avaliação pertence à empresa
    const { data: existing, error: findError } = await this.supabaseService
      .getClient()
      .from('evaluations')
      .select(`
        *,
        patients:patient_id!evaluations_patient_id_fkey(id, empresa)
      `)
      .eq('id', id)
      .single();

    if (findError || !existing) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (existing.patients?.empresa !== empresaId) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    // Se estiver atualizando patient_id, validar novamente
    if (evaluationData.patient_id && evaluationData.patient_id !== existing.patient_id) {
      const { data: patient, error: patientError } = await this.supabaseService
        .getClient()
        .from('clientelA')
        .select('id, empresa')
        .eq('id', evaluationData.patient_id)
        .eq('empresa', empresaId)
        .single();

      if (patientError || !patient) {
        throw new NotFoundException('Paciente não encontrado ou não pertence à empresa');
      }
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('evaluations')
      .update(evaluationData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string, empresaId: string) {
    // Validar que a avaliação pertence à empresa antes de deletar
    const { data: existing, error: findError } = await this.supabaseService
      .getClient()
      .from('evaluations')
      .select(`
        *,
        patients:patient_id!evaluations_patient_id_fkey(id, empresa)
      `)
      .eq('id', id)
      .single();

    if (findError || !existing) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (existing.patients?.empresa !== empresaId) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('evaluations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Avaliação removida com sucesso' };
  }

  async findByPatient(patientId: string, empresaId: string) {
    // Validar que o paciente pertence à empresa
    const { data: patient, error: patientError } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .select('id, empresa')
      .eq('id', patientId)
      .eq('empresa', empresaId)
      .single();

    if (patientError || !patient) {
      throw new NotFoundException('Paciente não encontrado ou não pertence à empresa');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('evaluations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}


















