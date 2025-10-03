import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { bootstrapAuth } from './bootstrap';
import type { CurrentUser } from '../api/types';

export type AuthState = {
  ready: boolean;
  user?: CurrentUser;
  roles: string[];
  setUser: (user?: CurrentUser) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<CurrentUser | undefined>(undefined);

  useEffect(() => {
    bootstrapAuth().then(result => {
      if (result.authenticated) {
        setUser(result.me as CurrentUser);
      } else {
        setUser(undefined);
      }
      setReady(true);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ready, user, roles: user?.roles ?? [], setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
