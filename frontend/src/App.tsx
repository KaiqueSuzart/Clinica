import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Pacientes from './pages/Pacientes';
import Mensagens from './pages/Mensagens';
import Retornos from './pages/Retornos';
import Orcamentos from './pages/Orcamentos';
import Anamnese from './pages/Anamnese';
import Arquivos from './pages/Arquivos';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import AgendaOnline from './pages/AgendaOnline';
import TestNotifications from './pages/TestNotifications';
import { BusinessHoursProvider } from './contexts/BusinessHoursContext';
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <BusinessHoursProvider>
      <Router>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/agendar" element={<AgendaOnline />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="mensagens" element={<Mensagens />} />
          <Route path="retornos" element={<Retornos />} />
          <Route path="orcamentos" element={<Orcamentos />} />
          <Route path="anamnese" element={<Anamnese />} />
          <Route path="arquivos" element={<Arquivos />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="test-notifications" element={<TestNotifications />} />
        </Route>
      </Routes>
    </Router>
    </BusinessHoursProvider>
    </UserProvider>
  );
}

export default App;