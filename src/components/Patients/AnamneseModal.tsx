import React, { useState } from 'react';
import { X, ClipboardList, Save, MessageSquare } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';

interface AnamneseModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
  onSave: (anamneseData: any) => void;
}

export default function AnamneseModal({ isOpen, onClose, patientName, patientId, onSave }: AnamneseModalProps) {
  const [formData, setFormData] = useState({
    allergies: '',
    allergiesNotes: '',
    medications: '',
    medicationsNotes: '',
    medicalHistory: '',
    dentalHistory: '',
    consent: false,
    // Questões específicas com checkboxes
    diabetes: false,
    diabetesNotes: '',
    hypertension: false,
    hypertensionNotes: '',
    heartProblems: false,
    heartProblemsNotes: '',
    pregnant: false,
    pregnantNotes: '',
    smoking: false,
    smokingNotes: '',
    alcohol: false,
    alcoholNotes: '',
    // Sintomas atuais
    toothache: false,
    toothacheNotes: '',
    gumBleeding: false,
    gumBleedingNotes: '',
    sensitivity: false,
    sensitivityNotes: '',
    badBreath: false,
    badBreathNotes: '',
    jawPain: false,
    jawPainNotes: '',
    // Histórico odontológico específico
    previousTreatments: false,
    previousTreatmentsNotes: '',
    orthodontics: false,
    orthodonticsNotes: '',
    surgeries: false,
    surgeriesNotes: '',
    anesthesiaReaction: false,
    anesthesiaReactionNotes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Limpa a anotação se desmarcar o checkbox
      [`${field}Notes`]: checked ? prev[`${field}Notes` as keyof typeof prev] : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    const anamneseData = {
      id: Date.now().toString(),
      patientId,
      ...formData,
      createdAt: new Date().toISOString(),
      consentDate: formData.consent ? new Date().toISOString() : null
    };

    onSave(anamneseData);
    setIsSubmitting(false);
    onClose();
  };

  const hasNotes = (field: string) => {
    return formData[`${field}Notes` as keyof typeof formData] as string;
  };

  const sendToNotes = (field: string, currentValue: string) => {
    if (currentValue.trim()) {
      handleInputChange(`${field}Notes`, currentValue);
      handleInputChange(field, '');
    }
  };

  if (!isOpen) return null;

  const FieldWithNotes = ({ 
    field, 
    label, 
    value,
    notes,
    onValueChange,
    onNotesChange,
    type = 'textarea',
    rows = 3
  }: {
    field: string;
    label: string;
    value: string;
    notes: string;
    onValueChange: (value: string) => void;
    onNotesChange: (notes: string) => void;
    type?: 'textarea' | 'text';
    rows?: number;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      
      <div className="flex space-x-2">
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            rows={rows}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder={`Descreva sobre ${label.toLowerCase()}...`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder={`Descreva sobre ${label.toLowerCase()}...`}
          />
        )}
        
        <button
          type="button"
          onClick={() => sendToNotes(field, value)}
          disabled={!value.trim()}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">Anotar</span>
        </button>
      </div>
      
      {notes && (
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 animate-in slide-in-from-top-4 duration-200"
          placeholder="Anotações importantes..."
          readOnly
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            Anamnese - {patientName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {/* Informações Gerais */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Informações Gerais
              </h4>
              <div className="space-y-4">
                <div>
                  <FieldWithNotes
                    field="allergies"
                    label="Possui alguma alergia? (medicamentos, alimentos, materiais)"
                    value={formData.allergies}
                    notes={formData.allergiesNotes}
                    onValueChange={(value) => handleInputChange('allergies', value)}
                    onNotesChange={(notes) => handleInputChange('allergiesNotes', notes)}
                  />
                </div>

                <div>
                  <FieldWithNotes
                    field="medications"
                    label="Faz uso de algum medicamento?"
                    value={formData.medications}
                    notes={formData.medicationsNotes}
                    onValueChange={(value) => handleInputChange('medications', value)}
                    onNotesChange={(notes) => handleInputChange('medicationsNotes', notes)}
                  />
                </div>
              </div>
            </div>

            {/* Condições Médicas */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Condições Médicas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FieldWithNotes
                    field="diabetes"
                    label="Diabetes"
                    value={formData.diabetes ? 'Sim' : ''}
                    notes={formData.diabetesNotes}
                    onValueChange={(value) => handleInputChange('diabetes', value)}
                    onNotesChange={(notes) => handleInputChange('diabetesNotes', notes)}
                    type="text"
                  />
                  
                  <FieldWithNotes
                    field="hypertension"
                    label="Hipertensão"
                    value={formData.hypertension ? 'Sim' : ''}
                    notes={formData.hypertensionNotes}
                    onValueChange={(value) => handleInputChange('hypertension', value)}
                    onNotesChange={(notes) => handleInputChange('hypertensionNotes', notes)}
                    type="text"
                  />
                  
                  <FieldWithNotes
                    field="heartProblems"
                    label="Problemas cardíacos"
                    value={formData.heartProblems ? 'Sim' : ''}
                    notes={formData.heartProblemsNotes}
                    onValueChange={(value) => handleInputChange('heartProblems', value)}
                    onNotesChange={(notes) => handleInputChange('heartProblemsNotes', notes)}
                    type="text"
                  />
                  
                  <FieldWithNotes
                    field="pregnant"
                    label="Está grávida"
                    value={formData.pregnant ? 'Sim' : ''}
                    notes={formData.pregnantNotes}
                    onValueChange={(value) => handleInputChange('pregnant', value)}
                    onNotesChange={(notes) => handleInputChange('pregnantNotes', notes)}
                    type="text"
                  />
                </div>

                <div className="space-y-4">
                  <FieldWithNotes
                    field="smoking"
                    label="Fumante"
                    value={formData.smoking ? 'Sim' : ''}
                    notes={formData.smokingNotes}
                    onValueChange={(value) => handleInputChange('smoking', value)}
                    onNotesChange={(notes) => handleInputChange('smokingNotes', notes)}
                    type="text"
                  />
                  
                  <FieldWithNotes
                    field="alcohol"
                    label="Consome álcool regularmente"
                    value={formData.alcohol ? 'Sim' : ''}
                    notes={formData.alcoholNotes}
                    onValueChange={(value) => handleInputChange('alcohol', value)}
                    onNotesChange={(notes) => handleInputChange('alcoholNotes', notes)}
                    type="text"
                  />
                  
                  <FieldWithNotes
                    field="anesthesiaReaction"
                    label="Reação à anestesia"
                    value={formData.anesthesiaReaction ? 'Sim' : ''}
                    notes={formData.anesthesiaReactionNotes}
                    onValueChange={(value) => handleInputChange('anesthesiaReaction', value)}
                    onNotesChange={(notes) => handleInputChange('anesthesiaReactionNotes', notes)}
                    type="text"
                  />
                </div>
              </div>
            </div>

            {/* Sintomas Atuais */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Sintomas Atuais
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FieldWithNotes
                    field="toothache"
                    label="Dor de dente"
                    value={formData.toothache ? 'Sim' : ''}
                    notes={formData.toothacheNotes}
                    onValueChange={(value) => handleInputChange('toothache', value)}
                    onNotesChange={(notes) => handleInputChange('toothacheNotes', notes)}
                    type="text"
                  />
                  
                  <FieldWithNotes
                    field="gumBleeding"
                    label="Sangramento gengival"
                    value={formData.gumBleeding ? 'Sim' : ''}
                    notes={formData.gumBleedingNotes}
                    onValueChange={(value) => handleInputChange('gumBleeding', value)}
                    onNotesChange={(notes) => handleInputChange('gumBleedingNotes', notes)}
                    type="text"
                  />
                  
                  <FieldWithNotes
                    field="sensitivity"
                    label="Sensibilidade"
                    value={formData.sensitivity ? 'Sim' : ''}
                    notes={formData.sensitivityNotes}
                    onValueChange={(value) => handleInputChange('sensitivity', value)}
                    onNotesChange={(notes) => handleInputChange('sensitivityNotes', notes)}
                    type="text"
                  />
                </div>

                <div className="space-y-4">
                  <FieldWithNotes
                    field="badBreath"
                    label="Mau hálito"
                    value={formData.badBreath ? 'Sim' : ''}
                    notes={formData.badBreathNotes}
                    onValueChange={(value) => handleInputChange('badBreath', value)}
                    onNotesChange={(notes) => handleInputChange('badBreathNotes', notes)}
                    type="text"
                  />
                  
                  <FieldWithNotes
                    field="jawPain"
                    label="Dor na mandíbula/ATM"
                    value={formData.jawPain ? 'Sim' : ''}
                    notes={formData.jawPainNotes}
                    onValueChange={(value) => handleInputChange('jawPain', value)}
                    onNotesChange={(notes) => handleInputChange('jawPainNotes', notes)}
                    type="text"
                  />
                </div>
              </div>
            </div>

            {/* Histórico Odontológico */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Histórico Odontológico
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FieldWithNotes
                    field="previousTreatments"
                    label="Tratamentos anteriores"
                    value={formData.previousTreatments ? 'Sim' : ''}
                    notes={formData.previousTreatmentsNotes}
                    onValueChange={(value) => handleInputChange('previousTreatments', value)}
                    onNotesChange={(notes) => handleInputChange('previousTreatmentsNotes', notes)}
                    type="text"
                  />
                  
                  <FieldWithNotes
                    field="orthodontics"
                    label="Uso de aparelho ortodôntico"
                    value={formData.orthodontics ? 'Sim' : ''}
                    notes={formData.orthodonticsNotes}
                    onValueChange={(value) => handleInputChange('orthodontics', value)}
                    onNotesChange={(notes) => handleInputChange('orthodonticsNotes', notes)}
                    type="text"
                  />
                </div>

                <div className="space-y-4">
                  <FieldWithNotes
                    field="surgeries"
                    label="Cirurgias bucais"
                    value={formData.surgeries ? 'Sim' : ''}
                    notes={formData.surgeriesNotes}
                    onValueChange={(value) => handleInputChange('surgeries', value)}
                    onNotesChange={(notes) => handleInputChange('surgeriesNotes', notes)}
                    type="text"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Histórico Odontológico Geral
                </label>
                <textarea
                  value={formData.dentalHistory}
                  onChange={(e) => handleInputChange('dentalHistory', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Descreva outros aspectos do histórico odontológico..."
                />
              </div>
            </div>

            {/* Histórico Médico Geral */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Histórico Médico Geral (doenças, cirurgias, tratamentos)
              </label>
              <textarea
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Descreva o histórico médico geral do paciente..."
              />
            </div>

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
                  checked={formData.consent}
                  onChange={(e) => handleInputChange('consent', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm">
                  <strong>Concordo com os termos acima</strong> e autorizo o início do tratamento.
                  Data: {new Date().toLocaleDateString('pt-BR')}
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
              disabled={!formData.consent}
              icon={Save}
            >
              Salvar Anamnese
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}