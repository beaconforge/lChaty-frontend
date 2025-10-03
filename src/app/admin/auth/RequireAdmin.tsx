import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { LoadingScreen } from '../components/LoadingScreen';
import { NotAuthorized } from '../components/NotAuthorized';

export function RequireAdmin({ children }: PropsWithChildren) {
  const { ready, user, roles } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <LoadingScreen message="Checking your admin session" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!roles.includes('admin')) {
    return <NotAuthorized roles={roles} />;
  }

  return children;
}
