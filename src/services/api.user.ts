/**
 * User API service - handles authentication and user-facing endpoints
 */

import { http } from './http';
import { AUTH_ENDPOINTS, CHAT_ENDPOINTS, FAMILY_ENDPOINTS } from '@/config/backend';

export interface User {
  id: string;
  username: string;
  email?: string;
  is_admin: boolean;
  created_at: string;
  last_login?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  email?: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  model?: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  id: string;
  messages: ChatMessage[];
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
  max_tokens?: number;
  supports_streaming: boolean;
  available: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface FamilyChild extends FamilyMember {
  safetyLevel?: string;
  allowanceMinutes?: number;
  limitMinutes?: number;
}

export interface FamilySchedule {
  [day: string]: string;
}

export interface FamilyRequest {
  id: string;
  childId: string;
  type: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  note?: string;
  payload?: Record<string, unknown>;
}

export interface FamilyOverview {
  householdId: string;
  parents: FamilyMember[];
  children: FamilyChild[];
  schedule?: FamilySchedule;
  requests?: FamilyRequest[];
}

class UserApiService {
  /**
   * Get current user information
   */
  async getMe(): Promise<User> {
    return http.get<User>(AUTH_ENDPOINTS.me);
  }

  /**
   * Login with username and password
   */
  async login(credentials: LoginRequest): Promise<{ user: User; message?: string }> {
    return http.post(AUTH_ENDPOINTS.login, credentials);
  }

  /**
   * Logout current user
   */
  async logout(): Promise<{ message: string }> {
    return http.post(AUTH_ENDPOINTS.logout);
  }

  /**
   * Sign up new user
   */
  async signup(userData: SignupRequest): Promise<{ user: User; message?: string }> {
    return http.post(AUTH_ENDPOINTS.signup, userData);
  }

  /**
   * Send chat message
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    return http.post<ChatResponse>(CHAT_ENDPOINTS.chat, request);
  }

  /**
   * Stream chat response
   */
  async streamChat(request: ChatRequest): Promise<ReadableStream> {
    return http.stream(CHAT_ENDPOINTS.chat, { ...request, stream: true });
  }

  /**
   * Get available models
   */
  async getModels(): Promise<Model[]> {
    return http.get<Model[]>(CHAT_ENDPOINTS.models);
  }

  /**
   * Get chat history
   */
  async getChatHistory(limit = 50, offset = 0): Promise<{
    conversations: Array<{
      id: string;
      title: string;
      created_at: string;
      updated_at: string;
      message_count: number;
    }>;
    total: number;
  }> {
    return http.get(`${CHAT_ENDPOINTS.history}?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get specific conversation messages
   */
  async getConversationMessages(conversationId: string): Promise<{
    id: string;
    title: string;
    messages: ChatMessage[];
  }> {
    return http.get(`${CHAT_ENDPOINTS.history}/${conversationId}`);
  }

  /**
   * Retrieve family hub overview information
   */
  async getFamilyOverview(): Promise<FamilyOverview | null> {
    const data = await http.get(FAMILY_ENDPOINTS.overview);
    if (!data) {
      return null;
    }

    const householdId = data.householdId ?? data.household_id ?? 'Household';

    const parents: FamilyMember[] = Array.isArray(data.parents)
      ? data.parents.map((parent: any) => ({
          id: this.createId(parent.id ?? parent.user_id),
          name: String(parent.name ?? parent.username ?? 'Unknown parent'),
          avatarUrl: parent.avatarUrl ?? parent.avatar_url ?? undefined,
        }))
      : [];

    const children: FamilyChild[] = Array.isArray(data.children)
      ? data.children.map((child: any) => ({
          id: this.createId(child.id ?? child.child_id),
          name: String(child.name ?? 'Unnamed child'),
          avatarUrl: child.avatarUrl ?? child.avatar_url ?? undefined,
          safetyLevel: child.safetyLevel ?? child.safety_level ?? undefined,
          allowanceMinutes: child.allowanceMinutes ?? child.allowance_minutes ?? undefined,
          limitMinutes: child.limitMinutes ?? child.limit_minutes ?? undefined,
        }))
      : [];

    const schedule: FamilySchedule | undefined = data.schedule
      ? Object.entries(data.schedule).reduce<FamilySchedule>((acc, [day, value]) => {
          acc[day] = String(value);
          return acc;
        }, {})
      : undefined;

    const requests: FamilyRequest[] | undefined = Array.isArray(data.requests)
      ? data.requests.map((request: any) => this.normaliseFamilyRequest(request))
      : undefined;

    return {
      householdId,
      parents,
      children,
      schedule,
      requests,
    };
  }

  /**
   * Fetch pending family requests if available
   */
  async getFamilyRequests(): Promise<FamilyRequest[]> {
    const response = await http.get(FAMILY_ENDPOINTS.requests);
    const items = Array.isArray(response?.requests) ? response.requests : response;
    if (!Array.isArray(items)) {
      return [];
    }
    return items.map((item: any) => this.normaliseFamilyRequest(item));
  }

  /**
   * Update child settings for the family hub
   */
  async updateFamilyChild(
    childId: string,
    payload: Partial<{ safetyLevel: string; safety_level: string; allowanceMinutes: number; limitMinutes: number }>,
  ): Promise<FamilyChild> {
    const body = {
      ...payload,
      safetyLevel: payload.safetyLevel ?? payload.safety_level,
      safety_level: payload.safety_level ?? payload.safetyLevel,
    };
    const data = await http.patch(FAMILY_ENDPOINTS.child(childId), body);
    return {
      id: String(data?.id ?? childId),
      name: String(data?.name ?? 'Child'),
      avatarUrl: data?.avatarUrl ?? data?.avatar_url ?? undefined,
      safetyLevel: data?.safetyLevel ?? data?.safety_level ?? body.safetyLevel,
      allowanceMinutes: data?.allowanceMinutes ?? data?.allowance_minutes ?? undefined,
      limitMinutes: data?.limitMinutes ?? data?.limit_minutes ?? undefined,
    };
  }

  /**
   * Update status of a pending family request
   */
  async updateFamilyRequest(
    requestId: string,
    action: 'approve' | 'deny',
    note?: string,
  ): Promise<FamilyRequest> {
    const data = await http.patch(FAMILY_ENDPOINTS.request(requestId), { action, note });
    return this.normaliseFamilyRequest(data ?? { id: requestId, status: action === 'approve' ? 'approved' : 'denied' });
  }

  private normaliseFamilyRequest(request: any): FamilyRequest {
    return {
      id: this.createId(request?.id),
      childId: String(request?.childId ?? request?.child_id ?? ''),
      type: String(request?.type ?? request?.request_type ?? 'request'),
      status: (request?.status ?? 'pending') as 'pending' | 'approved' | 'denied',
      createdAt: String(request?.createdAt ?? request?.created_at ?? new Date().toISOString()),
      note: request?.note ?? undefined,
      payload: (request?.payload && typeof request.payload === 'object') ? request.payload : undefined,
    };
  }

  private createId(value?: unknown): string {
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
  }
}

// Export singleton instance
export const userApi = new UserApiService();
export default userApi;