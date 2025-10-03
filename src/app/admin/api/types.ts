export type RawAdminUser = {
  id: string;
  admin_user_id?: string;
  user_id?: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  name?: string;
  role?: string | string[];
  roles?: string[];
  status?: string;
  title?: string;
  org_id?: string;
  created_at?: string;
  updated_at?: string;
  last_activity_at?: string;
  session_count?: number;
};

export type AdminUser = {
  id: string;
  adminUserId?: string;
  userId?: string;
  username: string;
  email: string;
  name?: string;
  roles: string[];
  status?: string;
  title?: string;
  orgId?: string;
  createdAt?: string;
  updatedAt?: string;
  lastActivityAt?: string;
  sessionCount?: number;
};

export function normalizeAdminUser(raw: RawAdminUser): AdminUser {
  const first = raw.first_name?.trim();
  const last = raw.last_name?.trim();
  const compositeName = raw.display_name || raw.name || [first, last].filter(Boolean).join(' ').trim();
  const username = raw.username || (first || last ? [first, last].filter(Boolean).join('.').toLowerCase() : raw.email);
  const roleList = Array.isArray(raw.roles)
    ? raw.roles
    : raw.role
    ? String(raw.role)
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
    : [];

  return {
    id: String(raw.id),
    adminUserId: raw.admin_user_id,
    userId: raw.user_id,
    username: username || raw.email,
    email: raw.email,
    name: compositeName || username || raw.email,
    roles: roleList,
    status: raw.status,
    title: raw.title,
    orgId: raw.org_id,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    lastActivityAt: raw.last_activity_at,
    sessionCount: raw.session_count,
  };
}

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type FeatureFlag = {
  key: string;
  description?: string;
  enabled: boolean;
  rollout?: number;
  notes?: string;
  updatedAt?: string;
};

export type AuditEvent = {
  id: string;
  actor: string;
  action: string;
  resource: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type SupportTicket = {
  id: string;
  subject: string;
  status: string;
  requester: string;
  createdAt: string;
  updatedAt: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: string;
  createdAt: string;
  updatedAt: string;
};

export type ModerationReport = {
  id: string;
  status: string;
  reason: string;
  createdAt: string;
  reporter: string;
};

export type Session = {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
  lastSeenAt: string;
};
