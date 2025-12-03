import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../../config';

interface User {
  id: string;
  email: string;
  nome: string;
  cargo: string;
  role: string;
  telefone?: string;
  bio?: string;
  empresa_id: number;
  empresa: {
    id: string;
    nome: string;
    email_empresa: string;
    logo_url?: string;
  };
}

interface AuthContextType {
  user: User | null;
  empresa: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  registerEmpresa: (data: RegisterEmpresaData) => Promise<void>;
  logout: () => Promise<void>;
  switchEmpresa: (empresaId: string) => Promise<void>;
  updateEmpresaData: (data: any) => void;
  updateUser: (data: any) => void;
  error: string | null;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  nome: string;
  empresa_id?: string;
  cargo?: string;
  role?: string;
}

interface RegisterEmpresaData {
  email: string;
  password: string;
  nome: string;
  cargo?: string;
  role?: string;
  nome_empresa: string;
  email_empresa: string;
  cnpj?: string;
  telefone_empresa?: string;
  endereco?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [empresa, setEmpresa] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar se há sessão salva no localStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const url = `${API_BASE_URL}/auth/me`;
          console.log('🔍 Verificando autenticação em:', url);
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setEmpresa(userData.empresa);
          } else {
            // Se não for OK, apenas remover token silenciosamente (usuário não está logado)
            console.log('⚠️ Token inválido ou expirado, removendo do localStorage');
            localStorage.removeItem('auth_token');
          }
        } else {
          console.log('ℹ️ Nenhum token encontrado, usuário não está logado');
        }
      } catch (err) {
        // Erro de rede ou outro erro - não mostrar na tela, apenas logar
        console.error('❌ Erro ao verificar autenticação:', err);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no login');
      }

      // Salvar token no localStorage
      if (data.session?.access_token) {
        localStorage.setItem('auth_token', data.session.access_token);
      }

      setUser(data.user);
      setEmpresa(data.empresa);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro no registro');
      }

      // Após registro bem-sucedido, fazer login automaticamente
      await login(data.email, data.password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerEmpresa = async (data: RegisterEmpresaData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/register-empresa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro no registro da empresa');
      }

      // Após registro bem-sucedido, fazer login automaticamente
      await login(data.email, data.password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (err) {
      console.error('Erro no logout:', err);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setEmpresa(null);
      setLoading(false);
    }
  };

  const switchEmpresa = async (empresaId: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/auth/switch-empresa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ empresa_id: empresaId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao alterar empresa');
      }

      setUser(data.user);
      setEmpresa(data.empresa);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEmpresaData = (data: any) => {
    console.log('updateEmpresaData chamado com:', data);
    console.log('Empresa atual:', empresa);
    setEmpresa(prevEmpresa => {
      const newEmpresa = {
        ...prevEmpresa,
        ...data
      };
      console.log('Nova empresa:', newEmpresa);
      return newEmpresa;
    });
  };

  const updateUser = (data: any) => {
    console.log('updateUser chamado com:', data);
    console.log('Usuário atual:', user);
    setUser(prevUser => {
      const newUser = {
        ...prevUser,
        ...data
      };
      console.log('Novo usuário:', newUser);
      return newUser;
    });
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    empresa,
    loading,
    login,
    register,
    registerEmpresa,
    logout,
    switchEmpresa,
    updateEmpresaData,
    updateUser,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
