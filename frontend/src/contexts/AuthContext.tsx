import { createContext, useContext, useState, type ReactNode } from 'react';
import { clearSession, login as loginRequest, readSession, type SessionUser } from '../lib/api';

interface AuthContextValue {
  user: SessionUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readSession()?.user ?? null);

  async function login(email: string, password: string): Promise<boolean> {
    const session = await loginRequest(email, password);
    setUser(session.user);
    return true;
  }

  function logout() {
    setUser(null);
    clearSession();
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
