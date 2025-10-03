import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';

const LoginPage = lazy(() => import('./pages/Login/LoginPage'));
const ChatPage = lazy(() => import('./pages/Chat/ChatPage'));
const ThreadsPage = lazy(() => import('./pages/Threads/ThreadsPage'));
const FamilyHubPage = lazy(() => import('./pages/FamilyHub/FamilyHubPage'));
const KidsPage = lazy(() => import('./pages/Kids/KidsPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));
const UsagePage = lazy(() => import('./pages/Usage/UsagePage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <RequireAuth />, // gate protected area
    children: [
      {
        index: true,
        element: <ChatPage />,
      },
      {
        path: 'chat',
        element: <ChatPage />,
      },
      {
        path: 'threads/:threadId?',
        element: <ThreadsPage />,
      },
      {
        path: 'family',
        element: <FamilyHubPage />,
      },
      {
        path: 'kids',
        element: <KidsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'usage',
        element: <UsagePage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

export function UserRoutes() {
  return <RouterProvider router={router} />;
}
