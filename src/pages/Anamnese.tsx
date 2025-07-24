import React, { useState } from 'react';
import { ClipboardList, FileText, Save, Download } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

export default function Anamnese() {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [formData, setFormData] = useState({
    allergies: '',
    medications: '',
    medicalHistory: '',
    dentalHistory: '',
    consent: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anamnese e Consentimento</h1>
          <p className="text-gray-600">Formulário de anamnese digital para pacientes</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" icon={Download}>Gerar PDF</Button>
          <Button icon={Save}>Salvar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Paciente */}
        <div className="lg:col-span-1">
          <Card title="Selecionar Paciente">
            <div className="space-y-4">
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Escolha um paciente</option>
                <option value="1">João Santos</option>
                <option value="2">Maria Oliveira</option>
                <option value="3">Carlos Pereira</option>
              </select>
              
              {selectedPatient && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Paciente Selecionado</h4>
                  <p className="text-blue-700 dark:text-blue-300">João Santos</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">(11) 99999-9999</p>
                </div>
              )}
            </div>
          </Card>

          {/* Histórico de Anamneses */}
          <Card title="Anamneses Anteriores" className="mt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Anamnese Inicial</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">15/01/2024</p>
                </div>
                <Button variant="outline" size="sm" icon={FileText}>Ver</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Formulário de Anamnese */}
        <div className="lg:col-span-2">
          <Card title="Formulário de Anamnese">
            <div className="space-y-6">
              {/* Alergias */}
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

              {/* Medicamentos */}
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

              {/* Histórico Médico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Histórico Médico (doenças, cirurgias, tratamentos)
                </label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Descreva o histórico médico do paciente"
                />
              </div>

              {/* Histórico Odontológico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Histórico Odontológico (tratamentos anteriores, problemas bucais)
                </label>
                <textarea
                  value={formData.dentalHistory}
                  onChange={(e) => handleInputChange('dentalHistory', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Descreva o histórico odontológico do paciente"
                />
              </div>

              {/* Questões Específicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Questões Específicas</h4>
                  
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Diabetes</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Hipertensão</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Problemas cardíacos</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Está grávida</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Sintomas Atuais</h4>
                  
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Dor de dente</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Sangramento gengival</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Sensibilidade</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Mau hálito</span>
                  </label>
                </div>
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
                    className="mt-1"
                  />
                  <span className="text-sm">
                    <strong>Concordo com os termos acima</strong> e autorizo o início do tratamento.
                    Data: {new Date().toLocaleDateString('pt-BR')}
                  </span>
                </label>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}