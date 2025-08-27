import React, { useState, useEffect } from 'react';
import { X, ClipboardList, Save, MessageSquare } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';
import { apiService, AnamneseData } from '../../services/api';

interface AnamneseModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: number;
  onSave: (anamneseData: AnamneseData) => void;
  existingAnamnese?: AnamneseData;
  onAddAnnotation?: (annotation: { content: string; category: string }) => void;
}

export default function AnamneseModal({ isOpen, onClose, patientName, patientId, onSave, existingAnamnese, onAddAnnotation }: AnamneseModalProps) {
  console.log('🎭 AnamneseModal renderizado:', { isOpen, patientName, patientId, existingAnamnese });
  
  const [formData, setFormData] = useState({
    alergias: '',
    medicamentos_uso: '',
    historico_medico: '',
    historico_odontologico: '',
    habitos: '',
    queixa_principal: '',
    consentimento: false,
    data_consentimento: '',
    diabetes: false,
    diabetes_notes: '',
    hypertension: false,
    hypertension_notes: '',
    heart_problems: false,
    heart_problems_notes: '',
    pregnant: false,
    pregnant_notes: '',
    smoking: false,
    smoking_notes: '',
    alcohol: false,
    alcohol_notes: '',
    toothache: false,
    toothache_notes: '',
    gum_bleeding: false,
    gum_bleeding_notes: '',
    sensitivity: false,
    sensitivity_notes: '',
    bad_breath: false,
    bad_breath_notes: '',
    jaw_pain: false,
    jaw_pain_notes: '',
    previous_treatments: false,
    previous_treatments_notes: '',
    orthodontics: false,
    orthodontics_notes: '',
    surgeries: false,
    surgeries_notes: '',
    anesthesia_reaction: false,
    anesthesia_reaction_notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importantNotes, setImportantNotes] = useState<string[]>([]);
  const [activeNotifications, setActiveNotifications] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (existingAnamnese) {
      setFormData({
        alergias: existingAnamnese.alergias || '',
        medicamentos_uso: existingAnamnese.medicamentos_uso || '',
        historico_medico: existingAnamnese.historico_medico || '',
        historico_odontologico: existingAnamnese.historico_odontologico || '',
        habitos: existingAnamnese.habitos || '',
        queixa_principal: existingAnamnese.queixa_principal || '',
        consentimento: existingAnamnese.consentimento || false,
        data_consentimento: existingAnamnese.data_consentimento || '',
        diabetes: existingAnamnese.diabetes || false,
        diabetes_notes: existingAnamnese.diabetes_notes || '',
        hypertension: existingAnamnese.hypertension || false,
        hypertension_notes: existingAnamnese.hypertension_notes || '',
        heart_problems: existingAnamnese.heart_problems || false,
        heart_problems_notes: existingAnamnese.heart_problems_notes || '',
        pregnant: existingAnamnese.pregnant || false,
        pregnant_notes: existingAnamnese.pregnant_notes || '',
        smoking: existingAnamnese.smoking || false,
        smoking_notes: existingAnamnese.smoking_notes || '',
        alcohol: existingAnamnese.alcohol || false,
        alcohol_notes: existingAnamnese.alcohol_notes || '',
        toothache: existingAnamnese.toothache || false,
        toothache_notes: existingAnamnese.toothache_notes || '',
        gum_bleeding: existingAnamnese.gum_bleeding || false,
        gum_bleeding_notes: existingAnamnese.gum_bleeding_notes || '',
        sensitivity: existingAnamnese.sensitivity || false,
        sensitivity_notes: existingAnamnese.sensitivity_notes || '',
        bad_breath: existingAnamnese.bad_breath || false,
        bad_breath_notes: existingAnamnese.bad_breath_notes || '',
        jaw_pain: existingAnamnese.jaw_pain || false,
        jaw_pain_notes: existingAnamnese.jaw_pain_notes || '',
        previous_treatments: existingAnamnese.previous_treatments || false,
        previous_treatments_notes: existingAnamnese.previous_treatments_notes || '',
        orthodontics: existingAnamnese.orthodontics || false,
        orthodontics_notes: existingAnamnese.orthodontics_notes || '',
        surgeries: existingAnamnese.surgeries || false,
        surgeries_notes: existingAnamnese.surgeries_notes || '',
        anesthesia_reaction: existingAnamnese.anesthesia_reaction || false,
        anesthesia_reaction_notes: existingAnamnese.anesthesia_reaction_notes || ''
      });
    }
  }, [existingAnamnese]);

  // Debug: monitorar mudanças no estado
  useEffect(() => {
    console.log('🔄 Estado do formulário atualizado:', formData);
  }, [formData]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked,
      [`${field}_notes`]: checked ? prev[`${field}_notes` as keyof typeof prev] : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Iniciando salvamento da anamnese...');
    console.log('📋 Dados do formulário:', formData);
    console.log('🆔 ID do paciente:', patientId, 'Tipo:', typeof patientId);
    console.log('✅ Consentimento:', formData.consentimento);
    
    // Verificar se o patientId é válido
    if (!patientId || typeof patientId !== 'number') {
      console.error('❌ ID do paciente inválido:', patientId);
      setError('ID do paciente inválido');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const anamneseData: AnamneseData = {
        cliente_id: patientId,
        ...formData,
        data_consentimento: formData.consentimento ? formData.data_consentimento || new Date().toISOString().split('T')[0] : undefined
      };

      console.log('📤 Dados para enviar para API:', anamneseData);
      console.log('🔄 Anamnese existente?', existingAnamnese?.id ? 'Sim' : 'Não');

      let savedAnamnese: AnamneseData;
      
      if (existingAnamnese?.id) {
        console.log('🔄 Atualizando anamnese existente...');
        savedAnamnese = await apiService.updateAnamnese(existingAnamnese.id, anamneseData);
        console.log('✅ Anamnese atualizada:', savedAnamnese);
      } else {
        console.log('🆕 Criando nova anamnese...');
        savedAnamnese = await apiService.createAnamnese(anamneseData);
        console.log('✅ Nova anamnese criada:', savedAnamnese);
      }

      console.log('🎉 Salvamento bem-sucedido!');
      onSave(savedAnamnese);
      onClose();
    } catch (err) {
      console.error('❌ Erro ao salvar anamnese:', err);
      console.error('🔍 Detalhes do erro:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(`Erro ao salvar anamnese: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addToImportantNotes = (label: string, text: string) => {
    if (text.trim()) {
      const noteContent = `${label}: ${text}`;
      
      // Substituir anotação existente do mesmo campo ou adicionar nova
      setImportantNotes(prev => {
        const filtered = prev.filter(note => !note.startsWith(`${label}:`));
        return [...filtered, noteContent];
      });
      
      // Mostrar notificação contextual para este campo específico
      const fieldKey = label.toLowerCase().replace(/\s+/g, '_');
      setActiveNotifications(prev => ({
        ...prev,
        [fieldKey]: true
      }));
      
      // Remover notificação após 3 segundos
      setTimeout(() => {
        setActiveNotifications(prev => ({
          ...prev,
          [fieldKey]: false
        }));
      }, 3000);
      
      // Se houver callback de anotação, usar para adicionar à aba de anotações
      if (onAddAnnotation) {
        onAddAnnotation({
          content: noteContent,
          category: 'Anamnese'
        });
      }
    }
  };

  // Função para renderizar notificação contextual
  const renderContextualNotification = (fieldKey: string) => {
    if (activeNotifications[fieldKey]) {
      return (
        <div 
          className="mt-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center space-x-2 transition-all duration-300 ease-in-out"
          style={{
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              ✅ Anotado com sucesso!
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Esta informação foi salva nas observações importantes.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            Anamnese - {patientName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6" id="anamnese-form">
          <div className="space-y-6">
            {/* Debug info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
              <p><strong>Debug:</strong> Formulário renderizado</p>
              <p>ID do Paciente: {patientId}</p>
              <p>Consentimento: {formData.consentimento ? 'Sim' : 'Não'}</p>
              <p>Anamnese existente: {existingAnamnese?.id ? 'Sim' : 'Não'}</p>
            </div>
            {/* Informações Gerais */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações Gerais</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Possui alguma alergia? (medicamentos, alimentos, materiais)
                  </label>
                  <div className="flex space-x-2">
                    <textarea
                      value={formData.alergias}
                      onChange={(e) => handleInputChange('alergias', e.target.value)}
                      rows={3}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Descreva sobre alergias..."
                    />
                    <button
                      type="button"
                      onClick={() => addToImportantNotes('Alergias', formData.alergias)}
                      disabled={!formData.alergias.trim()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">Anotar</span>
                    </button>
                  </div>
                  {renderContextualNotification('alergias')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Faz uso de algum medicamento?
                  </label>
                  <div className="flex space-x-2">
                    <textarea
                      value={formData.medicamentos_uso}
                      onChange={(e) => handleInputChange('medicamentos_uso', e.target.value)}
                      rows={3}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Descreva sobre medicamentos..."
                    />
                    <button
                      type="button"
                      onClick={() => addToImportantNotes('Medicamentos', formData.medicamentos_uso)}
                      disabled={!formData.medicamentos_uso.trim()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">Anotar</span>
                    </button>
                  </div>
                  {renderContextualNotification('medicamentos')}
                </div>
              </div>
            </div>

            {/* Condições Médicas */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Condições Médicas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.diabetes}
                        onChange={(e) => handleCheckboxChange('diabetes', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Diabetes</span>
                    </label>
                    {formData.diabetes && (
                      <div>
                        <div className="flex space-x-2">
                          <textarea
                            value={formData.diabetes_notes}
                            onChange={(e) => handleInputChange('diabetes_notes', e.target.value)}
                            rows={2}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Detalhes sobre diabetes..."
                          />
                          <button
                            type="button"
                            onClick={() => addToImportantNotes('Diabetes', formData.diabetes_notes)}
                            disabled={!formData.diabetes_notes.trim()}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm">Anotar</span>
                          </button>
                        </div>
                        {renderContextualNotification('diabetes')}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.hypertension}
                        onChange={(e) => handleCheckboxChange('hypertension', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hipertensão</span>
                    </label>
                    {formData.hypertension && (
                      <div>
                        <div className="flex space-x-2">
                          <textarea
                            value={formData.hypertension_notes}
                            onChange={(e) => handleInputChange('hypertension_notes', e.target.value)}
                            rows={2}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Detalhes sobre hipertensão..."
                          />
                          <button
                            type="button"
                            onClick={() => addToImportantNotes('Hipertensão', formData.hypertension_notes)}
                            disabled={!formData.hypertension_notes.trim()}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm">Anotar</span>
                          </button>
                        </div>
                        {renderContextualNotification('hipertensão')}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.heart_problems}
                        onChange={(e) => handleCheckboxChange('heart_problems', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Problemas cardíacos</span>
                    </label>
                    {formData.heart_problems && (
                      <div>
                        <div className="flex space-x-2">
                          <textarea
                            value={formData.heart_problems_notes}
                            onChange={(e) => handleInputChange('heart_problems_notes', e.target.value)}
                            rows={2}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Detalhes sobre problemas cardíacos..."
                          />
                          <button
                            type="button"
                            onClick={() => addToImportantNotes('Problemas Cardíacos', formData.heart_problems_notes)}
                            disabled={!formData.heart_problems_notes.trim()}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm">Anotar</span>
                          </button>
                        </div>
                        {renderContextualNotification('problemas_cardíacos')}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.pregnant}
                        onChange={(e) => handleCheckboxChange('pregnant', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Está grávida</span>
                    </label>
                    {formData.pregnant && (
                      <div className="flex space-x-2">
                        <textarea
                          value={formData.pregnant_notes}
                          onChange={(e) => handleInputChange('pregnant_notes', e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Detalhes sobre gravidez..."
                        />
                        <button
                          type="button"
                          onClick={() => addToImportantNotes('Gravidez', formData.pregnant_notes)}
                          disabled={!formData.pregnant_notes.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Anotar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.smoking}
                        onChange={(e) => handleCheckboxChange('smoking', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fumante</span>
                    </label>
                    {formData.smoking && (
                      <div className="flex space-x-2">
                        <textarea
                          value={formData.smoking_notes}
                          onChange={(e) => handleInputChange('smoking_notes', e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Detalhes sobre tabagismo..."
                        />
                        <button
                          type="button"
                          onClick={() => addToImportantNotes('Tabagismo', formData.smoking_notes)}
                          disabled={!formData.smoking_notes.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Anotar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.alcohol}
                        onChange={(e) => handleCheckboxChange('alcohol', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Consome álcool regularmente</span>
                    </label>
                    {formData.alcohol && (
                      <div className="flex space-x-2">
                        <textarea
                          value={formData.alcohol_notes}
                          onChange={(e) => handleInputChange('alcohol_notes', e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Detalhes sobre consumo de álcool..."
                        />
                        <button
                          type="button"
                          onClick={() => addToImportantNotes('Consumo de Álcool', formData.alcohol_notes)}
                          disabled={!formData.alcohol_notes.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Anotar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.anesthesia_reaction}
                        onChange={(e) => handleCheckboxChange('anesthesia_reaction', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reação à anestesia</span>
                    </label>
                    {formData.anesthesia_reaction && (
                      <div className="flex space-x-2">
                        <textarea
                          value={formData.anesthesia_reaction_notes}
                          onChange={(e) => handleInputChange('anesthesia_reaction_notes', e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Detalhes sobre reação à anestesia..."
                        />
                        <button
                          type="button"
                          onClick={() => addToImportantNotes('Reação à Anestesia', formData.anesthesia_reaction_notes)}
                          disabled={!formData.anesthesia_reaction_notes.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Anotar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sintomas Atuais */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Sintomas Atuais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.toothache}
                        onChange={(e) => handleCheckboxChange('toothache', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dor de dente</span>
                    </label>
                    {formData.toothache && (
                      <div className="flex space-x-2">
                        <textarea
                          value={formData.toothache_notes}
                          onChange={(e) => handleInputChange('toothache_notes', e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Detalhes sobre dor de dente..."
                        />
                        <button
                          type="button"
                          onClick={() => addToImportantNotes('Dor de Dente', formData.toothache_notes)}
                          disabled={!formData.toothache_notes.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Anotar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.gum_bleeding}
                        onChange={(e) => handleCheckboxChange('gum_bleeding', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sangramento gengival</span>
                    </label>
                    {formData.gum_bleeding && (
                      <div className="flex space-x-2">
                        <textarea
                          value={formData.gum_bleeding_notes}
                          onChange={(e) => handleInputChange('gum_bleeding_notes', e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Detalhes sobre sangramento gengival..."
                        />
                        <button
                          type="button"
                          onClick={() => addToImportantNotes('Sangramento Gengival', formData.gum_bleeding_notes)}
                          disabled={!formData.gum_bleeding_notes.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Anotar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.sensitivity}
                        onChange={(e) => handleCheckboxChange('sensitivity', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sensibilidade</span>
                    </label>
                    {formData.sensitivity && (
                      <div className="flex space-x-2">
                        <textarea
                          value={formData.sensitivity_notes}
                          onChange={(e) => handleInputChange('sensitivity_notes', e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Detalhes sobre sensibilidade..."
                        />
                        <button
                          type="button"
                          onClick={() => addToImportantNotes('Sensibilidade', formData.sensitivity_notes)}
                          disabled={!formData.sensitivity_notes.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Anotar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.bad_breath}
                        onChange={(e) => handleCheckboxChange('bad_breath', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mau hálito</span>
                    </label>
                    {formData.bad_breath && (
                      <div className="flex space-x-2">
                        <textarea
                          value={formData.bad_breath_notes}
                          onChange={(e) => handleInputChange('bad_breath_notes', e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Detalhes sobre mau hálito..."
                        />
                        <button
                          type="button"
                          onClick={() => addToImportantNotes('Mau Hálito', formData.bad_breath_notes)}
                          disabled={!formData.bad_breath_notes.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Anotar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.jaw_pain}
                        onChange={(e) => handleCheckboxChange('jaw_pain', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dor na mandíbula/ATM</span>
                    </label>
                    {formData.jaw_pain && (
                      <div className="flex space-x-2">
                        <textarea
                          value={formData.jaw_pain_notes}
                          onChange={(e) => handleInputChange('jaw_pain_notes', e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Detalhes sobre dor na mandíbula/ATM..."
                        />
                        <button
                          type="button"
                          onClick={() => addToImportantNotes('Dor na Mandíbula/ATM', formData.jaw_pain_notes)}
                          disabled={!formData.jaw_pain_notes.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Anotar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Histórico Odontológico */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Histórico Odontológico</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.previous_treatments}
                        onChange={(e) => handleCheckboxChange('previous_treatments', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tratamentos anteriores</span>
                    </label>
                    {formData.previous_treatments && (
                      <div className="flex space-x-2">
                        <textarea
                          value={formData.previous_treatments_notes}
                          onChange={(e) => handleInputChange('previous_treatments_notes', e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Detalhes sobre tratamentos anteriores..."
                        />
                        <button
                          type="button"
                          onClick={() => addToImportantNotes('Tratamentos Anteriores', formData.previous_treatments_notes)}
                          disabled={!formData.previous_treatments_notes.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Anotar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.orthodontics}
                        onChange={(e) => handleCheckboxChange('orthodontics', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uso de aparelho ortodôntico</span>
                    </label>
                    {formData.orthodontics && (
                      <div className="flex space-x-2">
                        <textarea
                          value={formData.orthodontics_notes}
                          onChange={(e) => handleInputChange('orthodontics_notes', e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Detalhes sobre aparelho ortodôntico..."
                        />
                        <button
                          type="button"
                          onClick={() => addToImportantNotes('Aparelho Ortodôntico', formData.orthodontics_notes)}
                          disabled={!formData.orthodontics_notes.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Anotar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.surgeries}
                        onChange={(e) => handleCheckboxChange('surgeries', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cirurgias bucais</span>
                    </label>
                    {formData.surgeries && (
                      <div className="flex space-x-2">
                        <textarea
                          value={formData.surgeries_notes}
                          onChange={(e) => handleInputChange('surgeries_notes', e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Detalhes sobre cirurgias bucais..."
                        />
                        <button
                          type="button"
                          onClick={() => addToImportantNotes('Cirurgias Bucais', formData.surgeries_notes)}
                          disabled={!formData.surgeries_notes.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Anotar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Histórico Odontológico Geral
                </label>
                <div className="flex space-x-2">
                  <textarea
                    value={formData.historico_odontologico}
                    onChange={(e) => handleInputChange('historico_odontologico', e.target.value)}
                    rows={4}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Descreva outros aspectos do histórico odontológico..."
                  />
                  <button
                    type="button"
                    onClick={() => addToImportantNotes('Histórico Odontológico Geral', formData.historico_odontologico)}
                    disabled={!formData.historico_odontologico.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Anotar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Hábitos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hábitos (escovação, uso de fio dental, etc.)
              </label>
              <div className="flex space-x-2">
                <textarea
                  value={formData.habitos}
                  onChange={(e) => handleInputChange('habitos', e.target.value)}
                  placeholder="Descreva os hábitos de higiene bucal..."
                  rows={3}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => addToImportantNotes('Hábitos', formData.habitos)}
                  disabled={!formData.habitos.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Anotar</span>
                </button>
              </div>
            </div>

            {/* Histórico Médico Geral */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Histórico Médico Geral (doenças, cirurgias, tratamentos)
              </label>
              <div className="flex space-x-2">
                <textarea
                  value={formData.historico_medico}
                  onChange={(e) => handleInputChange('historico_medico', e.target.value)}
                  placeholder="Descreva o histórico médico geral do paciente..."
                  rows={4}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => addToImportantNotes('Histórico Médico Geral', formData.historico_medico)}
                  disabled={!formData.historico_medico.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Anotar</span>
                </button>
              </div>
            </div>

            {/* Queixa Principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Queixa Principal
              </label>
              <div className="flex space-x-2">
                <textarea
                  value={formData.queixa_principal}
                  onChange={(e) => handleInputChange('queixa_principal', e.target.value)}
                  placeholder="Descreva a queixa principal do paciente..."
                  rows={3}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => addToImportantNotes('Queixa Principal', formData.queixa_principal)}
                  disabled={!formData.queixa_principal.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Anotar</span>
                </button>
              </div>
            </div>

            {/* Notas Importantes */}
            {importantNotes.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <h4 className="text-md font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Notas Importantes
                </h4>
                <div className="space-y-2">
                  {importantNotes.map((note, index) => (
                    <div key={index} className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Termo de Consentimento */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Termo de Consentimento</h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Declaro que todas as informações fornecidas são verdadeiras e autorizo o
                  profissional a realizar os procedimentos necessários para meu tratamento.
                  Estou ciente dos riscos e benefícios envolvidos no tratamento proposto.
                </p>
              </div>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.consentimento}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    console.log('🔒 Checkbox consentimento alterado:', checked);
                    handleInputChange('consentimento', checked);
                    if (checked) {
                      const today = new Date().toISOString().split('T')[0];
                      console.log('📅 Definindo data de consentimento:', today);
                      handleInputChange('data_consentimento', today);
                    } else {
                      console.log('❌ Limpando data de consentimento');
                      handleInputChange('data_consentimento', '');
                    }
                  }}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm">
                  <strong>Concordo com os termos acima</strong> e autorizo o início do tratamento.
                  {formData.consentimento && formData.data_consentimento && (
                    <span className="block mt-1 text-blue-600 dark:text-blue-400">
                      Data: {formData.data_consentimento}
                    </span>
                  )}
                </span>
              </label>
            </div>
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
              disabled={!formData.consentimento}
              icon={Save}
              onClick={() => console.log('🖱️ Botão salvar clicado!')}
            >
              Salvar Anamnese {isSubmitting ? '(Salvando...)' : ''}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}