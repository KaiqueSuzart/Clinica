import React, { useState } from 'react';
import { X, Calendar, User, Save, AlertCircle } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';
import { apiService } from '../../services/api';
import { useToast } from '../UI/Toast';
import { useBusinessHours } from '../../contexts/BusinessHoursContext';

interface ScheduleReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
  patientPhone?: string;
  patientEmail?: string;
  onSave: (returnData: any) => void;
}

export default function ScheduleReturnModal({ 
  isOpen, 
  onClose, 
  patientName, 
  patientId, 
  patientPhone, 
  patientEmail,
  onSave 
}: ScheduleReturnModalProps) {
  const { showSuccess, showError } = useToast();
  const { isWorkingDay } = useBusinessHours();
  const [procedure, setProcedure] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [reminderDays, setReminderDays] = useState(7);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const procedures = [
    'Avaliação pós-limpeza',
    'Controle do canal',
    'Remoção de pontos',
    'Avaliação de restauração',
    'Controle pós-cirúrgico',
    'Ajuste de prótese',
    'Controle de implante',
    'Avaliação ortodôntica',
    'Consulta de rotina',
    'Controle periodontal'
  ];

  const validateForm = () => {
    if (!procedure || !returnDate) return false;
    
    // Verificar se a data selecionada é um dia de trabalho
    const selectedDate = new Date(returnDate);
    if (!isWorkingDay(selectedDate)) {
      showError('A clínica não funciona neste dia da semana. Escolha outro dia.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Criar retorno usando a API
      const returnData = {
        cliente_id: patientId.toString(),
        data_retorno: returnDate,
        hora_retorno: '09:00', // Horário padrão para possíveis retornos
        motivo: `Retorno sugerido pelo médico - ${procedure}`,
        procedimento: procedure,
        status: 'pendente', // Status pendente para aparecer em "Possíveis Retornos"
        observacoes: `${notes}\n\nLembrete: ${reminderDays} dias antes da data prevista.\n\nNOTA: Este é um possível retorno para a recepcionista ligar e confirmar.`
      };

      console.log('Criando retorno com dados:', returnData);
      const createdReturn = await apiService.createReturn(returnData);
      console.log('Retorno criado com sucesso:', createdReturn);
      
      showSuccess('Possível retorno criado! Aparecerá na aba "Retornos" para a recepcionista ligar e confirmar.');
      
      // Chamar callback para atualizar a interface
      onSave({
        id: createdReturn.id,
        patientId,
        patientName,
        procedure,
        returnDate,
        notes,
        status: 'pendente',
        createdAt: new Date().toISOString()
      });

      // Reset form
      setProcedure('');
      setReturnDate('');
      setReminderDays(7);
      setNotes('');
      
      onClose();
    } catch (error) {
      console.error('Erro ao criar retorno:', error);
      showError('Erro ao criar possível retorno');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Sugerir Retorno - {patientName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Informações do Paciente */}
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Paciente Selecionado
              </h4>
              <p className="text-blue-800 dark:text-blue-200">{patientName}</p>
              {patientPhone && (
                <p className="text-blue-700 dark:text-blue-300 text-sm">📞 {patientPhone}</p>
              )}
              {patientEmail && (
                <p className="text-blue-700 dark:text-blue-300 text-sm">✉️ {patientEmail}</p>
              )}
            </div>

            <div className="space-y-4">
              {/* Procedimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo do Retorno *
                </label>
                <select
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Selecione o motivo</option>
                  {procedures.map(proc => (
                    <option key={proc} value={proc}>{proc}</option>
                  ))}
                </select>
              </div>

              {/* Data sugerida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Sugerida *
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Lembrete */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lembrete (dias antes)
                </label>
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value={1}>1 dia antes</option>
                  <option value={3}>3 dias antes</option>
                  <option value={7}>7 dias antes</option>
                  <option value={14}>14 dias antes</option>
                  <option value={30}>30 dias antes</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Observações adicionais sobre o retorno..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Este é um possível retorno</p>
                  <p>A recepcionista receberá uma notificação para ligar e confirmar o agendamento com o paciente.</p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                disabled={!validateForm()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Sugerir Retorno
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}