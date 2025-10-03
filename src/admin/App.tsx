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

  return (
    <AppProviders>
      <BrowserRouter basename="/admin">
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
