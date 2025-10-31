
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  user: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  // Login local com lista permitida (sem Supabase)

  useEffect(() => {
    // Verificar se há sessão local salva (persistência simples)
    try {
      const storedUser = localStorage.getItem('local_auth_user');
      const storedAuth = localStorage.getItem('local_is_authenticated');

      if (storedUser && storedAuth === 'true') {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao carregar sessão local:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Lista de administradores permitidos (login local)
      const allowedAdmins: Record<string, string> = {
        'Locutor': '#Radialista1998',
        'Vinicius': 'Bassini'
      };

      // Verificação direta local (sem Supabase)
      if (allowedAdmins[email] && allowedAdmins[email] === password) {
        const baseUser = {
          id: `local-${email.toLowerCase()}`,
          email: `${email.toLowerCase()}@local`,
          username: email,
          role: 'admin',
          permissions: ['all'],
          isMainAdmin: email === 'Vinicius',
          profile: null
        };

        setUser(baseUser);
        setIsAuthenticated(true);
        // Persistir sessão local
        try {
          localStorage.setItem('local_auth_user', JSON.stringify(baseUser));
          localStorage.setItem('local_is_authenticated', 'true');
        } catch (e) {
          console.warn('Não foi possível persistir a sessão local:', e);
        }
        return true;
      }

      // Bloquear qualquer outra combinação
      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Limpar sessão local
      localStorage.removeItem('local_auth_user');
      localStorage.removeItem('local_is_authenticated');
    } catch (error) {
      console.error('Erro ao limpar sessão local:', error);
    } finally {
      // Limpar estado local
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};
