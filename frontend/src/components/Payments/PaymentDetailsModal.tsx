import React from 'react';
import { X, DollarSign, Calendar, User, FileText, CreditCard, Wallet, Smartphone, Building2, CheckCircle2, Clock } from 'lucide-react';
import { Payment, PaymentMethod } from '../../services/api';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export default function PaymentDetailsModal({ isOpen, onClose, payment }: PaymentDetailsModalProps) {
  if (!isOpen || !payment) return null;

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'dinheiro':
        return <Wallet className="w-5 h-5 text-green-600" />;
      case 'cartao_credito':
      case 'cartao_debito':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'pix':
        return <Smartphone className="w-5 h-5 text-teal-600" />;
      case 'transferencia':
        return <Building2 className="w-5 h-5 text-orange-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX',
      transferencia: 'Transferência',
    };
    return labels[method] || method;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Extrair informações de parcelas da descrição
  const extractParcelInfo = (descricao: string) => {
    const parcelMatch = descricao.match(/\(Parcelado em (\d+)x\)/i);
    if (parcelMatch) {
      const parcelas = parseInt(parcelMatch[1]);
      const valorParcela = payment.valor / parcelas;
      return { parcelas, valorParcela };
    }
    return null;
  };

  const parcelInfo = payment.descricao ? extractParcelInfo(payment.descricao) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detalhes do Pagamento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {payment.confirmado ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <Clock className="w-6 h-6 text-yellow-600" />
              )}
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  payment.confirmado
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}
              >
                {payment.confirmado ? 'Confirmado' : 'Pendente'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(payment.valor)}
              </p>
            </div>
          </div>

          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Paciente</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {payment.paciente_nome || `Paciente ${payment.paciente_id}`}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Data do Pagamento</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(payment.data_pagamento)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {getPaymentMethodIcon(payment.forma_pagamento)}
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Forma de Pagamento</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {getPaymentMethodLabel(payment.forma_pagamento)}
              </p>
            </div>

            {payment.consulta_id && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Consulta</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {payment.consulta_id.slice(0, 8)}...
                </p>
                {payment.consulta_data && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Data: {formatDate(payment.consulta_data)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Informações de Parcelamento */}
          {parcelInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Informações de Parcelamento
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Total de Parcelas</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {parcelInfo.parcelas}x
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Valor por Parcela</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(parcelInfo.valorParcela)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Descrição */}
          {payment.descricao && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Descrição do Procedimento
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-gray-100">
                  {payment.descricao}
                </p>
              </div>
            </div>
          )}

          {/* Procedimento da Consulta */}
          {payment.consulta_procedimento && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Procedimento Realizado
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-gray-100">
                  {payment.consulta_procedimento}
                </p>
              </div>
            </div>
          )}

          {/* Observações */}
          {payment.observacoes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Observações
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {payment.observacoes}
                </p>
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Informações Adicionais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">ID do Pagamento:</span>
                <p className="text-gray-900 dark:text-gray-100 font-mono">{payment.id}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Criado em:</span>
                <p className="text-gray-900 dark:text-gray-100">
                  {formatDateTime(payment.created_at)}
                </p>
              </div>
              {payment.updated_at && payment.updated_at !== payment.created_at && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Atualizado em:</span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatDateTime(payment.updated_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}





