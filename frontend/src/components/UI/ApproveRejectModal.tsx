import React, { useState } from 'react';
import { CheckCircle, XCircle, X, AlertTriangle } from 'lucide-react';
import { Budget } from '../../services/api';

interface ApproveRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  action: 'approve' | 'reject' | null;
  onConfirm: (action: 'approve' | 'reject', reason?: string) => void;
}

export const ApproveRejectModal: React.FC<ApproveRejectModalProps> = ({
  isOpen,
  onClose,
  budget,
  action,
  onConfirm
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !budget || !action) return null;

  const isApprove = action === 'approve';
  const isReject = action === 'reject';

  const handleConfirm = () => {
    onConfirm(action, reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isApprove ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isApprove 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {isApprove ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                isApprove ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
              }`}>
                {isApprove ? 'Aprovar Orçamento' : 'Recusar Orçamento'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {budget.clientelA?.nome} - R$ {budget.valor_final?.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning for reject */}
          {isReject && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">
                  Atenção!
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Esta ação não pode ser desfeita. O orçamento será marcado como recusado.
                </p>
              </div>
            </div>
          )}

          {/* Budget summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Resumo do Orçamento:
            </h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Valor Total:</span>
                <span>R$ {budget.valor_total?.toFixed(2)}</span>
              </div>
              {budget.desconto && budget.desconto > 0 && (
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span>
                    {budget.tipo_desconto === 'percentage' 
                      ? `${budget.desconto}%` 
                      : `R$ ${budget.desconto.toFixed(2)}`
                    }
                  </span>
                </div>
              )}
              <div className="flex justify-between font-medium text-gray-900 dark:text-gray-100">
                <span>Valor Final:</span>
                <span>R$ {budget.valor_final?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Reason input for reject */}
          {isReject && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivo da recusa (opcional):
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Valor acima do orçamento disponível, procedimento não necessário, etc."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Confirmation message */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              {isApprove 
                ? 'Tem certeza que deseja aprovar este orçamento? O status será alterado para "aprovado".'
                : 'Tem certeza que deseja recusar este orçamento? O status será alterado para "recusado".'
              }
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                isApprove
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isApprove ? 'Aprovar' : 'Recusar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveRejectModal;
