import { Suspense } from 'react';
import { AuthProvider } from './auth/useAuth';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider } from './providers/ToastProvider';
import { ErrorBoundary } from './providers/ErrorBoundary';
import { UserRoutes } from './routes';

export function UserApp() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-r-transparent"
                        aria-hidden
                      />
                      <p className="text-sm text-muted-foreground">Loading experience…</p>
                    </div>
                  </div>
                }
              >
                <UserRoutes />
              </Suspense>
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
