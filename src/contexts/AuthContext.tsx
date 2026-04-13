import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AdminUser } from '../types';
import { mockLogin } from '../data/mockAdminUsers';

interface AuthContextValue {
  user: AdminUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const stored = sessionStorage.getItem('bo_user');
    return stored ? JSON.parse(stored) : null;
  });

  function login(email: string, password: string): boolean {
    const found = mockLogin(email, password);
    if (found) {
      setUser(found);
      sessionStorage.setItem('bo_user', JSON.stringify(found));
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem('bo_user');
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
