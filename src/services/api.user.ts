/**
 * User API service - handles authentication and user-facing endpoints
 */

import { http } from './http';
import { AUTH_ENDPOINTS, CHAT_ENDPOINTS } from '@/config/backend';

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
}

// Export singleton instance
export const userApi = new UserApiService();
export default userApi;