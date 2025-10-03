import { ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';

export function NotAuthorized({ roles }: { roles: string[] }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
      <ShieldAlert className="h-12 w-12 text-destructive" />
      <div>
        <h2 className="text-xl font-semibold">You do not have access to the admin console</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your roles: {roles.length ? roles.join(', ') : 'none'}. Contact an administrator to request elevated access.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => (window.location.href = '/')}>Return to app</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/admin/login')}>Sign in</Button>
      </div>
    </div>
  );
}
