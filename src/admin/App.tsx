import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { RequireAdmin } from './auth/RequireAdmin';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginPage } from './pages/LoginPage';
import { AdminShell } from './layouts/AdminShell';
import { adminRoutes } from './routes';

export function AdminApp() {
  // SECURITY: Ensure admin app only runs on proper admin domains
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalAdmin = hostname.includes('local.admin.lchaty.com');
    const isProdAdmin = hostname.includes('admin.lchaty.com');
    const isValidAdminDomain = isLocalAdmin || isProdAdmin || hostname === 'localhost';
    
    if (!isValidAdminDomain) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-red-200">
            <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
            <p className="text-red-600">Admin interface can only be accessed from authorized domains.</p>
          </div>
        </div>
      );
    }
  }

  const [dashboardRoute, ...restRoutes] = adminRoutes;
  const DashboardComponent = dashboardRoute.Component;
  
  // SECURITY: Admin app should only run on admin subdomain with proper routing
  // When served from admin subdomain (e.g. local.admin.lchaty.com), use '/' basename
  // Never use '/admin' basename on the admin subdomain to prevent routing conflicts
  const isAdminSubdomain = typeof window !== 'undefined' && 
    window.location.hostname.includes('local.admin.lchaty.com');
  
  const basename = isAdminSubdomain ? '/' : '/admin';

  return (
    <AppProviders>
  <BrowserRouter basename={basename}>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route
            element={
              <RequireAdmin>
                <AdminShell />
              </RequireAdmin>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LoadingScreen message="Loading dashboard" />}>
                  <DashboardComponent />
                </Suspense>
              }
            />
            {restRoutes.map(route => {
              const Component = route.Component;
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <Suspense fallback={<LoadingScreen message={`Loading ${route.label.toLowerCase()}`} />}>
                      <Component />
                    </Suspense>
                  }
                />
              );
            })}
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
