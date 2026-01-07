import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';
import { BusinessHoursProvider } from '../../contexts/BusinessHoursContext';
import { UserProvider } from '../../contexts/UserContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { PermissionsProvider } from '../../contexts/PermissionsContext';
import { MobileMenuProvider } from '../../contexts/MobileMenuContext';
import LoginPage from '../../pages/LoginPage';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from '../../pages/Dashboard';
import Agenda from '../../pages/Agenda';
import Pacientes from '../../pages/Pacientes';
import Procedimentos from '../../pages/Procedimentos';
import Orcamentos from '../../pages/Orcamentos';
import Retornos from '../../pages/Retornos';
import Financeiro from '../../pages/Financeiro';
import Configuracoes from '../../pages/Configuracoes';
import Perfil from '../../pages/Perfil';
import Anamnese from '../../pages/Anamnese';
import Arquivos from '../../pages/Arquivos';
import Relatorios from '../../pages/Relatorios';

// Componente para scrollar para o topo ao mudar de rota
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Aguardar um frame para garantir que o DOM esteja atualizado
    requestAnimationFrame(() => {
      // Garantir que a página sempre comece no topo
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      // Também garantir que o scroll do main esteja no topo
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTop = 0;
      }
      // Garantir que o body também esteja no topo
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [pathname]);

  return null;
}

export default function Layout() {
  const { user, loading } = useAuth();

  // Garantir que a página sempre comece no topo ao carregar
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Se estiver carregando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver logado, mostrar página de login
  if (!user) {
    return <LoginPage />;
  }

  // Se estiver logado, mostrar sistema completo
  return (
    <ThemeProvider>
      <UserProvider>
        <PermissionsProvider>
          <BusinessHoursProvider>
            <MobileMenuProvider>
              <Router>
                <ScrollToTop />
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                  <Header />
                  <Sidebar />
                  <main className="lg:ml-64 p-4 sm:p-6" style={{ paddingTop: '80px', scrollMarginTop: '80px' }}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/agenda" element={<Agenda />} />
                      <Route path="/pacientes" element={<Pacientes />} />
                      <Route path="/procedimentos" element={<Procedimentos />} />
                      <Route path="/orcamentos" element={<Orcamentos />} />
                      <Route path="/retornos" element={<Retornos />} />
                      <Route path="/financeiro" element={<Financeiro />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />
                      <Route path="/perfil" element={<Perfil />} />
                      {/* Páginas específicas */}
                      <Route path="/anamnese" element={<Anamnese />} />
                      <Route path="/arquivos" element={<Arquivos />} />
                      <Route path="/relatorios" element={<Relatorios />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </Router>
            </MobileMenuProvider>
          </BusinessHoursProvider>
        </PermissionsProvider>
      </UserProvider>
    </ThemeProvider>
  );
}