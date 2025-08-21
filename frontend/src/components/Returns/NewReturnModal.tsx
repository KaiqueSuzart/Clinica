import React, { useState } from 'react';
import { X, RotateCcw, Calendar, User, Save, Clock } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';
import { patients, appointments } from '../../data/mockData';

interface NewReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (returnVisit: any) => void;
}

export default function NewReturnModal({ isOpen, onClose, onSave }: NewReturnModalProps) {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [procedure, setProcedure] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [originalDate, setOriginalDate] = useState('');
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
    'Avaliação ortodôntica'
  ];

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  const validateForm = () => {
    return selectedPatient && procedure && returnDate && originalDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newReturn = {
      id: Date.now().toString(),
      patientId: selectedPatient,
      patientName: selectedPatientData?.name || '',
      procedure,
      returnDate,
      originalDate,
      status: 'pendente',
      notes
    };

    onSave(newReturn);
    setIsSubmitting(false);
    onClose();
    
    // Reset form
    setSelectedPatient('');
    setProcedure('');
    setReturnDate('');
    setOriginalDate('');
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <RotateCcw className="w-5 h-5 mr-2" />
            Novo Retorno
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
            {/* Seleção do Paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paciente *
              </label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Selecione um paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Informações do Paciente Selecionado */}
            {selectedPatientData && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg animate-in fade-in duration-300">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Paciente Selecionado
                </h4>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <p><strong>Nome:</strong> {selectedPatientData.name}</p>
                  <p><strong>Telefone:</strong> {selectedPatientData.phone}</p>
                  {selectedPatientData.email && <p><strong>Email:</strong> {selectedPatientData.email}</p>}
                  {selectedPatientData.lastVisit && (
                    <p><strong>Última Visita:</strong> {new Date(selectedPatientData.lastVisit).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data do Procedimento Original */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data do Procedimento Original *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={originalDate}
                    onChange={(e) => setOriginalDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Data do Retorno */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data do Retorno *
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

            {/* Procedimento/Motivo do Retorno */}
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
                <option value="">Selecione o motivo do retorno</option>
                {procedures.map(proc => (
                  <option key={proc} value={proc}>{proc}</option>
                ))}
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

            {/* Resumo do Retorno */}
            {selectedPatientData && procedure && returnDate && originalDate && (
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg animate-in fade-in duration-300">
                <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Resumo do Retorno
                </h5>
                <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                  <p><strong>Paciente:</strong> {selectedPatientData.name}</p>
                  <p><strong>Procedimento Original:</strong> {new Date(originalDate).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Data do Retorno:</strong> {new Date(returnDate).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Motivo:</strong> {procedure}</p>
                  {notes && <p><strong>Observações:</strong> {notes}</p>}
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