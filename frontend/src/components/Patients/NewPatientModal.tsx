import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Save } from 'lucide-react';
import { apiService, CreatePatientData } from '../../services/api';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: any) => void;
}

export default function NewPatientModal({ isOpen, onClose, onSave }: NewPatientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cpf: '',
    email: '',
    birthDate: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    observations: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validar campo em tempo real quando o usuário digita
    if (touchedFields[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData]);
  };

  const validateField = (field: string, value: string) => {
    const errors = { ...fieldErrors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Nome é obrigatório';
        } else if (value.trim().length < 2) {
          errors.name = 'Nome deve ter pelo menos 2 caracteres';
        } else {
          delete errors.name;
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Telefone é obrigatório';
        } else if (!validatePhone(value)) {
          errors.phone = 'Telefone inválido. Use DDD + número (10 ou 11 dígitos)';
        } else {
          delete errors.phone;
        }
        break;
        
      case 'cpf':
        if (!value.trim()) {
          errors.cpf = 'CPF é obrigatório';
        } else if (!validateCPF(value)) {
          errors.cpf = 'CPF inválido. Verifique os dígitos';
        } else {
          delete errors.cpf;
        }
        break;
        
      case 'birthDate':
        if (!value) {
          errors.birthDate = 'Data de nascimento é obrigatória';
        } else {
          const date = new Date(value);
          const today = new Date();
          if (date > today) {
            errors.birthDate = 'Data de nascimento não pode ser no futuro';
          } else {
            delete errors.birthDate;
          }
        }
        break;
        
      case 'email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors.email = 'Email inválido';
        } else {
          delete errors.email;
        }
        break;
        
      case 'emergencyPhone':
        if (value.trim() && !validatePhone(value)) {
          errors.emergencyPhone = 'Telefone inválido. Use DDD + número (10 ou 11 dígitos)';
        } else {
          delete errors.emergencyPhone;
        }
        break;
        
      default:
        break;
    }
    
    setFieldErrors(errors);
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

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    handleInputChange('cpf', formatted);
  };

  const handlePhoneChange = (field: string, value: string) => {
    const formatted = formatPhone(value);
    handleInputChange(field, formatted);
  };

  // Validação completa de CPF (dígitos verificadores)
  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (numbers.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.substring(10, 11))) return false;
    
    return true;
  };

  // Validação de telefone (mínimo 10 dígitos)
  const validatePhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  };

  // Validação sem atualizar estado (para uso no JSX)
  const isFormValid = () => {
    const nameValid = formData.name.trim().length >= 2;
    const phoneValid = validatePhone(formData.phone);
    const cpfValid = validateCPF(formData.cpf);
    const birthDateValid = !!formData.birthDate;
    
    const isValid = nameValid && phoneValid && cpfValid && birthDateValid;
    
    // Log de debug para entender por que o botão está desabilitado
    if (!isValid) {
      console.log('🔍 Validação do formulário:', {
        nameValid,
        phoneValid,
        cpfValid,
        birthDateValid,
        name: formData.name,
        phone: formData.phone,
        cpf: formData.cpf,
        birthDate: formData.birthDate
      });
    }
    
    return isValid;
  };

  const validateForm = () => {
    // Marcar todos os campos obrigatórios como tocados
    const requiredFields = ['name', 'phone', 'cpf', 'birthDate'];
    const newTouchedFields = { ...touchedFields };
    requiredFields.forEach(field => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(newTouchedFields);
    
    // Validar todos os campos obrigatórios primeiro
    validateField('name', formData.name);
    validateField('phone', formData.phone);
    validateField('cpf', formData.cpf);
    validateField('birthDate', formData.birthDate);
    
    // Validar campos opcionais se preenchidos
    if (formData.email && formData.email.trim()) {
      validateField('email', formData.email);
    }
    if (formData.emergencyPhone && formData.emergencyPhone.trim()) {
      validateField('emergencyPhone', formData.emergencyPhone);
    }
    
    // Verificar validação básica
    const nameValid = formData.name.trim().length >= 2;
    const phoneValid = validatePhone(formData.phone);
    const cpfValid = validateCPF(formData.cpf);
    const birthDateValid = !!formData.birthDate;
    
    const isValid = nameValid && phoneValid && cpfValid && birthDateValid;
    
    if (!isValid) {
      setError('Por favor, corrija os erros no formulário');
    } else {
      setError(null);
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 handleSubmit chamado');
    console.log('📋 Dados do formulário:', formData);
    
    if (!validateForm()) {
      console.log('❌ Validação falhou');
      return;
    }

    console.log('✅ Validação passou, iniciando salvamento...');
    setIsSubmitting(true);
    setError(null);

    try {
      // Formatar telefone para WhatsApp: 55{numero}@s.whatsapp.net
      const phoneNumbers = formData.phone.replace(/\D/g, ''); // Remove formatação
      const whatsappNumber = `55${phoneNumbers}@s.whatsapp.net`;
      
      // Formatar telefone de emergência
      const emergencyWhatsapp = formData.emergencyPhone 
        ? `55${formData.emergencyPhone.replace(/\D/g, '')}@s.whatsapp.net`
        : undefined;

      // Preparar dados para a API
      const patientData: CreatePatientData = {
        nome: formData.name.trim(),
        telefone: whatsappNumber, // Formato WhatsApp
        Cpf: formData.cpf ? parseInt(formData.cpf.replace(/\D/g, '')) : undefined,
        Email: formData.email?.trim() || undefined,
        data_nascimento: formData.birthDate || undefined,
        address: formData.address?.trim() || undefined,
        observacoes: formData.observations?.trim() || undefined,
        responsavel_nome: formData.emergencyContact?.trim() || undefined,
        responsavel_telefone: emergencyWhatsapp,
        status: 'ativo',
        iaativa: true
      };

      console.log('📤 Dados sendo enviados para API:', patientData);
      console.log('📅 Formato da data:', formData.birthDate);

      // Chamar a API para criar o paciente
      console.log('🌐 Chamando apiService.createPatient...');
      const newPatient = await apiService.createPatient(patientData);
      console.log('✅ Paciente criado com sucesso:', newPatient);
      
      // Chamar callback de sucesso
      onSave(newPatient);
      
      // Fechar modal e resetar formulário
      onClose();
      setFormData({
        name: '',
        phone: '',
        cpf: '',
        email: '',
        birthDate: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        observations: ''
      });
      setFieldErrors({});
      setTouchedFields({});
      setError(null);
    } catch (err: any) {
      console.error('❌ Erro completo ao criar paciente:', err);
      console.error('❌ Detalhes do erro:', {
        message: err?.message,
        response: err?.response,
        stack: err?.stack
      });
      
      let errorMessage = 'Erro ao criar paciente. Verifique se o backend está funcionando.';
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log('🏁 handleSubmit finalizado');
    }
  };

  // Resetar erros quando o modal fechar
  useEffect(() => {
    if (!isOpen) {
      setFieldErrors({});
      setTouchedFields({});
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Novo Paciente
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                    fieldErrors.name && touchedFields.name
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Digite o nome completo"
                  required
                />
                {fieldErrors.name && touchedFields.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.name}</p>
                )}
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
                    onBlur={() => handleBlur('phone')}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                      fieldErrors.phone && touchedFields.phone
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                {fieldErrors.phone && touchedFields.phone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CPF *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleCPFChange(e.target.value)}
                    onBlur={() => handleBlur('cpf')}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                      fieldErrors.cpf && touchedFields.cpf
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>
                {fieldErrors.cpf && touchedFields.cpf && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.cpf}</p>
                )}
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
                    onBlur={() => handleBlur('birthDate')}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      fieldErrors.birthDate && touchedFields.birthDate
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                  />
                </div>
                {fieldErrors.birthDate && touchedFields.birthDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.birthDate}</p>
                )}
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
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                      fieldErrors.email && touchedFields.email
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="email@exemplo.com"
                  />
                </div>
                {fieldErrors.email && touchedFields.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Endereço
            </h3>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Digite o endereço completo"
              />
            </div>
          </div>

          {/* Contato de Emergência */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Contato de Emergência
            </h3>
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
                  onBlur={() => handleBlur('emergencyPhone')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                    fieldErrors.emergencyPhone && touchedFields.emergencyPhone
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="(11) 99999-9999"
                />
                {fieldErrors.emergencyPhone && touchedFields.emergencyPhone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.emergencyPhone}</p>
                )}
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

          {/* Exibição de Erro */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Resumo do Paciente */}
          {formData.name && formData.phone && formData.cpf && formData.birthDate && (
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg animate-in fade-in duration-300">
              <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Resumo do Cadastro
              </h5>
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <p><strong>Nome:</strong> {formData.name}</p>
                <p><strong>CPF:</strong> {formData.cpf}</p>
                <p><strong>Telefone:</strong> {formData.phone}</p>
                {formData.email && <p><strong>Email:</strong> {formData.email}</p>}
                <p><strong>Data de Nascimento:</strong> {new Date(formData.birthDate).toLocaleDateString('pt-BR')}</p>
                {formData.address && <p><strong>Endereço:</strong> {formData.address}</p>}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              onClick={(e) => {
                console.log('🔘 Botão clicado!');
                console.log('📋 Estado do formulário:', formData);
                console.log('✅ Formulário válido?', isFormValid());
                console.log('⏳ Está submetendo?', isSubmitting);
                if (!isFormValid()) {
                  e.preventDefault();
                  console.log('❌ Formulário inválido, prevenindo submit');
                  validateForm(); // Mostrar erros
                }
              }}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Paciente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}