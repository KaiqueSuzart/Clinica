import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';
import { usePermissions } from '../../contexts/PermissionsContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  RotateCcw,
  FileText,
  BarChart3,
  Settings,
  ClipboardList,
  Upload,
  Briefcase
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/pacientes', icon: Users, label: 'Pacientes' },
  { path: '/procedimentos', icon: Briefcase, label: 'Procedimentos' },
  { path: '/retornos', icon: RotateCcw, label: 'Retornos' },
  { path: '/orcamentos', icon: FileText, label: 'Orçamentos' },
  { path: '/anamnese', icon: ClipboardList, label: 'Anamnese' },
  { path: '/arquivos', icon: Upload, label: 'Arquivos' },
  { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { path: '/configuracoes', icon: Settings, label: 'Configurações' }
];

export default function Sidebar() {
  const { user, empresa } = useAuth();
  const permissions = usePermissions();
  
  // Filtrar itens do menu baseado em permissões
  const filteredMenuItems = menuItems.filter(item => {
    // Relat dados financeiros - só Dentista/Admin
    if (item.path === '/relatorios' && !permissions.canViewReports) {
      return false;
    }
    
    // Configurações - só Dentista/Admin
    if (item.path === '/configuracoes' && !permissions.canEditSettings) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-colors">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center text-center space-y-3">
            {empresa?.logo_url ? (
              <img
                className="h-16 w-16 rounded-2xl object-cover shadow-lg"
                src={empresa.logo_url}
                alt={empresa.nome}
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {empresa?.nome || 'Clínica Exemplo'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sistema Odontológico</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}