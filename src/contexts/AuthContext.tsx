import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  company?: string;
  telegram?: string;
  whatsapp?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: 'usr_partner_001',
  name: 'Alex Johnson',
  email: 'alex@acmepartners.com',
  company: 'Acme Partners Ltd',
  avatar: undefined,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for mock auth state
    const storedAuth = localStorage.getItem('partner_auth');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        setUser(parsed.user);
      } catch {
        localStorage.removeItem('partner_auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const loggedInUser = { ...MOCK_USER, email };
    setUser(loggedInUser);
    localStorage.setItem('partner_auth', JSON.stringify({ user: loggedInUser }));
  };

  const register = async (data: RegisterData): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: 'usr_partner_' + Date.now(),
      name: data.fullName,
      email: data.email,
      company: data.company,
    };
    setUser(newUser);
    localStorage.setItem('partner_auth', JSON.stringify({ user: newUser }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('partner_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
