import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';
import { BusinessHoursProvider } from '../../contexts/BusinessHoursContext';
import { UserProvider } from '../../contexts/UserContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { PermissionsProvider } from '../../contexts/PermissionsContext';
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

export default function Layout() {
  const { user, loading } = useAuth();

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
            <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Header />
              <Sidebar />
              <main className="ml-64 pt-16 p-6">
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
          </BusinessHoursProvider>
        </PermissionsProvider>
      </UserProvider>
    </ThemeProvider>
  );
}