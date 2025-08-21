import React, { useState } from 'react';
import { X, Calendar, Clock, User, Save, AlertCircle } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';

interface ScheduleReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
  onSave: (returnData: any) => void;
}

export default function ScheduleReturnModal({ 
  isOpen, 
  onClose, 
  patientName, 
  patientId, 
  onSave 
}: ScheduleReturnModalProps) {
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
    return procedure && returnDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    const returnData = {
      id: Date.now().toString(),
      patientId,
      patientName,
      procedure,
      returnDate,
      reminderDate: new Date(new Date(returnDate).getTime() - (reminderDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      notes,
      status: 'agendado',
      createdAt: new Date().toISOString()
    };

    onSave(returnData);
    setIsSubmitting(false);
    onClose();
    
    // Reset form
    setProcedure('');
    setReturnDate('');
    setReminderDays(7);
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Retorno - {patientName}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Data do Retorno */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Prevista do Retorno *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Lembrete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lembrar com antecedência
              </label>
              <select
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value={3}>3 dias antes</option>
                <option value={7}>1 semana antes</option>
                <option value={14}>2 semanas antes</option>
                <option value={30}>1 mês antes</option>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Informações adicionais sobre o retorno..."
              />
            </div>

            {/* Resumo */}
            {procedure && returnDate && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg animate-in fade-in duration-300">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                      Resumo do Retorno Agendado
                    </h5>
                    <div className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                      <p><strong>Paciente:</strong> {patientName}</p>
                      <p><strong>Motivo:</strong> {procedure}</p>
                      <p><strong>Data Prevista:</strong> {new Date(returnDate).toLocaleDateString('pt-BR')}</p>
                      <p><strong>Lembrete:</strong> {new Date(new Date(returnDate).getTime() - (reminderDays * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR')}</p>
                      {notes && <p><strong>Observações:</strong> {notes}</p>}
                    </div>
                    <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>Importante:</strong> Este retorno aparecerá na seção "Possíveis Retornos" quando a data de lembrete chegar.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              disabled={!validateForm()}
              icon={Save}
            >
              Agendar Retorno
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}