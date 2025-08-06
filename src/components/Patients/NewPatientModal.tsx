import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Save } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: any) => void;
}

export default function NewPatientModal({ isOpen, onClose, onSave }: NewPatientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    observations: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePhoneChange = (field: string, value: string) => {
    const formatted = formatPhone(value);
    handleInputChange(field, formatted);
  };

  const validateForm = () => {
    return formData.name.trim() && formData.phone.trim() && formData.birthDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newPatient = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      birthDate: formData.birthDate,
      address: formData.address,
      status: 'ativo',
      files: [],
      procedures: [],
      notes: [],
      timeline: [
        {
          id: Date.now().toString(),
          patientId: Date.now().toString(),
          type: 'nota',
          title: 'Paciente Cadastrado',
          description: 'Novo paciente cadastrado no sistema',
          date: new Date().toISOString(),
          professional: 'Sistema'
        }
      ]
    };

    onSave(newPatient);
    setIsSubmitting(false);
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      birthDate: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      observations: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Novo Paciente
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
            {/* Informações Básicas */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informações Básicas
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange('phone', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data de Nascimento *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Endereço
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={2}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Rua, número, bairro, cidade - CEP"
                  />
                </div>
              </div>
            </div>

            {/* Contato de Emergência */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Contato de Emergência
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Contato
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Nome do responsável"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefone de Emergência
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => handlePhoneChange('emergencyPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações Iniciais
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Informações importantes sobre o paciente..."
              />
            </div>

            {/* Resumo do Paciente */}
            {formData.name && formData.phone && formData.birthDate && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg animate-in fade-in duration-300">
                <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Resumo do Cadastro
                </h5>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <p><strong>Nome:</strong> {formData.name}</p>
                  <p><strong>Telefone:</strong> {formData.phone}</p>
                  {formData.email && <p><strong>Email:</strong> {formData.email}</p>}
                  <p><strong>Data de Nascimento:</strong> {new Date(formData.birthDate).toLocaleDateString('pt-BR')}</p>
                  {formData.address && <p><strong>Endereço:</strong> {formData.address}</p>}
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
              Cadastrar Paciente
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}