import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setAuth, clearAuth, getToken } from '@/lib/api';
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

function toUser(apiUser: { id: number; name: string; email: string }): User {
  return {
    id: String(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        if (!cancelled && res.user) {
          setUser(toUser(res.user));
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearAuth();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await authApi.login(email, password);
    const u = toUser(res.user);
    setAuth(res.token, res.user);
    setUser(u);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      const stored = localStorage.getItem('partner_auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.user = updatedUser;
          localStorage.setItem('partner_auth', JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }
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
      const stored = localStorage.getItem('partner_auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.user = updatedUser;
          localStorage.setItem('partner_auth', JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }
    }
  };

  const logout = () => {
    setUser(null);
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
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
