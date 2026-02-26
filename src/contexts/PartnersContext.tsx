import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usersApi, satellitesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Partner {
  id: string;
  name: string;
  email: string;
  company?: string;
  region?: string;
  timezone?: string;
  enabledTools: string[];
  username: string;
  password: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
  telegram?: string;
  whatsapp?: string;
}

interface PartnersContextType {
  partners: Partner[];
  isLoading: boolean;
  addPartner: (data: NewPartnerData) => Promise<Partner>;
  updatePartner: (id: string, updates: Partial<Partner>) => void;
  deletePartner: (id: string) => Promise<void>;
  regeneratePassword: (id: string) => Promise<string>;
  getPartnerById: (id: string) => Partner | undefined;
  refreshPartners: () => Promise<void>;
}

export interface NewPartnerData {
  name: string;
  email: string;
  company?: string;
  region?: string;
  timezone?: string;
  enabledTools: string[];
  telegram?: string;
  whatsapp?: string;
}

const PartnersContext = createContext<PartnersContextType | undefined>(undefined);

function deriveUsername(name: string): string {
  return String(name).trim().replace(/\s+/g, '') || 'user';
}

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function apiUserToPartner(u: {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  company?: string;
  region?: string;
  timezone?: string;
  telegram?: string;
  whatsapp?: string;
  enabledTools?: string[];
}): Partner {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    company: u.company,
    region: u.region,
    timezone: u.timezone,
    telegram: u.telegram,
    whatsapp: u.whatsapp,
    enabledTools: Array.isArray(u.enabledTools) ? u.enabledTools : [],
    username: deriveUsername(u.name),
    password: '',
    status: 'active',
    createdAt: u.created_at || new Date().toISOString(),
  };
}

export function PartnersProvider({ children }: { children: ReactNode }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const refreshPartners = useCallback(async () => {
    if (!isAuthenticated) {
      setPartners([]);
      setIsLoading(false);
      return;
    }
    try {
      const res = await usersApi.list();
      setPartners((res.data || []).map(apiUserToPartner));
    } catch {
      setPartners([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }
    if (!isAuthenticated) {
      setPartners([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    usersApi
      .list()
      .then((res) => {
        if (!cancelled) {
          setPartners((res.data || []).map(apiUserToPartner));
        }
      })
      .catch(() => {
        if (!cancelled) setPartners([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAuthLoading]);

  const addPartner = async (data: NewPartnerData): Promise<Partner> => {
    const password = generatePassword();
    const createRes = await usersApi.create({
      name: data.name,
      email: data.email,
      password,
      company: data.company,
      region: data.region,
      timezone: data.timezone,
      telegram: data.telegram,
      whatsapp: data.whatsapp,
      enabledTools: data.enabledTools,
    });
    const userId = createRes.data.id;

    const satelliteSlugs = (data.enabledTools || []).filter(
      (s) => s === 'msgchat' || s === 'telebulk' || s === 'rebatetools'
    );
    if (satelliteSlugs.length > 0) {
      try {
        await satellitesApi.provision(userId, satelliteSlugs, password);
      } catch (err) {
        // Partner was created; add to state and rethrow with helpful message
        const newPartner: Partner = {
          ...apiUserToPartner(createRes.data),
          username: deriveUsername(data.name),
          password,
        };
        setPartners((prev) => [...prev, newPartner]);
        throw new Error(
          'Partner created, but provisioning to one or more satellites failed. Check MSGCHAT_API_URL, TELEBULK_API_URL and REBATETOOLS_DB_* variables.'
        );
      }
    }

    const newPartner: Partner = {
      ...apiUserToPartner(createRes.data),
      username: deriveUsername(data.name),
      password,
    };
    setPartners((prev) => [...prev, newPartner]);
    return newPartner;
  };

  const updatePartner = (id: string, updates: Partial<Partner>) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePartner = async (id: string) => {
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) throw new Error('Invalid partner id');
    await usersApi.delete(numId);
    setPartners((prev) => prev.filter((p) => p.id !== id));
  };

  const regeneratePassword = async (id: string): Promise<string> => {
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) throw new Error('Invalid partner id');
    const newPassword = generatePassword();
    await usersApi.update(numId, { password: newPassword });
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, password: newPassword } : p))
    );
    return newPassword;
  };

  const getPartnerById = (id: string) => {
    return partners.find((p) => p.id === id);
  };

  return (
    <PartnersContext.Provider
      value={{
        partners,
        isLoading,
        addPartner,
        updatePartner,
        deletePartner,
        regeneratePassword,
        getPartnerById,
        refreshPartners,
      }}
    >
      {children}
    </PartnersContext.Provider>
  );
}

export function usePartners() {
  const context = useContext(PartnersContext);
  if (context === undefined) {
    throw new Error('usePartners must be used within a PartnersProvider');
  }
  return context;
}
