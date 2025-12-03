import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, userPermissions } from '../data/mockData';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  switchUser: (userId: string) => void;
  hasPermission: (permission: string) => boolean;
  canView: (section: string) => boolean;
  canEdit: (section: string) => boolean;
  canDelete: (section: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

// Lista de usuários disponíveis para troca
const availableUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Ana Silva',
    email: 'ana@clinica.com',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    permissions: userPermissions.admin.canView
  },
  {
    id: '2',
    name: 'Dr. Pedro Costa',
    email: 'pedro@clinica.com',
    role: 'dentista',
    avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    permissions: userPermissions.dentista.canView
  },
  {
    id: '3',
    name: 'Maria Fernandes',
    email: 'maria@clinica.com',
    role: 'recepcionista',
    avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    permissions: userPermissions.recepcionista.canView
  },
  {
    id: '4',
    name: 'Carlos Financeiro',
    email: 'carlos@clinica.com',
    role: 'financeiro',
    avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    permissions: userPermissions.financeiro.canView
  }
];

// Exportar a lista de usuários para uso em outros componentes
export { availableUsers };

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Simular login - em produção isso viria de uma API
  useEffect(() => {
    // Por padrão, vamos simular que o admin está logado
    // Em produção, isso seria determinado pelo token de autenticação
    setUser(availableUsers[0]); // Dr. Ana Silva (admin)
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(permission);
  };

  const canView = (section: string): boolean => {
    if (!user) return false;
    // Dentista tem o mesmo acesso que admin
    const role = user.role === 'dentista' ? 'admin' : user.role;
    const rolePermissions = userPermissions[role as keyof typeof userPermissions] || userPermissions.recepcionista;
    return rolePermissions.canView.includes(section);
  };

  const canEdit = (section: string): boolean => {
    if (!user) return false;
    // Dentista tem o mesmo acesso que admin
    const role = user.role === 'dentista' ? 'admin' : user.role;
    const rolePermissions = userPermissions[role as keyof typeof userPermissions] || userPermissions.recepcionista;
    return rolePermissions.canEdit.includes(section);
  };

  const canDelete = (section: string): boolean => {
    if (!user) return false;
    // Dentista tem o mesmo acesso que admin
    const role = user.role === 'dentista' ? 'admin' : user.role;
    const rolePermissions = userPermissions[role as keyof typeof userPermissions] || userPermissions.recepcionista;
    return rolePermissions.canDelete.includes(section);
  };

  const switchUser = (userId: string): void => {
    const newUser = availableUsers.find(u => u.id === userId);
    if (newUser) {
      setUser(newUser);
    }
  };

  const value = {
    user,
    setUser,
    switchUser,
    hasPermission,
    canView,
    canEdit,
    canDelete
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
