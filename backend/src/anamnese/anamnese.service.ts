import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAnamneseDto } from './dto/create-anamnese.dto';
import { UpdateAnamneseDto } from './dto/update-anamnese.dto';

@Injectable()
export class AnamneseService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createAnamneseDto: CreateAnamneseDto) {
    console.log('🚀 AnamneseService.create chamado com:', createAnamneseDto);
    
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('anamnese')
        .insert(createAnamneseDto)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }
      
      console.log('✅ Anamnese criada com sucesso:', data);
      return data;
    } catch (err) {
      console.error('❌ Erro geral no create:', err);
      throw err;
    }
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('anamnese')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('anamnese')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Anamnese não encontrada');
    }

    return data;
  }

  async findByPatient(patientId: number) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('anamnese')
      .select('*')
      .eq('cliente_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async update(id: string, updateAnamneseDto: UpdateAnamneseDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('anamnese')
      .update(updateAnamneseDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('anamnese')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Anamnese removida com sucesso' };
  }
}
