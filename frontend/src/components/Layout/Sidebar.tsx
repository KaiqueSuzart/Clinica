import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useMobileMenu } from '../../contexts/MobileMenuContext';
import { X } from 'lucide-react';
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
  Briefcase,
  DollarSign
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard', requiresAdmin: false },
  { path: '/agenda', icon: Calendar, label: 'Agenda', permission: 'agenda', requiresAdmin: false },
  { path: '/pacientes', icon: Users, label: 'Pacientes', permission: 'pacientes', requiresAdmin: false },
  { path: '/procedimentos', icon: Briefcase, label: 'Procedimentos', permission: 'procedimentos', requiresAdmin: false },
  { path: '/retornos', icon: RotateCcw, label: 'Retornos', permission: 'retornos', requiresAdmin: false },
  { path: '/orcamentos', icon: FileText, label: 'Orçamentos', permission: 'orcamentos', requiresAdmin: false },
  { path: '/financeiro', icon: DollarSign, label: 'Financeiro', permission: 'financeiro', requiresAdmin: false },
  { path: '/anamnese', icon: ClipboardList, label: 'Anamnese', permission: 'anamnese', requiresAdmin: false },
  { path: '/arquivos', icon: Upload, label: 'Arquivos', permission: 'arquivos', requiresAdmin: false },
  { path: '/relatorios', icon: BarChart3, label: 'Relatórios', permission: 'relatorios', requiresAdmin: true },
  { path: '/configuracoes', icon: Settings, label: 'Configurações', permission: 'configuracoes', requiresAdmin: true }
];

export default function Sidebar() {
  const { user, empresa } = useAuth();
  const permissions = usePermissions();
  const { isOpen, close } = useMobileMenu();
  const location = useLocation();
  
  // Fechar menu ao navegar (apenas se estiver aberto e a rota mudar)
  const prevPathname = React.useRef(location.pathname);
  React.useEffect(() => {
    if (prevPathname.current !== location.pathname && isOpen) {
      console.log('Fechando menu porque a rota mudou');
      close();
    }
    prevPathname.current = location.pathname;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  
  // Função auxiliar para verificar se o usuário pode ver um item
  const canViewItem = (item: typeof menuItems[0]): boolean => {
    // Se requer admin e não é admin/dentista, não mostrar
    if (item.requiresAdmin && !permissions.isAdmin && !permissions.isDentista) {
      return false;
    }
    
    // Verificações específicas por rota
    if (item.path === '/relatorios' && !permissions.canViewReports) {
      return false;
    }
    
    if (item.path === '/financeiro' && !permissions.canViewFinancial) {
      return false;
    }
    
    if (item.path === '/configuracoes' && !permissions.canEditSettings) {
      return false;
    }
    
    // Recepcionista não vê anamnese e arquivos
    if (permissions.isRecepcionista && (item.path === '/anamnese' || item.path === '/arquivos')) {
      return false;
    }
    
    // Financeiro só vê orçamentos, relatórios, financeiro e dashboard
    if (user?.cargo?.toLowerCase() === 'financeiro') {
      return item.path === '/orcamentos' || item.path === '/relatorios' || item.path === '/dashboard' || item.path === '/financeiro';
    }
    
    return true;
  };
  
  // Filtrar itens do menu baseado em permissões
  const filteredMenuItems = menuItems.filter(canViewItem);

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[45] lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out shadow-xl z-[50] lg:translate-x-0 lg:z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center text-center space-y-3 flex-1">
                {empresa?.logo_url ? (
                  <img
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl object-cover shadow-lg"
                    src={empresa.logo_url}
                    alt={empresa.nome}
                  />
                ) : (
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                    <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
                <div className="flex flex-col">
                  <h1 className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                    {empresa?.nome || 'Clínica Exemplo'}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sistema Odontológico</p>
                </div>
              </div>
              {/* Botão fechar no mobile */}
              <button
                onClick={close}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={close}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}