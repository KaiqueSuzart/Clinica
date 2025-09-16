import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto, ChatbotBillingDto, PaymentHistoryDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // ===== PLANOS DE ASSINATURA =====
  
  async getSubscriptionPlans() {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('subscription_plans')
        .select('*')
        .eq('ativo', true)
        .order('preco_mensal', { ascending: true });

      if (error) {
        console.error('[SubscriptionsService.getSubscriptionPlans] Erro:', error);
        throw new Error('Erro ao buscar planos de assinatura');
      }

      return data;
    } catch (error) {
      console.error('[SubscriptionsService.getSubscriptionPlans] Erro genérico:', error);
      throw new Error('Erro ao buscar planos de assinatura');
    }
  }

  // ===== ASSINATURAS DA EMPRESA =====
  
  async getEmpresaSubscription(empresaId: number) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('empresa_subscriptions')
        .select(`
          *,
          plan:plan_id(*)
        `)
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('[SubscriptionsService.getEmpresaSubscription] Erro:', error);
        throw new Error('Erro ao buscar assinatura da empresa');
      }

      return data;
    } catch (error) {
      console.error('[SubscriptionsService.getEmpresaSubscription] Erro genérico:', error);
      throw new Error('Erro ao buscar assinatura da empresa');
    }
  }

  async createEmpresaSubscription(empresaId: number, subscriptionData: CreateSubscriptionDto) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('empresa_subscriptions')
        .insert({
          empresa_id: empresaId,
          plan_id: subscriptionData.plan_id,
          valor_mensal: subscriptionData.valor_mensal,
          proxima_cobranca: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        })
        .select(`
          *,
          plan:plan_id(*)
        `)
        .single();

      if (error) {
        console.error('[SubscriptionsService.createEmpresaSubscription] Erro:', error);
        throw new Error('Erro ao criar assinatura');
      }

      return data;
    } catch (error) {
      console.error('[SubscriptionsService.createEmpresaSubscription] Erro genérico:', error);
      throw new Error('Erro ao criar assinatura');
    }
  }

  async updateEmpresaSubscription(empresaId: number, updateData: UpdateSubscriptionDto) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('empresa_subscriptions')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('empresa_id', empresaId)
        .select(`
          *,
          plan:plan_id(*)
        `)
        .single();

      if (error) {
        console.error('[SubscriptionsService.updateEmpresaSubscription] Erro:', error);
        throw new Error('Erro ao atualizar assinatura');
      }

      return data;
    } catch (error) {
      console.error('[SubscriptionsService.updateEmpresaSubscription] Erro genérico:', error);
      throw new Error('Erro ao atualizar assinatura');
    }
  }

  // ===== COBRANÇA DO CHATBOT =====
  
  async getChatbotBilling(empresaId: number, startDate?: string, endDate?: string) {
    try {
      let query = this.supabaseService
        .getClient()
        .from('chatbot_billing')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('data_cobranca', { ascending: false });

      if (startDate) {
        query = query.gte('data_cobranca', startDate);
      }
      if (endDate) {
        query = query.lte('data_cobranca', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[SubscriptionsService.getChatbotBilling] Erro:', error);
        throw new Error('Erro ao buscar cobranças do chatbot');
      }

      return data;
    } catch (error) {
      console.error('[SubscriptionsService.getChatbotBilling] Erro genérico:', error);
      throw new Error('Erro ao buscar cobranças do chatbot');
    }
  }

  async createChatbotBilling(empresaId: number, billingData: ChatbotBillingDto) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('chatbot_billing')
        .insert({
          empresa_id: empresaId,
          ...billingData,
        })
        .select('*')
        .single();

      if (error) {
        console.error('[SubscriptionsService.createChatbotBilling] Erro:', error);
        throw new Error('Erro ao criar cobrança do chatbot');
      }

      return data;
    } catch (error) {
      console.error('[SubscriptionsService.createChatbotBilling] Erro genérico:', error);
      throw new Error('Erro ao criar cobrança do chatbot');
    }
  }

  // ===== HISTÓRICO DE PAGAMENTOS =====
  
  async getPaymentHistory(empresaId: number, startDate?: string, endDate?: string) {
    try {
      let query = this.supabaseService
        .getClient()
        .from('payment_history')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('data_pagamento', { ascending: false });

      if (startDate) {
        query = query.gte('data_pagamento', startDate);
      }
      if (endDate) {
        query = query.lte('data_pagamento', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[SubscriptionsService.getPaymentHistory] Erro:', error);
        throw new Error('Erro ao buscar histórico de pagamentos');
      }

      return data;
    } catch (error) {
      console.error('[SubscriptionsService.getPaymentHistory] Erro genérico:', error);
      throw new Error('Erro ao buscar histórico de pagamentos');
    }
  }

  async createPaymentRecord(empresaId: number, paymentData: PaymentHistoryDto) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('payment_history')
        .insert({
          empresa_id: empresaId,
          ...paymentData,
        })
        .select('*')
        .single();

      if (error) {
        console.error('[SubscriptionsService.createPaymentRecord] Erro:', error);
        throw new Error('Erro ao criar registro de pagamento');
      }

      return data;
    } catch (error) {
      console.error('[SubscriptionsService.createPaymentRecord] Erro genérico:', error);
      throw new Error('Erro ao criar registro de pagamento');
    }
  }

  // ===== RESUMO FINANCEIRO =====
  
  async getFinancialSummary(empresaId: number) {
    try {
      const [subscription, chatbotBilling, paymentHistory] = await Promise.all([
        this.getEmpresaSubscription(empresaId),
        this.getChatbotBilling(empresaId),
        this.getPaymentHistory(empresaId)
      ]);

      // Calcular totais do chatbot (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentChatbotBilling = chatbotBilling.filter(billing => 
        new Date(billing.data_cobranca) >= thirtyDaysAgo
      );

      const totalChatbotCost = recentChatbotBilling.reduce((sum, billing) => 
        sum + parseFloat(billing.custo_total.toString()), 0
      );

      // Calcular total de pagamentos (últimos 30 dias)
      const recentPayments = paymentHistory.filter(payment => 
        new Date(payment.data_pagamento) >= thirtyDaysAgo
      );

      const totalPayments = recentPayments.reduce((sum, payment) => 
        sum + parseFloat(payment.valor.toString()), 0
      );

      return {
        subscription,
        chatbotBilling: recentChatbotBilling,
        paymentHistory: recentPayments,
        summary: {
          monthlySubscription: subscription?.valor_mensal || 0,
          monthlyChatbotCost: totalChatbotCost,
          totalMonthlyCost: (subscription?.valor_mensal || 0) + totalChatbotCost,
          totalPayments: totalPayments,
          nextBilling: subscription?.proxima_cobranca || null,
        }
      };
    } catch (error) {
      console.error('[SubscriptionsService.getFinancialSummary] Erro genérico:', error);
      throw new Error('Erro ao buscar resumo financeiro');
    }
  }
}
