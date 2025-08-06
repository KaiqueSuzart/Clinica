import React, { useState } from 'react';
import { X, ClipboardList, Save, AlertTriangle } from 'lucide-react';
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
    medications: '',
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

  if (!isOpen) return null;

  const CheckboxWithNotes = ({ 
    field, 
    label, 
    checked, 
    notes, 
    onCheckChange, 
    onNotesChange 
  }: {
    field: string;
    label: string;
    checked: boolean;
    notes: string;
    onCheckChange: (checked: boolean) => void;
    onNotesChange: (notes: string) => void;
  }) => (
    <div className="space-y-2">
      <label className={`flex items-center space-x-2 cursor-pointer ${
        notes ? 'text-red-600 dark:text-red-400 font-medium' : ''
      }`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
        />
        <span className="text-sm flex items-center">
          {label}
          {notes && <AlertTriangle className="w-4 h-4 ml-1 text-red-500" />}
        </span>
      </label>
      {checked && (
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 animate-in slide-in-from-top-4 duration-200 ${
            notes ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder={`Descreva detalhes sobre ${label.toLowerCase()}...`}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Possui alguma alergia? (medicamentos, alimentos, materiais)
                  </label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Descreva as alergias ou digite 'Não possui'"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Faz uso de algum medicamento?
                  </label>
                  <textarea
                    value={formData.medications}
                    onChange={(e) => handleInputChange('medications', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Liste os medicamentos em uso ou digite 'Não faz uso'"
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
                  <CheckboxWithNotes
                    field="diabetes"
                    label="Diabetes"
                    checked={formData.diabetes}
                    notes={formData.diabetesNotes}
                    onCheckChange={(checked) => handleCheckboxChange('diabetes', checked)}
                    onNotesChange={(notes) => handleInputChange('diabetesNotes', notes)}
                  />
                  
                  <CheckboxWithNotes
                    field="hypertension"
                    label="Hipertensão"
                    checked={formData.hypertension}
                    notes={formData.hypertensionNotes}
                    onCheckChange={(checked) => handleCheckboxChange('hypertension', checked)}
                    onNotesChange={(notes) => handleInputChange('hypertensionNotes', notes)}
                  />
                  
                  <CheckboxWithNotes
                    field="heartProblems"
                    label="Problemas cardíacos"
                    checked={formData.heartProblems}
                    notes={formData.heartProblemsNotes}
                    onCheckChange={(checked) => handleCheckboxChange('heartProblems', checked)}
                    onNotesChange={(notes) => handleInputChange('heartProblemsNotes', notes)}
                  />
                  
                  <CheckboxWithNotes
                    field="pregnant"
                    label="Está grávida"
                    checked={formData.pregnant}
                    notes={formData.pregnantNotes}
                    onCheckChange={(checked) => handleCheckboxChange('pregnant', checked)}
                    onNotesChange={(notes) => handleInputChange('pregnantNotes', notes)}
                  />
                </div>

                <div className="space-y-4">
                  <CheckboxWithNotes
                    field="smoking"
                    label="Fumante"
                    checked={formData.smoking}
                    notes={formData.smokingNotes}
                    onCheckChange={(checked) => handleCheckboxChange('smoking', checked)}
                    onNotesChange={(notes) => handleInputChange('smokingNotes', notes)}
                  />
                  
                  <CheckboxWithNotes
                    field="alcohol"
                    label="Consome álcool regularmente"
                    checked={formData.alcohol}
                    notes={formData.alcoholNotes}
                    onCheckChange={(checked) => handleCheckboxChange('alcohol', checked)}
                    onNotesChange={(notes) => handleInputChange('alcoholNotes', notes)}
                  />
                  
                  <CheckboxWithNotes
                    field="anesthesiaReaction"
                    label="Reação à anestesia"
                    checked={formData.anesthesiaReaction}
                    notes={formData.anesthesiaReactionNotes}
                    onCheckChange={(checked) => handleCheckboxChange('anesthesiaReaction', checked)}
                    onNotesChange={(notes) => handleInputChange('anesthesiaReactionNotes', notes)}
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
                  <CheckboxWithNotes
                    field="toothache"
                    label="Dor de dente"
                    checked={formData.toothache}
                    notes={formData.toothacheNotes}
                    onCheckChange={(checked) => handleCheckboxChange('toothache', checked)}
                    onNotesChange={(notes) => handleInputChange('toothacheNotes', notes)}
                  />
                  
                  <CheckboxWithNotes
                    field="gumBleeding"
                    label="Sangramento gengival"
                    checked={formData.gumBleeding}
                    notes={formData.gumBleedingNotes}
                    onCheckChange={(checked) => handleCheckboxChange('gumBleeding', checked)}
                    onNotesChange={(notes) => handleInputChange('gumBleedingNotes', notes)}
                  />
                  
                  <CheckboxWithNotes
                    field="sensitivity"
                    label="Sensibilidade"
                    checked={formData.sensitivity}
                    notes={formData.sensitivityNotes}
                    onCheckChange={(checked) => handleCheckboxChange('sensitivity', checked)}
                    onNotesChange={(notes) => handleInputChange('sensitivityNotes', notes)}
                  />
                </div>

                <div className="space-y-4">
                  <CheckboxWithNotes
                    field="badBreath"
                    label="Mau hálito"
                    checked={formData.badBreath}
                    notes={formData.badBreathNotes}
                    onCheckChange={(checked) => handleCheckboxChange('badBreath', checked)}
                    onNotesChange={(notes) => handleInputChange('badBreathNotes', notes)}
                  />
                  
                  <CheckboxWithNotes
                    field="jawPain"
                    label="Dor na mandíbula/ATM"
                    checked={formData.jawPain}
                    notes={formData.jawPainNotes}
                    onCheckChange={(checked) => handleCheckboxChange('jawPain', checked)}
                    onNotesChange={(notes) => handleInputChange('jawPainNotes', notes)}
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
                  <CheckboxWithNotes
                    field="previousTreatments"
                    label="Tratamentos anteriores"
                    checked={formData.previousTreatments}
                    notes={formData.previousTreatmentsNotes}
                    onCheckChange={(checked) => handleCheckboxChange('previousTreatments', checked)}
                    onNotesChange={(notes) => handleInputChange('previousTreatmentsNotes', notes)}
                  />
                  
                  <CheckboxWithNotes
                    field="orthodontics"
                    label="Uso de aparelho ortodôntico"
                    checked={formData.orthodontics}
                    notes={formData.orthodonticsNotes}
                    onCheckChange={(checked) => handleCheckboxChange('orthodontics', checked)}
                    onNotesChange={(notes) => handleInputChange('orthodonticsNotes', notes)}
                  />
                </div>

                <div className="space-y-4">
                  <CheckboxWithNotes
                    field="surgeries"
                    label="Cirurgias bucais"
                    checked={formData.surgeries}
                    notes={formData.surgeriesNotes}
                    onCheckChange={(checked) => handleCheckboxChange('surgeries', checked)}
                    onNotesChange={(notes) => handleInputChange('surgeriesNotes', notes)}
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