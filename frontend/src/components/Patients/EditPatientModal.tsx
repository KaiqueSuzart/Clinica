import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Save } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  onSave: (patient: any) => void;
}

export default function EditPatientModal({ isOpen, onClose, patient, onSave }: EditPatientModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    Cpf: '',
    Email: '',
    data_nascimento: '',
    address: '',
    responsavel_nome: '',
    responsavel_telefone: '',
    observacoes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados do paciente quando o modal abrir
  useEffect(() => {
    console.log('🔍 EditPatientModal - Dados recebidos:', patient);
    if (patient) {
      // Extrair número do telefone (remover 55 e @s.whatsapp.net)
      let phoneDisplay = patient.telefone || '';
      if (phoneDisplay.includes('@s.whatsapp.net')) {
        phoneDisplay = phoneDisplay.replace('@s.whatsapp.net', '').replace(/^55/, '');
      }
      
      // Fazer o mesmo para telefone de emergência
      let emergencyPhoneDisplay = patient.responsavel_telefone || '';
      if (emergencyPhoneDisplay.includes('@s.whatsapp.net')) {
        emergencyPhoneDisplay = emergencyPhoneDisplay.replace('@s.whatsapp.net', '').replace(/^55/, '');
      }

      // Formatar CPF para exibição (se vier apenas números, formatar com pontos e traços)
      let cpfDisplay = '';
      if (patient.Cpf) {
        const cpfNumbers = patient.Cpf.toString().replace(/\D/g, '');
        if (cpfNumbers.length === 11) {
          cpfDisplay = cpfNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else {
          cpfDisplay = patient.Cpf.toString();
        }
      }

      const formattedData = {
        nome: patient.nome || '',
        telefone: phoneDisplay,
        Cpf: cpfDisplay,
        Email: patient.Email || '',
        data_nascimento: patient.data_nascimento ? patient.data_nascimento.split('T')[0] : '',
        address: patient.address || '',
        responsavel_nome: patient.responsavel_nome || '',
        responsavel_telefone: emergencyPhoneDisplay,
        observacoes: patient.observacoes || ''
      };
      console.log('📝 EditPatientModal - Dados formatados:', formattedData);
      setFormData(formattedData);
    }
  }, [patient]);

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

  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara 999.999.999-99
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const handlePhoneChange = (field: string, value: string) => {
    const formatted = formatPhone(value);
    handleInputChange(field, formatted);
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    handleInputChange('Cpf', formatted);
  };

  // Validação completa de CPF (dígitos verificadores)
  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.substring(10, 11))) return false;
    
    return true;
  };

  // Validação de telefone
  const validatePhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  };

  const validateForm = () => {
    const nameValid = formData.nome.trim().length >= 2;
    const phoneValid = validatePhone(formData.telefone);
    const cpfValid = validateCPF(formData.Cpf);
    const birthDateValid = !!formData.data_nascimento;
    
    if (!nameValid) {
      alert('Nome deve ter pelo menos 2 caracteres');
      return false;
    }
    if (!phoneValid) {
      alert('Telefone inválido. Use DDD + número (10 ou 11 dígitos)');
      return false;
    }
    if (!cpfValid) {
      alert('CPF inválido. Verifique os dígitos');
      return false;
    }
    if (!birthDateValid) {
      alert('Data de nascimento é obrigatória');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Formatar telefone para WhatsApp: 55{numero}@s.whatsapp.net
    const phoneNumbers = formData.telefone.replace(/\D/g, '');
    const whatsappNumber = `55${phoneNumbers}@s.whatsapp.net`;
    
    // Formatar telefone de emergência
    const emergencyWhatsapp = formData.responsavel_telefone 
      ? `55${formData.responsavel_telefone.replace(/\D/g, '')}@s.whatsapp.net`
      : '';

    const updatedPatient = {
      ...patient,
      nome: formData.nome,
      telefone: whatsappNumber,
      Cpf: formData.Cpf ? parseInt(formData.Cpf.replace(/\D/g, '')) : null,
      Email: formData.Email,
      data_nascimento: formData.data_nascimento,
      address: formData.address,
      responsavel_nome: formData.responsavel_nome,
      responsavel_telefone: emergencyWhatsapp,
      observacoes: formData.observacoes
    };

    onSave(updatedPatient);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Editar Paciente
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
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
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
                      value={formData.telefone}
                      onChange={(e) => handlePhoneChange('telefone', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CPF *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.Cpf}
                      onChange={(e) => handleCPFChange(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
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
                      value={formData.data_nascimento}
                      onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                      value={formData.Email}
                      onChange={(e) => handleInputChange('Email', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="email@exemplo.com"
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
                    value={formData.responsavel_nome}
                    onChange={(e) => handleInputChange('responsavel_nome', e.target.value)}
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
                    value={formData.responsavel_telefone}
                    onChange={(e) => handlePhoneChange('responsavel_telefone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Informações importantes sobre o paciente..."
              />
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
              disabled={!validateForm()}
              icon={Save}
            >
              Salvar Alterações
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}