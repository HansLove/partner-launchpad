import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  avatar?: string;
  region?: string;
  timezone?: string;
  enabledTools?: string[];
  onboardingCompleted?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  completeOnboarding: (data: OnboardingData) => void;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  company?: string;
  telegram?: string;
  whatsapp?: string;
}

export interface OnboardingData {
  enabledTools: string[];
  company?: string;
  region?: string;
  timezone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: 'usr_partner_001',
  name: 'Aman Natt',
  email: 'aman@natt.com',             
  company: 'Acme Partners Ltd',
  avatar: undefined,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // For demo/template: Start unauthenticated to show full flow
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for mock auth state
    const storedAuth = localStorage.getItem('partner_auth');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        let u = parsed.user;
        // Migrate legacy Alex Johnson / alex@acmepartners.com to Aman Natt
        if (u?.name === 'Alex Johnson' || u?.email === 'alex@acmepartners.com') {
          u = { ...u, name: 'Aman Natt', email: 'aman@natt.com' };
          localStorage.setItem('partner_auth', JSON.stringify({ user: u }));
        }
        setUser(u);
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
      onboardingCompleted: false,
    };
    setUser(newUser);
    localStorage.setItem('partner_auth', JSON.stringify({ user: newUser }));
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('partner_auth', JSON.stringify({ user: updatedUser }));
    }
  };

  const completeOnboarding = (data: OnboardingData) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        enabledTools: data.enabledTools,
        company: data.company || user.company,
        region: data.region,
        timezone: data.timezone,
        onboardingCompleted: true,
      };
      setUser(updatedUser);
      localStorage.setItem('partner_auth', JSON.stringify({ user: updatedUser }));
    }
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
        updateUser,
        completeOnboarding,
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
