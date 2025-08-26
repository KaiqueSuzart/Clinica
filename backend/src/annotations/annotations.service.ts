import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';

@Injectable()
export class AnnotationsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createAnnotationDto: CreateAnnotationDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('annotations')
      .insert(createAnnotationDto)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(patientId?: number) {
    let query = this.supabaseService
      .getClient()
      .from('annotations')
      .select('*')
      .order('created_at', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('annotations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Anotação não encontrada');
    }

    return data;
  }

  async update(id: string, updateAnnotationDto: UpdateAnnotationDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('annotations')
      .update(updateAnnotationDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('annotations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Anotação removida com sucesso' };
  }
}





