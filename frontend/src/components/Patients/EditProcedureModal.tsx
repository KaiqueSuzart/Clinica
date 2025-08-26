import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, CheckCircle } from 'lucide-react';
import Button from '../UI/Button';

interface EditProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (procedureId: string, updates: {
    completionDate: string;
    description: string;
    status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  }) => void;
  procedure: {
    id: string;
    procedure: string;
    description?: string;
    tooth?: string;
    status: string;
    completionDate?: string;
  };
}

export default function EditProcedureModal({
  isOpen,
  onClose,
  onSave,
  procedure
}: EditProcedureModalProps) {
  const [completionDate, setCompletionDate] = useState(procedure.completionDate || '');
  const [description, setDescription] = useState(procedure.description || '');
  const [status, setStatus] = useState(procedure.status);

  useEffect(() => {
    if (isOpen && procedure) {
      setCompletionDate(procedure.completionDate || '');
      setDescription(procedure.description || '');
      setStatus(procedure.status);
    }
  }, [isOpen, procedure]);

  const handleSave = () => {
    if (!completionDate.trim()) {
      alert('Por favor, informe a data de realização');
      return;
    }

    onSave(procedure.id, {
      completionDate,
      description,
      status
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Editar Procedimento
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Nome do Procedimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Procedimento
            </label>
            <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {procedure.procedure}
              </span>
              {procedure.tooth && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  (Dente: {procedure.tooth})
                </span>
              )}
            </div>
          </div>

          {/* Data de Realização */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data de Realização *
            </label>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Descrição do que foi realizado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Descrição do que foi realizado
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o que foi realizado no procedimento..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'planejado' | 'em_andamento' | 'concluido' | 'cancelado')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="planejado">Planejado</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
