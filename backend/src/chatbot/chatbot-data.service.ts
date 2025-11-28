import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ChatbotDataService {
  private readonly logger = new Logger(ChatbotDataService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getProcedimentos(empresaId: string, categoria?: string) {
    try {
      let query = this.supabaseService.getClient()
        .from('procedimentos')
        .select('*')
        .eq('ativo', true)
        .eq('empresa_id', empresaId)
        .order('nome');

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data,
        total: data?.length || 0
      };
    } catch (error) {
      this.logger.error('Erro ao obter procedimentos:', error);
      throw error;
    }
  }

  async getHorarios(empresaId: string) {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('business_hours_config')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('day_of_week');

      if (error) {
        throw error;
      }

      // Converter para formato mais amigável
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const horariosFormatados = data?.map(horario => ({
        ...horario,
        dia_nome: diasSemana[horario.day_of_week] || diasSemana[0],
        horario_formatado: `${horario.start_time} às ${horario.end_time}`
      }));

      return {
        success: true,
        data: horariosFormatados
      };
    } catch (error) {
      this.logger.error('Erro ao obter horários:', error);
      throw error;
    }
  }

  async getContato(empresaId: string) {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('empresa')
        .select('*')
        .eq('id', empresaId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      this.logger.error('Erro ao obter contato:', error);
      throw error;
    }
  }

  async getFAQ(empresaId: string, categoria?: string) {
    try {
      let query = this.supabaseService.getClient()
        .from('faq_empresa')
        .select('*')
        .eq('ativo', true)
        .eq('empresa_id', empresaId)
        .order('ordem');

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data,
        total: data?.length || 0
      };
    } catch (error) {
      this.logger.error('Erro ao obter FAQ:', error);
      throw error;
    }
  }

  async getPoliticas(empresaId: string, tipo?: string) {
    try {
      let query = this.supabaseService.getClient()
        .from('politicas_empresa')
        .select('*')
        .eq('ativo', true)
        .eq('empresa_id', empresaId);

      if (tipo) {
        query = query.eq('tipo', tipo);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      this.logger.error('Erro ao obter políticas:', error);
      throw error;
    }
  }

  async getPromocoes(empresaId: string) {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('promocoes')
        .select(`
          *,
          procedimento:procedimentos(nome, categoria)
        `)
        .eq('ativo', true)
        .eq('empresa_id', empresaId)
        .gte('data_fim', new Date().toISOString().split('T')[0])
        .lte('data_inicio', new Date().toISOString().split('T')[0])
        .order('data_inicio', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      this.logger.error('Erro ao obter promoções:', error);
      throw error;
    }
  }

  async getEspecialidades(empresaId: string) {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('especialidades')
        .select('*')
        .eq('ativo', true)
        .eq('empresa_id', empresaId)
        .order('nome');

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      this.logger.error('Erro ao obter especialidades:', error);
      throw error;
    }
  }

  async getProfissionais(empresaId: string, especialidade?: string) {
    try {
      let query = this.supabaseService.getClient()
        .from('profissionais')
        .select(`
          *,
          especialidade:especialidades(nome, descricao)
        `)
        .eq('ativo', true)
        .eq('empresa_id', empresaId)
        .order('nome');

      if (especialidade) {
        query = query.eq('especialidade_id', especialidade);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      this.logger.error('Erro ao obter profissionais:', error);
      throw error;
    }
  }

  async searchInfo(query: string, empresaId: string) {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;

      // Buscar em FAQ
      const { data: faqData, error: faqError } = await this.supabaseService.getClient()
        .from('faq_empresa')
        .select('*')
        .eq('ativo', true)
        .eq('empresa_id', empresaId)
        .or(`pergunta.ilike.${searchTerm},resposta.ilike.${searchTerm}`);

      // Buscar em procedimentos
      const { data: procedimentosData, error: procedimentosError } = await this.supabaseService.getClient()
        .from('procedimentos')
        .select('*')
        .eq('ativo', true)
        .eq('empresa_id', empresaId)
        .or(`nome.ilike.${searchTerm},descricao.ilike.${searchTerm},categoria.ilike.${searchTerm}`);

      if (faqError || procedimentosError) {
        throw faqError || procedimentosError;
      }

      return {
        success: true,
        data: {
          faq: faqData || [],
          procedimentos: procedimentosData || [],
          total: (faqData?.length || 0) + (procedimentosData?.length || 0)
        }
      };
    } catch (error) {
      this.logger.error('Erro ao buscar informações:', error);
      throw error;
    }
  }

  async getEmpresaInfo(empresaId: string) {
    try {
      // Buscar informações básicas da empresa
      const [procedimentos, horarios, contato, faq, promocoes] = await Promise.all([
        this.getProcedimentos(empresaId),
        this.getHorarios(empresaId),
        this.getContato(empresaId),
        this.getFAQ(empresaId),
        this.getPromocoes(empresaId)
      ]);

      return {
        success: true,
        data: {
          procedimentos: procedimentos.data,
          horarios: horarios.data,
          contato: contato.data,
          faq: faq.data,
          promocoes: promocoes.data,
          resumo: {
            totalProcedimentos: procedimentos.total,
            totalFAQ: faq.total,
            promocoesAtivas: promocoes.data?.length || 0
          }
        }
      };
    } catch (error) {
      this.logger.error('Erro ao obter informações da empresa:', error);
      throw error;
    }
  }
}





