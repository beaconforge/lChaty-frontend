import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function RequireAuth() {
  const { ready, user } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent" aria-hidden />
          <p className="text-sm text-muted-foreground">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
