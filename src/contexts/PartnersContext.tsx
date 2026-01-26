import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  deletePartner: (id: string) => void;
  regeneratePassword: (id: string) => void;
  getPartnerById: (id: string) => Partner | undefined;
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

// Mock initial partners data
const MOCK_PARTNERS: Partner[] = [
  {
    id: 'partner_001',
    name: 'Aman Natt',
    email: 'aman@natt.com',
    company: 'Acme Partners Ltd',
    region: 'Europe',
    timezone: 'UTC+1 (Central Europe)',
    enabledTools: ['rebatetools', 'telebulk'],
    username: 'partner_aman_001',
    password: 'Tmp$2024!Secure',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-01-26T14:20:00Z',
  },
  {
    id: 'partner_002',
    name: 'Sarah Chen',
    email: 'sarah@forexpro.com',
    company: 'Forex Pro Trading',
    region: 'Asia Pacific',
    timezone: 'UTC+8 (Singapore)',
    enabledTools: ['rebatetools', 'msgchat'],
    username: 'partner_sarah_002',
    password: 'Secure#2024!',
    status: 'active',
    createdAt: '2024-01-20T08:15:00Z',
    lastLogin: '2024-01-25T09:45:00Z',
  },
  {
    id: 'partner_003',
    name: 'Michael Rodriguez',
    email: 'michael@tradershub.io',
    company: 'Traders Hub',
    region: 'Americas',
    timezone: 'UTC-5 (Eastern)',
    enabledTools: ['telebulk'],
    username: 'partner_michael_003',
    password: 'Temp$Pass2024',
    status: 'pending',
    createdAt: '2024-01-24T16:00:00Z',
  },
];

function generateUsername(name: string, existingUsernames: string[]): string {
  const base = name.toLowerCase().replace(/\s+/g, '_').slice(0, 10);
  let username = `partner_${base}_001`;
  let counter = 1;
  
  while (existingUsernames.includes(username)) {
    counter++;
    const num = counter.toString().padStart(3, '0');
    username = `partner_${base}_${num}`;
  }
  
  return username;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function PartnersProvider({ children }: { children: ReactNode }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage or use mock data
    const stored = localStorage.getItem('partner_launchpad_partners');
    if (stored) {
      try {
        let list: Partner[] = JSON.parse(stored);
        let didChange = false;
        // Migrate legacy Alex Johnson / alex@acmepartners.com to Aman Natt
        list = list.map((p) => {
          if (p.name === 'Alex Johnson' || p.email === 'alex@acmepartners.com') {
            didChange = true;
            return { ...p, name: 'Aman Natt', email: 'aman@natt.com' };
          }
          return p;
        });
        if (didChange) {
          localStorage.setItem('partner_launchpad_partners', JSON.stringify(list));
        }
        setPartners(list);
      } catch {
        setPartners(MOCK_PARTNERS);
      }
    } else {
      setPartners(MOCK_PARTNERS);
      localStorage.setItem('partner_launchpad_partners', JSON.stringify(MOCK_PARTNERS));
    }
    setIsLoading(false);
  }, []);

  const savePartners = (newPartners: Partner[]) => {
    setPartners(newPartners);
    localStorage.setItem('partner_launchpad_partners', JSON.stringify(newPartners));
  };

  const addPartner = async (data: NewPartnerData): Promise<Partner> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const existingUsernames = partners.map(p => p.username);
    const newPartner: Partner = {
      id: `partner_${Date.now()}`,
      name: data.name,
      email: data.email,
      company: data.company,
      region: data.region,
      timezone: data.timezone,
      enabledTools: data.enabledTools,
      username: generateUsername(data.name, existingUsernames),
      password: generatePassword(),
      status: 'active',
      createdAt: new Date().toISOString(),
      telegram: data.telegram,
      whatsapp: data.whatsapp,
    };
    
    const updated = [...partners, newPartner];
    savePartners(updated);
    return newPartner;
  };

  const updatePartner = (id: string, updates: Partial<Partner>) => {
    const updated = partners.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    savePartners(updated);
  };

  const deletePartner = (id: string) => {
    const updated = partners.filter(p => p.id !== id);
    savePartners(updated);
  };

  const regeneratePassword = (id: string) => {
    const updated = partners.map(p => 
      p.id === id ? { ...p, password: generatePassword() } : p
    );
    savePartners(updated);
  };

  const getPartnerById = (id: string) => {
    return partners.find(p => p.id === id);
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