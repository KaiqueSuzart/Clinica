import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AppointmentsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('appointments')
      .select(`
        *,
        patients(name, email, phone),
        evaluations(*)
      `)
      .order('date');

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('appointments')
      .select(`
        *,
        patients(name, email, phone),
        evaluations(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Consulta não encontrada');
    }

    return data;
  }

  async create(appointmentData: any) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, appointmentData: any) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('appointments')
      .update(appointmentData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Consulta removida com sucesso' };
  }

  async findByPatient(patientId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('date');

    if (error) throw error;
    return data;
  }
}

