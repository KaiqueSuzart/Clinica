import React, { useState } from 'react';
import { Send, Mail, MessageCircle, X, Copy, Check } from 'lucide-react';
import { Budget } from '../../services/api';

interface SendBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  onSend: (method: 'whatsapp' | 'email' | 'copy') => void;
}

const SendBudgetModal: React.FC<SendBudgetModalProps> = ({
  isOpen,
  onClose,
  budget,
  onSend
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !budget) return null;

  const generateWhatsAppMessage = () => {
    const patientName = budget.clientelA?.nome || 'Cliente';
    const total = budget.valor_final?.toFixed(2) || '0,00';
    const validUntil = budget.data_validade ? new Date(budget.data_validade).toLocaleDateString('pt-BR') : 'N/A';
    
    // Calcular valor total sem desconto
    const valorTotalSemDesconto = (budget.itens_orcamento || []).reduce((sum, item) => sum + (item.valor_total || 0), 0);
    
    return `Olá ${patientName}! 

Seu orçamento está pronto! 

💰 *Valor Total: R$ ${valorTotalSemDesconto.toFixed(2)}*
📅 *Válido até: ${validUntil}*

${budget.itens_orcamento?.map(item => 
  `• ${item.descricao} - ${item.quantidade}x R$ ${item.valor_unitario?.toFixed(2)} = R$ ${item.valor_total?.toFixed(2)}`
).join('\n')}

${budget.desconto && budget.desconto > 0 ? 
  `\n🎯 *Desconto: ${budget.tipo_desconto === 'percentage' ? budget.desconto + '%' : 'R$ ' + budget.desconto.toFixed(2)}*` : ''}

💰 *Valor Final: R$ ${total}*

Aguardo sua confirmação! 😊`;
  };

  const generateEmailContent = () => {
    const patientName = budget.clientelA?.nome || 'Cliente';
    const total = budget.valor_final?.toFixed(2) || '0,00';
    const validUntil = budget.data_validade ? new Date(budget.data_validade).toLocaleDateString('pt-BR') : 'N/A';
    
    // Calcular valor total sem desconto
    const valorTotalSemDesconto = (budget.itens_orcamento || []).reduce((sum, item) => sum + (item.valor_total || 0), 0);
    
    return `Assunto: Orçamento Dental - ${patientName}

Olá ${patientName},

Seu orçamento está pronto! Segue os detalhes:

VALOR TOTAL: R$ ${valorTotalSemDesconto.toFixed(2)}
VÁLIDO ATÉ: ${validUntil}

PROCEDIMENTOS:
${budget.itens_orcamento?.map(item => 
  `• ${item.descricao} - ${item.quantidade}x R$ ${item.valor_unitario?.toFixed(2)} = R$ ${item.valor_total?.toFixed(2)}`
).join('\n')}

${budget.desconto && budget.desconto > 0 ? 
  `DESCONTO: ${budget.tipo_desconto === 'percentage' ? budget.desconto + '%' : 'R$ ' + budget.desconto.toFixed(2)}` : ''}

VALOR FINAL: R$ ${total}

Aguardo sua confirmação!

Atenciosamente,
Equipe Dental`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${budget.clientelA?.telefone?.replace(/\D/g, '') || ''}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    onSend('whatsapp');
  };

  const handleEmail = () => {
    const subject = `Orçamento Dental - ${budget.clientelA?.nome || 'Cliente'}`;
    const body = generateEmailContent();
    const emailUrl = `mailto:${budget.clientelA?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
    onSend('email');
  };

  const handleCopy = () => {
    const content = generateEmailContent();
    copyToClipboard(content);
    onSend('copy');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Enviar Orçamento
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center p-6 border-2 border-green-200 dark:border-green-800 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 dark:group-hover:bg-green-900/50">
                <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                WhatsApp
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Enviar via WhatsApp para {budget.clientelA?.telefone || 'telefone não informado'}
              </p>
            </button>

            {/* Email */}
            <button
              onClick={handleEmail}
              className="flex flex-col items-center p-6 border-2 border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Email
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Enviar via email para {budget.clientelA?.email || 'email não informado'}
              </p>
            </button>

            {/* Copiar */}
            <button
              onClick={handleCopy}
              className="flex flex-col items-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-600">
                {copied ? (
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {copied ? 'Copiado!' : 'Copiar'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Copiar conteúdo para colar em outro lugar
              </p>
            </button>
          </div>

          {/* Preview do conteúdo */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Preview da mensagem:
            </h5>
            <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line max-h-32 overflow-y-auto">
              {generateWhatsAppMessage()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendBudgetModal;
