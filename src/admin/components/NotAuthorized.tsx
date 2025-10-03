import { ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export function NotAuthorized({ roles }: { roles: string[] }) {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
      <ShieldAlert className="h-12 w-12 text-destructive" />
      <div>
        <h2 className="text-xl font-semibold">You do not have access to the admin console</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {roles.length ? (
            <>Your current roles: {roles.join(', ')}. You need admin privileges to access this console.</>
          ) : (
            'You are not signed in or do not have the required admin privileges.'
          )}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Contact an administrator to request elevated access.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => (window.location.href = '/')}>Return to app</Button>
        <Button variant="outline" onClick={() => navigate('/login')}>Sign in as admin</Button>
      </div>
    </div>
  );
}
