import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type Role = 'admin' | 'user';

export interface AuthUser {
  id: string | number;
  username: string;
  email?: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_USER_KEY = '@inventory/auth-user';

const normalizeUser = (u: AuthUser): AuthUser => ({
  ...u,
  role: u.role.toLowerCase() as Role,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_USER_KEY)
      .then((storedUser) => {
        if (storedUser) setUser(normalizeUser(JSON.parse(storedUser)));
      })
      .catch((error) => console.error('Load auth session error:', error))
      .finally(() => setAuthLoading(false));
  }, []);

  const login = (u: AuthUser) => {
    const normalizedUser = normalizeUser(u);
    setUser(normalizedUser);
    AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizedUser)).catch((error) =>
      console.error('Save auth session error:', error)
    );
  };

  const logout = () => {
    setUser(null);
    AsyncStorage.removeItem(AUTH_USER_KEY).catch((error) =>
      console.error('Remove auth session error:', error)
    );
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAdmin: user?.role === 'admin', authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
