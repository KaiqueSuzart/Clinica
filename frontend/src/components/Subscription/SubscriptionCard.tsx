import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface SubscriptionData {
  subscription?: {
    id: number;
    status: string;
    valor_mensal: number;
    proxima_cobranca: string;
    plan: {
      nome: string;
      descricao: string;
      preco_mensal: number;
    };
  };
  summary: {
    monthlySubscription: number;
    monthlyChatbotCost: number;
    totalMonthlyCost: number;
    totalPayments: number;
    nextBilling: string | null;
  };
  chatbotBilling: any[];
  paymentHistory: any[];
}

export default function SubscriptionCard() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFinancialSummary();
      setData(response);
    } catch (err) {
      console.error('Erro ao carregar dados de assinatura:', err);
      setError('Erro ao carregar dados de assinatura');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'suspended':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'cancelled':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'suspended':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center text-red-600 dark:text-red-400">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
          <Button onClick={loadSubscriptionData} variant="outline" className="mt-2">
            Tentar Novamente
          </Button>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>Nenhum dado de assinatura encontrado</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Resumo Financeiro
          </h3>
          <Button onClick={loadSubscriptionData} variant="outline" size="sm">
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Assinatura Mensal</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(data.summary.monthlySubscription)}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Chatbot (30 dias)</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(data.summary.monthlyChatbotCost)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Total Mensal</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {formatCurrency(data.summary.totalMonthlyCost)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Pagos (30 dias)</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {formatCurrency(data.summary.totalPayments)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </Card>

      {/* Plano Atual */}
      {data.subscription && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Plano Atual
          </h3>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {data.subscription.plan.nome}
              </h4>
              <div className={`flex items-center ${getStatusColor(data.subscription.status)}`}>
                {getStatusIcon(data.subscription.status)}
                <span className="ml-1 capitalize">{data.subscription.status}</span>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {data.subscription.plan.descricao}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Valor Mensal</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(data.subscription.valor_mensal)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Próxima Cobrança</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(data.subscription.proxima_cobranca)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Histórico de Cobranças do Chatbot */}
      {data.chatbotBilling && data.chatbotBilling.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cobranças do Chatbot (Últimos 30 dias)
          </h3>

          <div className="space-y-2">
            {data.chatbotBilling.slice(0, 5).map((billing, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(billing.data_cobranca)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {billing.tokens_utilizados.toLocaleString()} tokens
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(billing.custo_total)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(billing.custo_tokens)} + {formatCurrency(billing.custo_railway)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Histórico de Pagamentos */}
      {data.paymentHistory && data.paymentHistory.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Histórico de Pagamentos (Últimos 30 dias)
          </h3>

          <div className="space-y-2">
            {data.paymentHistory.slice(0, 5).map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.descricao}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(payment.data_pagamento)} • {payment.tipo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(payment.valor)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {payment.metodo_pagamento || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
