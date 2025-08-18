import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;

  constructor() {}

  onModuleInit() {
    this.supabase = createClient(config.supabase.url, config.supabase.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient {
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
