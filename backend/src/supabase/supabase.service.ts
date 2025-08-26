import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config';
import type { Database } from '../types/database';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient<Database>;

  constructor() {}

  onModuleInit() {
    // Usar service role no backend para evitar bloqueios de RLS
    this.supabase = createClient<Database>(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient<Database> {
    return this.supabase;
  }

  async testConnection() {
    try {
      const { data, error } = await this.supabase.from('clientelA').select('count').limit(1);
      if (error) throw error;
      return { success: true, message: 'Conexão com Supabase estabelecida - Tabela clientelA encontrada' };
    } catch (error) {
      return { success: false, message: 'Erro na conexão com Supabase', error: error.message };
    }
  }
}
