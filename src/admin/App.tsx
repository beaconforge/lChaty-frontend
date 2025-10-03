import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { RequireAdmin } from './auth/RequireAdmin';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginPage } from './pages/LoginPage';
import { AdminShell } from './layouts/AdminShell';
import { adminRoutes } from './routes';

export function AdminApp() {
  const [dashboardRoute, ...restRoutes] = adminRoutes;
  const DashboardComponent = dashboardRoute.Component;
  // If this app is served from the admin subdomain (e.g. local.admin.lchaty.com)
  // the server serves `admin.html` at the root URL ('/'). In that case we
  // should use a basename of '/' so <Router> can match the routes. When the
  // admin UI is mounted under a path (e.g. '/admin' on the main domain) we
  // keep the legacy basename '/admin'. This makes the admin app resilient in
  // both local dev (subdomain) and hosted/path-based deployments.
  const basename =
    typeof window !== 'undefined' && window.location.hostname.startsWith('local.admin')
      ? '/'
      : '/admin';

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
