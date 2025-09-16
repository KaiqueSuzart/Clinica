import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import { useAuth } from '../components/Auth/AuthProvider';

const LoginPage: React.FC = () => {
  const { login, loading, error, clearError } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      clearError();
      await login(email, password);
      // Após login bem-sucedido, o Layout vai detectar o usuário e mostrar o dashboard
    } catch (err) {
      // Erro já é tratado pelo AuthProvider
    }
  };

  const handleToggleMode = () => {
    setIsRegistering(!isRegistering);
    clearError();
  };

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center mb-8">
              <button
                onClick={handleToggleMode}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                ← Voltar para Login
              </button>
            </div>
            {/* Aqui você pode incluir o RegisterForm se quiser */}
            <div className="text-center">
              <p className="text-gray-600">
                Para registrar uma nova conta, entre em contato com o administrador do sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      loading={loading}
      error={error}
    />
  );
};

export default LoginPage;
