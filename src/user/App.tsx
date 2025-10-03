import { Suspense } from 'react';
import { AuthProvider } from './auth/useAuth';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider } from './providers/ToastProvider';
import { ErrorBoundary } from './providers/ErrorBoundary';
import { UserRoutes } from './routes';

export function UserApp() {
  // SECURITY: Ensure user app never runs on admin domains
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isAdminDomain = hostname.includes('admin.lchaty.com') || hostname.includes('local.admin');
    
    if (isAdminDomain) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-red-200">
            <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
            <p className="text-red-600">User interface cannot be accessed from admin domains.</p>
            <p className="text-sm text-gray-500 mt-2">Please use the correct domain.</p>
          </div>
        </div>
      );
    }
  }

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
