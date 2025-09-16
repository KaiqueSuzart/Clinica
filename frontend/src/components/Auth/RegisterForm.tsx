import React, { useState } from 'react';

interface RegisterFormProps {
  onRegister: (data: RegisterData) => Promise<void>;
  onRegisterEmpresa: (data: RegisterEmpresaData) => Promise<void>;
  loading?: boolean;
  error?: string;
}

interface RegisterData {
  email: string;
  password: string;
  nome: string;
  empresa_id?: string;
  cargo?: string;
  role?: string;
}

interface RegisterEmpresaData {
  email: string;
  password: string;
  nome: string;
  cargo?: string;
  role?: string;
  nome_empresa: string;
  email_empresa: string;
  cnpj?: string;
  telefone_empresa?: string;
  endereco?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onRegister, 
  onRegisterEmpresa, 
  loading = false, 
  error 
}) => {
  const [isEmpresa, setIsEmpresa] = useState(false);
  const [formData, setFormData] = useState<RegisterData & RegisterEmpresaData>({
    email: '',
    password: '',
    nome: '',
    empresa_id: '',
    cargo: 'funcionario',
    role: 'user',
    nome_empresa: '',
    email_empresa: '',
    cnpj: '',
    telefone_empresa: '',
    endereco: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (!formData.email || !formData.password || !formData.nome) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (isEmpresa) {
        await onRegisterEmpresa(formData as RegisterEmpresaData);
      } else {
        await onRegister(formData as RegisterData);
      }
    } catch (err) {
      console.error('Erro no registro:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Criar nova conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestão Odontológica
          </p>
        </div>

        {/* Toggle entre registro de usuário e empresa */}
        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setIsEmpresa(false)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border ${
              !isEmpresa
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Usuário
          </button>
          <button
            type="button"
            onClick={() => setIsEmpresa(true)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md border ${
              isEmpresa
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Nova Empresa
          </button>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Dados do usuário */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dados do Usuário</h3>
              
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  Nome Completo *
                </label>
                <input
                  id="nome"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Senha *
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">
                  Cargo
                </label>
                <select
                  id="cargo"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.cargo}
                  onChange={(e) => handleInputChange('cargo', e.target.value)}
                  disabled={loading}
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="dentista">Dentista</option>
                  <option value="recepcionista">Recepcionista</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            {/* Dados da empresa (apenas se isEmpresa = true) */}
            {isEmpresa && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900">Dados da Empresa</h3>
                
                <div>
                  <label htmlFor="nome_empresa" className="block text-sm font-medium text-gray-700">
                    Nome da Empresa *
                  </label>
                  <input
                    id="nome_empresa"
                    type="text"
                    required={isEmpresa}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Nome da clínica/empresa"
                    value={formData.nome_empresa}
                    onChange={(e) => handleInputChange('nome_empresa', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="email_empresa" className="block text-sm font-medium text-gray-700">
                    Email da Empresa *
                  </label>
                  <input
                    id="email_empresa"
                    type="email"
                    required={isEmpresa}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="contato@empresa.com"
                    value={formData.email_empresa}
                    onChange={(e) => handleInputChange('email_empresa', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
                    CNPJ
                  </label>
                  <input
                    id="cnpj"
                    type="text"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="00.000.000/0001-00"
                    value={formData.cnpj}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="telefone_empresa" className="block text-sm font-medium text-gray-700">
                    Telefone da Empresa
                  </label>
                  <input
                    id="telefone_empresa"
                    type="tel"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone_empresa}
                    onChange={(e) => handleInputChange('telefone_empresa', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                    Endereço
                  </label>
                  <textarea
                    id="endereco"
                    rows={3}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Endereço completo da empresa"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Se não for empresa, mostrar campo de empresa_id */}
            {!isEmpresa && (
              <div>
                <label htmlFor="empresa_id" className="block text-sm font-medium text-gray-700">
                  ID da Empresa (opcional)
                </label>
                <input
                  id="empresa_id"
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Deixe vazio para usar empresa padrão"
                  value={formData.empresa_id}
                  onChange={(e) => handleInputChange('empresa_id', e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Erro no registro
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Criando conta...' : isEmpresa ? 'Criar Empresa e Conta' : 'Criar Conta'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-500"
                onClick={() => {/* Implementar navegação para login */}}
              >
                Faça login aqui
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
