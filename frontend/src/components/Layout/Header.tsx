import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';
import { useTheme } from '../../contexts/ThemeContext';

const Header: React.FC = () => {
  const { user, empresa, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEmpresaMenu, setShowEmpresaMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erro no logout:', err);
    }
  };

  // Sistema de notificações desabilitado temporariamente
  // (WhatsApp não integrado ainda)
  // Será reativado quando integração estiver completa

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo da Empresa - Simplificado */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {empresa?.logo_url ? (
                <img
                  className="h-10 w-10 rounded-lg object-cover shadow-sm"
                  src={empresa.logo_url}
                  alt={empresa.nome}
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Controles do usuário - Direita */}
          <div className="flex items-center space-x-4">
            {/* Toggle tema escuro */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            >
              {isDark ? (
                // Ícone de sol (tema claro)
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Ícone de lua (tema escuro)
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Menu do usuário */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2 transition-colors"
              >
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.nome || 'Avatar'} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user?.nome?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <div className="ml-2 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.cargo || 'Funcionário'}
                  </p>
                </div>
                <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    {user?.email}
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/perfil');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Meu Perfil
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/configuracoes');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Configurações
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;