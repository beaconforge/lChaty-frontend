import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../providers/ToastProvider';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { register, handleSubmit, formState } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const onSubmit = handleSubmit(async values => {
    try {
      await axios.post(
        '/api/auth/login',
        values,
        {
          withCredentials: true,
        },
      );
      const { data } = await axios.get('/api/me', { withCredentials: true });
      setUser(data);
      navigate((location.state as any)?.from?.pathname ?? '/chat', { replace: true });
    } catch (error) {
      toast.push({ title: 'Invalid credentials', description: 'Please try again.', type: 'error' });
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-6">
      <div className="w-full max-w-md rounded-3xl border border-primary/30 bg-background/80 p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold text-primary">Welcome to LChaty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to access your family hub and chats.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium">
            <span className="text-muted-foreground">Username</span>
            <input
              type="text"
              autoComplete="username"
              {...register('username')}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
            />
            {formState.errors.username ? (
              <span className="mt-1 block text-xs text-destructive">{formState.errors.username.message}</span>
            ) : null}
          </label>
          <label className="block text-sm font-medium">
            <span className="text-muted-foreground">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
            />
            {formState.errors.password ? (
              <span className="mt-1 block text-xs text-destructive">{formState.errors.password.message}</span>
            ) : null}
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            disabled={formState.isSubmitting}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
