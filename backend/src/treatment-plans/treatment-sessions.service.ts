import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface TreatmentSession {
  id: string;
  treatment_item_id: string;
  session_number: number;
  date?: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionDto {
  treatment_item_id: string;
  session_number: number;
  date?: string;
  description?: string;
  completed: boolean;
}

export interface UpdateSessionDto {
  date?: string;
  description?: string;
  completed?: boolean;
}

@Injectable()
export class TreatmentSessionsService {
  constructor(private supabaseService: SupabaseService) {}

  async createSessionsForItem(treatmentItemId: string, numberOfSessions: number): Promise<TreatmentSession[]> {
    const sessions = Array.from({ length: numberOfSessions }, (_, i) => ({
      treatment_item_id: treatmentItemId,
      session_number: i + 1,
      completed: false
    }));

    const { data, error } = await this.supabaseService
      .getClient()
      .from('treatment_sessions')
      .insert(sessions)
      .select();

    if (error) throw error;
    return data;
  }

  async updateSession(sessionId: string, updates: UpdateSessionDto): Promise<TreatmentSession> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('treatment_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSessionsForItem(treatmentItemId: string): Promise<TreatmentSession[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('treatment_sessions')
      .select('*')
      .eq('treatment_item_id', treatmentItemId)
      .order('session_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async deleteSessionsForItem(treatmentItemId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('treatment_sessions')
      .delete()
      .eq('treatment_item_id', treatmentItemId);

    if (error) throw error;
  }

  async getCompletedSessionsForPatient(patientId: string): Promise<any[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('treatment_sessions')
      .select(`
        *,
        treatment_item: itens_plano_tratamento(
          procedimento,
          dente,
          plano_tratamento(
            titulo,
            paciente_id
          )
        )
      `)
      .eq('treatment_item.plano_tratamento.paciente_id', patientId)
      .eq('completed', true)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
