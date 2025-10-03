export type AdminUser = {
  id: string;
  username: string;
  email: string;
  roles: string[];
  orgId?: string;
  status?: string;
  createdAt?: string;
  title?: string;
  name?: string;
};

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
