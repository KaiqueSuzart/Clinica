import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { WebhookDto, ChatMessageDto, ChatbotConfigDto } from './dto/chatbot.dto';
import axios from 'axios';

@Injectable()
export class ChatbotService implements OnModuleInit {
  private readonly logger = new Logger(ChatbotService.name);
  private n8nWebhookUrl: string;
  private isEnabled: boolean = false;

  constructor(private readonly supabaseService: SupabaseService) {}

  async onModuleInit() {
    // Aguardar a inicialização do módulo antes de carregar configurações
    await this.loadConfig();
  }

  private async loadConfig(empresaId?: string) {
    try {
      const client = this.supabaseService.getClient();
      if (!client) {
        this.logger.warn('Cliente Supabase ainda não inicializado, tentando novamente...');
        return;
      }

      let query = client
        .from('chatbot_config')
        .select('*');
      
      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }
      
      const { data, error } = await query.single();

      if (data && !error) {
        this.n8nWebhookUrl = data.n8n_webhook_url;
        this.isEnabled = data.is_enabled;
        this.logger.log('Configurações do chatbot carregadas com sucesso');
      } else if (error && error.code !== 'PGRST116') {
        // PGRST116 = nenhum resultado encontrado (tabela vazia ou não existe)
        this.logger.warn('Tabela chatbot_config não encontrada ou vazia. Isso é normal se ainda não foi configurado.');
      }
    } catch (error) {
      this.logger.error('Erro ao carregar configurações do chatbot:', error);
      // Não lançar erro para não impedir a inicialização do serviço
    }
  }

  async processWebhookMessage(webhookData: WebhookDto, empresaId: string) {
    try {
      this.logger.log('Processando mensagem do webhook:', webhookData);

      // Validar que o paciente pertence à empresa
      const { data: patient, error: patientError } = await this.supabaseService
        .getClient()
        .from('clientelA')
        .select('id, empresa')
        .eq('id', webhookData.patientId)
        .eq('empresa', empresaId)
        .single();

      if (patientError || !patient) {
        throw new Error('Paciente não encontrado ou não pertence à empresa');
      }

      // Salvar mensagem no banco de dados
      const message = {
        patient_id: webhookData.patientId,
        empresa_id: empresaId,
        message_type: webhookData.messageType || 'text',
        content: webhookData.content,
        sender: webhookData.sender || 'patient',
        timestamp: new Date().toISOString(),
        metadata: webhookData.metadata || {}
      };

      const { data, error } = await this.supabaseService.getClient()
        .from('chatbot_messages')
        .insert([message])
        .select()
        .single();

      if (error) {
        this.logger.error('Erro ao salvar mensagem:', error);
        throw error;
      }

      // Processar resposta se necessário
      if (webhookData.requiresResponse) {
        const response = await this.generateResponse(webhookData);
        return {
          success: true,
          message: 'Mensagem processada com sucesso',
          response: response
        };
      }

      return {
        success: true,
        message: 'Mensagem processada com sucesso',
        data: data
      };
    } catch (error) {
      this.logger.error('Erro ao processar webhook:', error);
      throw error;
    }
  }

  async sendMessageToN8n(messageData: ChatMessageDto) {
    if (!this.n8nWebhookUrl) {
      throw new Error('Webhook do n8n não configurado');
    }

    try {
      const payload = {
        patientId: messageData.patientId,
        content: messageData.content,
        messageType: messageData.messageType || 'text',
        sender: messageData.sender || 'system',
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(this.n8nWebhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      this.logger.log('Mensagem enviada para n8n com sucesso');
      return {
        success: true,
        message: 'Mensagem enviada para n8n com sucesso',
        response: response.data
      };
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem para n8n:', error);
      throw error;
    }
  }

  async generateResponse(webhookData: WebhookDto) {
    // Aqui você pode implementar lógica para gerar respostas automáticas
    // ou simplesmente retornar uma confirmação
    return {
      content: 'Mensagem recebida com sucesso! Nossa equipe entrará em contato em breve.',
      messageType: 'text',
      timestamp: new Date().toISOString()
    };
  }

  async getConfig(empresaId: string) {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('chatbot_config')
        .select('*')
        .eq('empresa_id', empresaId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return {
        n8nWebhookUrl: data?.n8n_webhook_url || '',
        isEnabled: data?.is_enabled || false,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      this.logger.error('Erro ao obter configurações:', error);
      throw error;
    }
  }

  async updateConfig(config: ChatbotConfigDto, empresaId: string) {
    try {
      const configData = {
        empresa_id: empresaId,
        n8n_webhook_url: config.n8nWebhookUrl,
        is_enabled: config.isEnabled,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabaseService.getClient()
        .from('chatbot_config')
        .upsert([configData], { onConflict: 'empresa_id' })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Atualizar configurações em memória
      this.n8nWebhookUrl = config.n8nWebhookUrl;
      this.isEnabled = config.isEnabled;

      return {
        success: true,
        message: 'Configurações atualizadas com sucesso',
        data: data
      };
    } catch (error) {
      this.logger.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }

  async getConversations(patientId: string, empresaId: string) {
    try {
      // Validar que o paciente pertence à empresa
      const { data: patient, error: patientError } = await this.supabaseService
        .getClient()
        .from('clientelA')
        .select('id, empresa')
        .eq('id', patientId)
        .eq('empresa', empresaId)
        .single();

      if (patientError || !patient) {
        throw new Error('Paciente não encontrado ou não pertence à empresa');
      }

      const { data, error } = await this.supabaseService.getClient()
        .from('chatbot_messages')
        .select('*')
        .eq('patient_id', patientId)
        .eq('empresa_id', empresaId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error('Erro ao obter conversas:', error);
      throw error;
    }
  }

  async getStats(empresaId: string) {
    try {
      const { data: totalMessages, error: messagesError } = await this.supabaseService.getClient()
        .from('chatbot_messages')
        .select('id', { count: 'exact' })
        .eq('empresa_id', empresaId);

      const { data: activePatients, error: patientsError } = await this.supabaseService.getClient()
        .from('chatbot_messages')
        .select('patient_id')
        .eq('empresa_id', empresaId)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (messagesError || patientsError) {
        throw messagesError || patientsError;
      }

      const uniquePatients = new Set(activePatients?.map(p => p.patient_id) || []).size;

      return {
        totalMessages: totalMessages?.length || 0,
        activePatients24h: uniquePatients,
        isEnabled: this.isEnabled,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  async testN8nConnection() {
    if (!this.n8nWebhookUrl) {
      return {
        success: false,
        message: 'Webhook do n8n não configurado'
      };
    }

    try {
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Teste de conexão'
      };

      const response = await axios.post(this.n8nWebhookUrl, testPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      return {
        success: true,
        message: 'Conexão com n8n estabelecida com sucesso',
        status: response.status,
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao conectar com n8n',
        error: error.message
      };
    }
  }
}
