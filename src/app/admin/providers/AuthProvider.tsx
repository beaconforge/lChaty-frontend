import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { bootstrapAuth } from '../auth/bootstrap';
import { AuthContext } from '../auth/AuthContext';
import { AdminUser } from '../api/types';

export function AuthProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AdminUser | undefined>();
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | undefined>();

  const initialize = useCallback(async () => {
    const result = await bootstrapAuth();
    if (result.authenticated) {
      setUser(result.me);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const value = useMemo(
    () => ({
      ready,
      user,
      roles: user?.roles ?? [],
      impersonatedUserId,
      setUser,
      setReady,
      setImpersonatedUserId,
    }),
    [impersonatedUserId, ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
