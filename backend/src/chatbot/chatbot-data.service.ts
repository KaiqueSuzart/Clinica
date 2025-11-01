import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ChatbotDataService {
  private readonly logger = new Logger(ChatbotDataService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getProcedimentos(categoria?: string) {
    try {
      let query = this.supabaseService.getClient()
        .from('procedimentos')
        .select('*')
        .eq('ativo', true)
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

  async getHorarios() {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('horarios_funcionamento')
        .select('*')
        .eq('ativo', true)
        .order('dia_semana');

      if (error) {
        throw error;
      }

      // Converter para formato mais amigável
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const horariosFormatados = data?.map(horario => ({
        ...horario,
        dia_nome: diasSemana[horario.dia_semana],
        horario_formatado: `${horario.abertura} às ${horario.fechamento}`
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

  async getContato() {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('contato_empresa')
        .select('*')
        .eq('ativo', true)
        .order('principal', { ascending: false });

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

  async getFAQ(categoria?: string) {
    try {
      let query = this.supabaseService.getClient()
        .from('faq_empresa')
        .select('*')
        .eq('ativo', true)
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

  async getPoliticas(tipo?: string) {
    try {
      let query = this.supabaseService.getClient()
        .from('politicas_empresa')
        .select('*')
        .eq('ativo', true);

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

  async getPromocoes() {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('promocoes')
        .select(`
          *,
          procedimento:procedimentos(nome, categoria)
        `)
        .eq('ativo', true)
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

  async getEspecialidades() {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('especialidades')
        .select('*')
        .eq('ativo', true)
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

  async getProfissionais(especialidade?: string) {
    try {
      let query = this.supabaseService.getClient()
        .from('profissionais')
        .select(`
          *,
          especialidade:especialidades(nome, descricao)
        `)
        .eq('ativo', true)
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

  async searchInfo(query: string) {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;

      // Buscar em FAQ
      const { data: faqData, error: faqError } = await this.supabaseService.getClient()
        .from('faq_empresa')
        .select('*')
        .eq('ativo', true)
        .or(`pergunta.ilike.${searchTerm},resposta.ilike.${searchTerm}`);

      // Buscar em procedimentos
      const { data: procedimentosData, error: procedimentosError } = await this.supabaseService.getClient()
        .from('procedimentos')
        .select('*')
        .eq('ativo', true)
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

  async getEmpresaInfo() {
    try {
      // Buscar informações básicas da empresa
      const [procedimentos, horarios, contato, faq, promocoes] = await Promise.all([
        this.getProcedimentos(),
        this.getHorarios(),
        this.getContato(),
        this.getFAQ(),
        this.getPromocoes()
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





