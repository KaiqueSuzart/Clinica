import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../components/Auth/AuthProvider';

interface PermissionsContextType {
  canViewReports: boolean;
  canViewFinancial: boolean;
  canManageUsers: boolean;
  canEditSettings: boolean;
  canDeleteData: boolean;
  isDentista: boolean;
  isRecepcionista: boolean;
  isAdmin: boolean;
  cargo: string;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const cargo = user?.cargo?.toLowerCase() || '';
  const isDentista = cargo === 'dentista';
  const isRecepcionista = cargo === 'recepcionista';
  const isAdmin = cargo === 'admin';

  // Dentista e Admin têm acesso total
  const hasFullAccess = isDentista || isAdmin;

  const permissions: PermissionsContextType = {
    // Relatórios
    canViewReports: hasFullAccess, // Recepcionista NÃO vê relatórios
    canViewFinancial: hasFullAccess, // Recepcionista NÃO vê financeiro
    
    // Gerenciamento
    canManageUsers: hasFullAccess, // Só dentista/admin gerencia usuários
    canEditSettings: hasFullAccess, // Só dentista/admin edita configurações
    canDeleteData: hasFullAccess, // Só dentista/admin deleta dados
    
    // Identificadores
    isDentista,
    isRecepcionista,
    isAdmin,
    cargo: user?.cargo || 'Usuário'
  };

  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions deve ser usado dentro de um PermissionsProvider');
  }
  return context;
};



