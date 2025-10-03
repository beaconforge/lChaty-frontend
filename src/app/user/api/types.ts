export type Role = 'parent' | 'child' | 'user' | string;

export type CurrentUser = {
  id: string;
  username: string;
  roles: Role[];
  householdId?: string;
  children?: ChildSummary[];
};

export type ChildSummary = {
  id: string;
  name: string;
  avatarUrl?: string;
  safetyLevel?: string;
};

export type ThreadSummary = {
  id: string;
  title: string;
  updatedAt: string;
  pinned?: boolean;
  folder?: string;
};

export type MessageAuthorRole = 'user' | 'assistant' | 'system';

export type Message = {
  id: string;
  threadId: string;
  author: {
    id: string;
    name: string;
    role: MessageAuthorRole;
    avatarUrl?: string;
  };
  createdAt: string;
  content: string;
  citations?: Array<{ id: string; title: string; url: string }>;
  attachments?: Array<{
    id: string;
    fileName: string;
    url: string;
    contentType: string;
  }>;
  metadata?: Record<string, unknown>;
  streaming?: boolean;
};

export type CreateThreadPayload = {
  title?: string;
};

export type SendMessagePayload = {
  text: string;
  attachments?: string[];
};

export type FamilyOverview = {
  householdId: string;
  parents: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
  }>;
  children: ChildSummary[];
};

export type FamilyRequest = {
  id: string;
  childId: string;
  type: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  payload: Record<string, unknown>;
};

export type KidsPreset = {
  key: string;
  label: string;
  description: string;
  icon?: string;
  prompt: string;
};

export type UsageSummary = {
  totals: {
    messagesToday: number;
    streak: number;
    minutesToday: number;
  };
  byDay: Array<{
    date: string;
    messages: number;
    minutes: number;
  }>;
};
