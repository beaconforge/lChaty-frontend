import { lazy } from 'react';
import type { ComponentType } from 'react';

export type AdminRouteConfig = {
  path: string;
  label: string;
  description: string;
  icon: string;
  Component: ComponentType;
  sidebar?: boolean;
  roles?: string[];
};

const lazyPage = <T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) => lazy(factory);

export const adminRoutes: AdminRouteConfig[] = [
  {
    path: '',
    label: 'Dashboard',
    description: 'Overview of key product and infrastructure metrics',
    icon: 'LayoutDashboard',
    Component: lazyPage(() => import('./pages/Dashboard/DashboardPage').then(mod => ({ default: mod.DashboardPage }))),
    sidebar: true,
  },
  {
    path: 'users',
    label: 'Users',
    description: 'Manage user accounts, invitations, and access levels',
    icon: 'Users',
    Component: lazyPage(() => import('./pages/Users/UsersPage').then(mod => ({ default: mod.UsersPage }))),
    sidebar: true,
  },
  {
    path: 'users/:id',
    label: 'User detail',
    description: 'Inspect and edit a single user record',
    icon: 'UserRound',
    Component: lazyPage(() => import('./pages/Users/UserDetailPage').then(mod => ({ default: mod.UserDetailPage }))),
    sidebar: false,
  },
  {
    path: 'teams',
    label: 'Teams',
    description: 'Team management and membership operations',
    icon: 'UsersRound',
    Component: lazyPage(() => import('./pages/Teams/TeamsPage').then(mod => ({ default: mod.TeamsPage }))),
    sidebar: true,
  },
  {
    path: 'teams/:id',
    label: 'Team detail',
    description: 'Team overview and membership controls',
    icon: 'UsersRound',
    Component: lazyPage(() => import('./pages/Teams/TeamDetailPage').then(mod => ({ default: mod.TeamDetailPage }))),
    sidebar: false,
  },
  {
    path: 'orgs',
    label: 'Organizations',
    description: 'Organization directory and billing relationships',
    icon: 'Building2',
    Component: lazyPage(() => import('./pages/Orgs/OrgsPage').then(mod => ({ default: mod.OrgsPage }))),
    sidebar: true,
  },
  {
    path: 'orgs/:id',
    label: 'Organization detail',
    description: 'Organization profile, admins, and usage',
    icon: 'Building2',
    Component: lazyPage(() => import('./pages/Orgs/OrgDetailPage').then(mod => ({ default: mod.OrgDetailPage }))),
    sidebar: false,
  },
  {
    path: 'models',
    label: 'Models',
    description: 'LLM provider management and model configuration',
    icon: 'Bot',
    Component: lazyPage(() => import('./pages/Models/ModelsPage').then(mod => ({ default: mod.ModelsPage }))),
    sidebar: true,
  },
  {
    path: 'usage',
    label: 'Usage',
    description: 'Aggregated usage reporting and charts',
    icon: 'Activity',
    Component: lazyPage(() => import('./pages/Usage/UsagePage').then(mod => ({ default: mod.UsagePage }))),
    sidebar: true,
  },
  {
    path: 'billing',
    label: 'Billing',
    description: 'Invoice and subscription summaries (read only)',
    icon: 'Receipt',
    Component: lazyPage(() => import('./pages/Billing/BillingPage').then(mod => ({ default: mod.BillingPage }))),
    sidebar: true,
  },
  {
    path: 'feature-flags',
    label: 'Feature flags',
    description: 'Toggle rollout and manage feature configuration',
    icon: 'ToggleLeft',
    Component: lazyPage(() => import('./pages/FeatureFlags/FeatureFlagsPage').then(mod => ({ default: mod.FeatureFlagsPage }))),
    sidebar: true,
  },
  {
    path: 'audit',
    label: 'Audit',
    description: 'Security and governance event stream',
    icon: 'ScrollText',
    Component: lazyPage(() => import('./pages/Audit/AuditPage').then(mod => ({ default: mod.AuditPage }))),
    sidebar: true,
  },
  {
    path: 'support',
    label: 'Support',
    description: 'Ticket queue and customer communications',
    icon: 'LifeBuoy',
    Component: lazyPage(() => import('./pages/Support/SupportPage').then(mod => ({ default: mod.SupportPage }))),
    sidebar: true,
  },
  {
    path: 'announcements',
    label: 'Announcements',
    description: 'Publish internal and external announcements',
    icon: 'Megaphone',
    Component: lazyPage(() => import('./pages/Announcements/AnnouncementsPage').then(mod => ({ default: mod.AnnouncementsPage }))),
    sidebar: true,
  },
  {
    path: 'moderation',
    label: 'Moderation',
    description: 'Content moderation queues and actions',
    icon: 'ShieldAlert',
    Component: lazyPage(() => import('./pages/Moderation/ModerationPage').then(mod => ({ default: mod.ModerationPage }))),
    sidebar: true,
    roles: ['moderator', 'admin'],
  },
  {
    path: 'sessions',
    label: 'Sessions',
    description: 'Active session management and terminations',
    icon: 'Clock9',
    Component: lazyPage(() => import('./pages/Sessions/SessionsPage').then(mod => ({ default: mod.SessionsPage }))),
    sidebar: true,
  },
  {
    path: 'settings',
    label: 'Settings',
    description: 'Admin profile and environment configuration',
    icon: 'Settings',
    Component: lazyPage(() => import('./pages/Settings/SettingsPage').then(mod => ({ default: mod.SettingsPage }))),
    sidebar: true,
  },
];

export const sidebarRoutes = adminRoutes.filter(route => route.sidebar !== false);
