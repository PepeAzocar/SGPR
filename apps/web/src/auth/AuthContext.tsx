import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '../api/client';

interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'RRHH' | 'EMPLOYEE';
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('gpr_user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  async function login(email: string, password: string) {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    localStorage.setItem('gpr_token', res.accessToken);
    localStorage.setItem('gpr_user', JSON.stringify(res.user));
    setUser(res.user);
  }

  function logout() {
    localStorage.removeItem('gpr_token');
    localStorage.removeItem('gpr_user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
