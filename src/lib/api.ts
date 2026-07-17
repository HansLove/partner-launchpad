const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AUTH_STORAGE_KEY = 'partner_auth';

export function getToken(): string | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function setAuth(token: string, user: { id: number; name: string; email: string }): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
}

export interface ApiError extends Error {
  status?: number;
  body?: { error?: string; success?: boolean };
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { skipAuth?: boolean }
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = options?.skipAuth ? null : getToken();
  const hadToken = Boolean(token);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401 && !options?.skipAuth && hadToken) {
      clearAuth();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    const err = new Error((data as { error?: string })?.error || `Request failed: ${res.status}`) as ApiError;
    err.status = res.status;
    err.body = data as { error?: string; success?: boolean };
    throw err;
  }

  return data as T;
}

// Auth
export interface LoginResponse {
  success: boolean;
  token: string;
  user: { id: number; name: string; email: string };
}

export interface MeResponse {
  success: boolean;
  user: { id: number; name: string; email: string };
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>('POST', '/api/auth/login', { email, password }, { skipAuth: true }),
  me: () => apiRequest<MeResponse>('GET', '/api/auth/me'),
};

// Users (partners)
export interface ApiUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  company?: string;
  region?: string;
  timezone?: string;
  telegram?: string;
  whatsapp?: string;
  enabledTools?: string[];
}

export interface ListUsersResponse {
  success: boolean;
  data: ApiUser[];
}

export interface UserResponse {
  success: boolean;
  data: ApiUser;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  company?: string;
  region?: string;
  timezone?: string;
  telegram?: string;
  whatsapp?: string;
  enabledTools?: string[];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  company?: string;
  region?: string;
  timezone?: string;
  telegram?: string;
  whatsapp?: string;
  enabledTools?: string[];
}

export const usersApi = {
  list: () => apiRequest<ListUsersResponse>('GET', '/api/users'),
  get: (id: number) => apiRequest<UserResponse>('GET', `/api/users/${id}`),
  create: (payload: CreateUserPayload) => apiRequest<UserResponse>('POST', '/api/users', payload),
  update: (id: number, payload: UpdateUserPayload) => apiRequest<UserResponse>('PUT', `/api/users/${id}`, payload),
  delete: (id: number) => apiRequest<{ success: boolean }>('DELETE', `/api/users/${id}`),
};

// Satellites
export interface SatellitesResponse {
  success: boolean;
  data: Record<string, string>;
}

export interface ProvisionResponse {
  success: boolean;
  data: Record<string, { success: boolean; satellite_user_id?: string; error?: string }>;
}

export interface SatelliteActiveResponse {
  success: boolean;
  active: string;
}

export interface SatelliteUsersResponse<T = Record<string, unknown>> {
  success: boolean;
  data: T[];
}

export type AccountStatus = 'not_connected' | 'syncing' | 'connected';

export interface UserBrokerConnection {
  slug: string;
  broker_name: string | null;
  broker_email: string | null;
  last_used_at: string | null;
  last_error: string | null;
  is_active: boolean;
}

export interface UserBrokerIb {
  slug: string;
  ib_rebate_account_login: string | null;
  owner_name: string | null;
  ib_level: number;
  is_active: boolean;
}

export interface UserScrapeStatus {
  account_status: AccountStatus;
  last_used_at: string | null;
  last_error: string | null;
  broker_name: string | null;
  current: number;
  total: number;
  currentDate: string | null;
  brokers?: UserBrokerConnection[];
  ibs?: UserBrokerIb[];
}

export interface RebtoolsScrapeStatusResponse {
  success: boolean;
  data: Record<string, UserScrapeStatus>;
}

/** RebTools user PUT may include activation-email meta when status becomes active */
export interface SatelliteUserUpdateResponse {
  success: boolean;
  data?: {
    activationEmailAttempted?: boolean;
    activationEmailTrigger?: 'status_activated' | 'role_promoted_to_admin' | null;
    activationEmailSent?: boolean;
    activationEmailSkipped?: boolean;
    activationEmailError?: string | null;
    activationEmailMessageId?: string | null;
  };
}

export const satellitesApi = {
  list: () => apiRequest<SatellitesResponse>('GET', '/api/satellites'),
  getActive: (sessionId?: string) =>
    apiRequest<SatelliteActiveResponse>(
      'GET',
      sessionId ? `/api/satellites/active?sessionId=${encodeURIComponent(sessionId)}` : '/api/satellites/active'
    ),
  setActive: (satellite: string, sessionId?: string) =>
    apiRequest<SatelliteActiveResponse>('POST', '/api/satellites/active', { satellite, sessionId }),
  listUsers: (satellite: string) =>
    apiRequest<SatelliteUsersResponse>('GET', `/api/satellites/${encodeURIComponent(satellite)}/users`),
  createUser: (
    satellite: string,
    payload: Record<string, unknown>
  ) => apiRequest<{ success: boolean; data: { id: string | number } }>(
    'POST',
    `/api/satellites/${encodeURIComponent(satellite)}/users`,
    payload
  ),
  updateUser: (
    satellite: string,
    id: string | number,
    payload: Record<string, unknown>
  ) =>
    satellite === 'telebulk'
      ? apiRequest<SatelliteUserUpdateResponse>(
          'PUT',
          `/api/satellites/${encodeURIComponent(satellite)}/users/edit`,
          payload
        )
      : apiRequest<SatelliteUserUpdateResponse>(
          'PUT',
          `/api/satellites/${encodeURIComponent(satellite)}/users/${encodeURIComponent(String(id))}`,
          payload
        ),
  updateRebToolsUser: (
    id: string | number,
    payload: Record<string, unknown>
  ) =>
    apiRequest<SatelliteUserUpdateResponse>(
      'PUT',
      `/api/satellites/rebatetools/users/${encodeURIComponent(String(id))}`,
      payload
    ),
  deleteUser: (satellite: string, identifier: string | number) =>
    apiRequest<{ success: boolean }>(
      'DELETE',
      `/api/satellites/${encodeURIComponent(satellite)}/users/${encodeURIComponent(String(identifier))}`
    ),
  sendRebToolsPasswordReset: (id: string | number) =>
    apiRequest<{ success: boolean; data?: { email?: string; messageId?: string | null } }>(
      'POST',
      `/api/satellites/rebatetools/users/${encodeURIComponent(String(id))}/send-reset`
    ),
  provision: (userId: number, satellites: string[], password: string) =>
    apiRequest<ProvisionResponse>('POST', '/api/satellites/provision', {
      userId,
      satellites,
      password,
    }),
  getRebtoolsScrapeStatus: () =>
    apiRequest<RebtoolsScrapeStatusResponse>('GET', '/api/satellites/rebatetools/users/scrape-status'),
};
