import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { login, fetchMe } from '../api/auth';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

const schema = z.object({
  username: z.string().min(3, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async values => {
    setError(null);
    try {
      await login(values.username, values.password);

      // Fetch the user data after successful login and update auth context
      const userData = await fetchMe();
      setUser(userData);

      // Let the app routing respond to auth change (no forced reload)
    } catch (err: any) {
      // Handle network/connection errors
      if (err?.code === 'NETWORK_ERROR' || err?.message?.includes('Network Error')) {
        setError('Cannot connect to server. Please check your connection and try again.');
        return;
      }

      // Handle 401 Unauthorized - invalid credentials
      if (err?.response?.status === 401 || err?.status === 401) {
        setError('Invalid username or password');
        return;
      }

      // Handle 403 Forbidden - valid user but no admin access
      if (err?.response?.status === 403 || err?.status === 403) {
        setError('Access denied. You do not have admin privileges.');
        return;
      }

      // Handle 404 - backend not available
      if (err?.response?.status === 404 || err?.status === 404) {
        setError('Admin login service is currently unavailable. Please try again later.');
        return;
      }

      // Generic error for other cases
      setError('Unable to sign in right now. Please try again later.');
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-10 shadow-lg">
        <div className="flex items-center justify-center mb-4">
          {/* Inline SVG logo to avoid an external asset request */}
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="100" height="100" rx="20" fill="#0f172a" />
            <text x="50%" y="54%" textAnchor="middle" fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto" fontWeight="700" fontSize="40" fill="#60a5fa">l</text>
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-foreground text-center">Admin console</h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Sign in with your administrator credentials to manage the platform.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error ? (
            // Keep an explicit stable id for E2E tests to target
            <Alert id="errorMessage" variant="destructive">
              <AlertTitle>Sign in failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="username">
              Username
            </label>
            <Input id="username" autoComplete="username" {...register('username')} />
            {errors.username ? <p className="text-xs text-destructive">{errors.username.message}</p> : null}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
