import React from 'react';
import { NavLink } from 'react-router-dom';
import { currentUser, userPermissions } from '../../data/mockData';
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  RotateCcw,
  FileText,
  BarChart3,
  Settings,
  ClipboardList,
  Upload
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/pacientes', icon: Users, label: 'Pacientes' },
  { path: '/mensagens', icon: MessageSquare, label: 'Mensagens' },
  { path: '/retornos', icon: RotateCcw, label: 'Retornos' },
  { path: '/orcamentos', icon: FileText, label: 'Orçamentos' },
  { path: '/anamnese', icon: ClipboardList, label: 'Anamnese' },
  { path: '/arquivos', icon: Upload, label: 'Arquivos' },
  { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { path: '/configuracoes', icon: Settings, label: 'Configurações' }
];

export default function Sidebar() {
  const userRole = currentUser.role;
  const permissions = userPermissions[userRole];
  
  const filteredMenuItems = menuItems.filter(item => {
    const routeName = item.path.replace('/', '');
    return permissions.canView.includes(routeName);
  });

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Smile Care</h1>
          <p className="text-sm text-gray-500">Odontologia</p>
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
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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