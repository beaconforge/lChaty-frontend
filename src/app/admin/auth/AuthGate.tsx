import { PropsWithChildren } from 'react';
import { useAuth } from './useAuth';
import { LoadingScreen } from '../components/LoadingScreen';

export function AuthGate({ children }: PropsWithChildren) {
  const { ready } = useAuth();

  if (!ready) {
    return <LoadingScreen message="Preparing admin workspace" />;
  }

  return children;
}
