import React, { useState } from 'react';
import { ClipboardList, FileText, Save, Download, Search, User, MessageSquare, StickyNote } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import { patients } from '../data/mockData';

export default function Anamnese() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    allergies: '',
    medications: '',
    medicalHistory: '',
    dentalHistory: '',
    consent: false,
    // Questões específicas
    diabetes: false,
    hypertension: false,
    heartProblems: false,
    pregnant: false,
    smoking: false,
    alcohol: false,
    // Sintomas atuais
    toothache: false,
    gumBleeding: false,
    sensitivity: false,
    badBreath: false,
    jawPain: false,
    // Histórico odontológico específico
    previousTreatments: false,
    orthodontics: false,
    surgeries: false,
    anesthesiaReaction: false
  });

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId);
    // Reset form when selecting new patient
    setFormData({
      allergies: '',
      medications: '',
      medicalHistory: '',
      dentalHistory: '',
      consent: false,
      diabetes: false,
      hypertension: false,
      heartProblems: false,
      pregnant: false,
      smoking: false,
      alcohol: false,
      toothache: false,
      gumBleeding: false,
      sensitivity: false,
      badBreath: false,
      jawPain: false,
      previousTreatments: false,
      orthodontics: false,
      surgeries: false,
      anesthesiaReaction: false
    });
  };

  const handleSave = () => {
    if (!selectedPatient) {
      alert('Selecione um paciente primeiro');
      return;
    }
    
    console.log('Anamnese salva:', {
      patientId: selectedPatient,
      ...formData,
      createdAt: new Date().toISOString()
    });
    
    alert('Anamnese salva com sucesso!');
  };

  const handleGeneratePDF = () => {
    if (!selectedPatient) {
      alert('Selecione um paciente primeiro');
      return;
    }
    
    alert(`PDF da anamnese de ${selectedPatientData?.name} será gerado`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Anamnese e Consentimento</h1>
          <p className="text-gray-600 dark:text-gray-400">Formulário de anamnese digital para pacientes</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" icon={Download} onClick={handleGeneratePDF}>
            Gerar PDF
          </Button>
          <Button icon={Save} onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Pacientes */}
        <div className="lg:col-span-1">
          <Card title="Lista de Pacientes" subtitle={`${filteredPatients.length} pacientes`}>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPatient === patient.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{patient.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{patient.phone}</p>
                    </div>
                    <StatusBadge status={patient.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Histórico de Anamneses */}
          {selectedPatientData && (
            <Card title="Anamneses Anteriores" className="mt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Anamnese Inicial</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">15/01/2024</p>
                  </div>
                  <Button variant="outline" size="sm" icon={FileText}>Ver</Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Formulário de Anamnese */}
        <div className="lg:col-span-2">
          {selectedPatientData ? (
            <Card title={`Formulário de Anamnese - ${selectedPatientData.name}`}>
              <div className="space-y-6">
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
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.diabetes}
                          onChange={(e) => handleInputChange('diabetes', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Diabetes</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.hypertension}
                          onChange={(e) => handleInputChange('hypertension', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Hipertensão</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.heartProblems}
                          onChange={(e) => handleInputChange('heartProblems', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Problemas cardíacos</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.pregnant}
                          onChange={(e) => handleInputChange('pregnant', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Está grávida</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.smoking}
                          onChange={(e) => handleInputChange('smoking', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Fumante</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.alcohol}
                          onChange={(e) => handleInputChange('alcohol', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Consome álcool regularmente</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.anesthesiaReaction}
                          onChange={(e) => handleInputChange('anesthesiaReaction', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Reação à anestesia</span>
                      </label>
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
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.toothache}
                          onChange={(e) => handleInputChange('toothache', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Dor de dente</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.gumBleeding}
                          onChange={(e) => handleInputChange('gumBleeding', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Sangramento gengival</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.sensitivity}
                          onChange={(e) => handleInputChange('sensitivity', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Sensibilidade</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.badBreath}
                          onChange={(e) => handleInputChange('badBreath', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Mau hálito</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.jawPain}
                          onChange={(e) => handleInputChange('jawPain', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Dor na mandíbula/ATM</span>
                      </label>
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
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.previousTreatments}
                          onChange={(e) => handleInputChange('previousTreatments', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Tratamentos anteriores</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.orthodontics}
                          onChange={(e) => handleInputChange('orthodontics', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Uso de aparelho ortodôntico</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.surgeries}
                          onChange={(e) => handleInputChange('surgeries', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-2" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Cirurgias bucais</span>
                      </label>
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
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Concordo com os termos acima</strong> e autorizo o início do tratamento.
                      Data: {new Date().toLocaleDateString('pt-BR')}
                    </span>
                  </label>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Selecione um paciente</h3>
                <p>Escolha um paciente da lista para preencher a anamnese</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}