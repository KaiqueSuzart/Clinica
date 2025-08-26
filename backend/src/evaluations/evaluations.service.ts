import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class EvaluationsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('evaluations')
      .select(`
        *,
        patients(name, email),
        appointments(date, time)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('evaluations')
      .select(`
        *,
        patients(name, email),
        appointments(date, time)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    return data;
  }

  async create(evaluationData: any) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('evaluations')
      .insert(evaluationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, evaluationData: any) {
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

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('evaluations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Avaliação removida com sucesso' };
  }

  async findByPatient(patientId: string) {
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






