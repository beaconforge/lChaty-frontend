import { createContext } from 'react';
import { AdminUser } from '../api/types';

type AuthContextValue = {
  ready: boolean;
  user?: AdminUser;
  roles: string[];
  impersonatedUserId?: string;
  setUser: (user?: AdminUser) => void;
  setReady: (ready: boolean) => void;
  setImpersonatedUserId: (id?: string) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
