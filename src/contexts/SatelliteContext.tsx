import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { satellitesApi } from '@/lib/api';

interface SatelliteContextValue {
  satellites: Record<string, string>;
  activeSatellite: string;
  isLoading: boolean;
  setActiveSatellite: (slug: string) => Promise<void>;
}

const SatelliteContext = createContext<SatelliteContextValue | undefined>(undefined);
const ACTIVE_SATELLITE_KEY = 'partner_active_satellite';

function getSessionId(): string {
  const key = 'partner_satellite_session_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  localStorage.setItem(key, created);
  return created;
}

export function SatelliteProvider({ children }: { children: React.ReactNode }) {
  const [satellites, setSatellites] = useState<Record<string, string>>({});
  const [activeSatellite, setActiveSatelliteState] = useState(
    localStorage.getItem(ACTIVE_SATELLITE_KEY) || 'msgchat'
  );
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = useMemo(() => getSessionId(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [listRes, activeRes] = await Promise.all([
          satellitesApi.list(),
          satellitesApi.getActive(sessionId),
        ]);
        if (cancelled) return;
        const list = listRes.data || {};
        const available = new Set(Object.keys(list));
        const preferred = localStorage.getItem(ACTIVE_SATELLITE_KEY);
        const serverActive = activeRes.active || 'msgchat';
        let nextActive = serverActive;

        if (preferred && available.has(preferred)) {
          nextActive = preferred;
          if (preferred !== serverActive) {
            try {
              await satellitesApi.setActive(preferred, sessionId);
            } catch {
              // Keep local preference even if backend reset/failed.
            }
          }
        }

        setSatellites(list);
        setActiveSatelliteState(nextActive);
        localStorage.setItem(ACTIVE_SATELLITE_KEY, nextActive);
      } catch {
        if (cancelled) return;
        setSatellites({});
        const fallback = localStorage.getItem(ACTIVE_SATELLITE_KEY) || 'msgchat';
        setActiveSatelliteState(fallback);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const setActiveSatellite = async (slug: string) => {
    localStorage.setItem(ACTIVE_SATELLITE_KEY, slug);
    setActiveSatelliteState(slug);
    try {
      const res = await satellitesApi.setActive(slug, sessionId);
      setActiveSatelliteState(res.active);
      localStorage.setItem(ACTIVE_SATELLITE_KEY, res.active);
    } catch {
      // Keep local selection to avoid resetting UI on refreshes.
    }
  };

  return (
    <SatelliteContext.Provider
      value={{
        satellites,
        activeSatellite,
        isLoading,
        setActiveSatellite,
      }}
    >
      {children}
    </SatelliteContext.Provider>
  );
}

export function useSatellite() {
  const ctx = useContext(SatelliteContext);
  if (!ctx) throw new Error('useSatellite must be used within SatelliteProvider');
  return ctx;
}

