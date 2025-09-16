import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';
import { BusinessHoursProvider } from '../../contexts/BusinessHoursContext';
import { UserProvider } from '../../contexts/UserContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import LoginPage from '../../pages/LoginPage';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from '../../pages/Dashboard';
import Agenda from '../../pages/Agenda';
import Pacientes from '../../pages/Pacientes';
import Orcamentos from '../../pages/Orcamentos';
import Retornos from '../../pages/Retornos';
import Configuracoes from '../../pages/Configuracoes';
import Perfil from '../../pages/Perfil';

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
                  <Route path="/orcamentos" element={<Orcamentos />} />
                  <Route path="/retornos" element={<Retornos />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </BusinessHoursProvider>
      </UserProvider>
    </ThemeProvider>
  );
}