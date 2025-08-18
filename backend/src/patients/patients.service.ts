import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PatientsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return data;
  }

  async create(patientData: any) {
    console.log('Dados recebidos para criação:', patientData);
    
    const { data, error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .insert(patientData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar paciente:', error);
      throw error;
    }
    
    console.log('Paciente criado com sucesso:', data);
    return data;
  }

  async update(id: string, patientData: any) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .update(patientData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Paciente removido com sucesso' };
  }

  async searchPatients(searchDto: any) {
    let query = this.supabaseService
      .getClient()
      .from('clientelA')
      .select('*');

    // Filtros de busca
    if (searchDto.nome) {
      query = query.ilike('nome', `%${searchDto.nome}%`);
    }
    if (searchDto.Cpf) {
      query = query.eq('Cpf', searchDto.Cpf);
    }
    if (searchDto.Email) {
      query = query.ilike('Email', `%${searchDto.Email}%`);
    }
    if (searchDto.status) {
      query = query.eq('status', searchDto.status);
    }
    if (searchDto.iaativa !== undefined) {
      query = query.eq('iaativa', searchDto.iaativa);
    }
    if (searchDto.empresa) {
      query = query.eq('empresa', searchDto.empresa);
    }

    const { data, error } = await query.order('nome');
    if (error) throw error;
    return data;
  }

  async getPatientsByStatus(status: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .select('*')
      .eq('status', status)
      .order('nome');

    if (error) throw error;
    return data;
  }

  async getActivePatients() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .select('*')
      .eq('iaativa', true)
      .order('nome');

    if (error) throw error;
    return data;
  }

  async getPatientsWithUpcomingReturns() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .select('*')
      .gte('proximo_retorno', today)
      .order('proximo_retorno');

    if (error) throw error;
    return data;
  }
}
