/**
 * Admin API service - handles admin-only endpoints
 */

import { http } from './http';
import { ADMIN_ENDPOINTS, AUTH_ENDPOINTS } from '@/config/backend';
import { User } from './api.user';

export interface Provider {
  id: string;
  name: string;
  type: string;
  endpoint?: string;
  api_key_set: boolean;
  enabled: boolean;
  models: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminModel {
  id: string;
  name: string;
  provider_id: string;
  provider_name: string;
  model_id: string;
  enabled: boolean;
  max_tokens?: number;
  supports_streaming: boolean;
  cost_per_token?: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  username: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    database: {
      status: 'up' | 'down';
      response_time_ms?: number;
    };
    models: {
      status: 'up' | 'down';
      available_count: number;
      total_count: number;
    };
    providers: {
      status: 'up' | 'down';
      active_count: number;
      total_count: number;
    };
  };
  uptime: number;
  version: string;
  last_check: string;
}

export interface AdminUser extends User {
  status: 'active' | 'suspended' | 'pending';
  role: string;
  last_activity?: string;
  session_count: number;
}

export interface CreateProviderRequest {
  name: string;
  type: string;
  endpoint?: string;
  api_key?: string;
  enabled?: boolean;
}

export interface UpdateProviderRequest extends Partial<CreateProviderRequest> {
  id: string;
}

class AdminApiService {
  /**
   * Get current user and validate admin access
   */
  async getMe(): Promise<User> {
    const user = await http.get<User>(AUTH_ENDPOINTS.me);
    if (!user.is_admin) {
      throw new Error('Admin access required');
    }
    return user;
  }

  // Provider management
  async getProviders(): Promise<Provider[]> {
    return http.get<Provider[]>(ADMIN_ENDPOINTS.providers);
  }

  async createProvider(data: CreateProviderRequest): Promise<Provider> {
    return http.post<Provider>(ADMIN_ENDPOINTS.providers, data);
  }

  async updateProvider(data: UpdateProviderRequest): Promise<Provider> {
    return http.put<Provider>(`${ADMIN_ENDPOINTS.providers}/${data.id}`, data);
  }

  async deleteProvider(providerId: string): Promise<{ message: string }> {
    return http.delete(`${ADMIN_ENDPOINTS.providers}/${providerId}`);
  }

  async testProvider(providerId: string): Promise<{
    success: boolean;
    message: string;
    response_time_ms?: number;
  }> {
    return http.post(`${ADMIN_ENDPOINTS.providers}/${providerId}/test`);
  }

  // Model management
  async getModels(): Promise<AdminModel[]> {
    return http.get<AdminModel[]>(ADMIN_ENDPOINTS.models);
  }

  async updateModel(modelId: string, data: Partial<AdminModel>): Promise<AdminModel> {
    return http.put<AdminModel>(`${ADMIN_ENDPOINTS.models}/${modelId}`, data);
  }

  async syncModels(providerId?: string): Promise<{ 
    added: number; 
    updated: number; 
    message: string; 
  }> {
    const url = providerId 
      ? `${ADMIN_ENDPOINTS.models}/sync?provider_id=${providerId}`
      : `${ADMIN_ENDPOINTS.models}/sync`;
    return http.post(url);
  }

  // Audit logs
  async getAuditLogs(params: {
    limit?: number;
    offset?: number;
    user_id?: string;
    action?: string;
    resource_type?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    per_page: number;
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const url = queryParams.toString() 
      ? `${ADMIN_ENDPOINTS.audit}?${queryParams}`
      : ADMIN_ENDPOINTS.audit;
    
    return http.get(url);
  }

  // System health
  async getHealth(): Promise<SystemHealth> {
    return http.get<SystemHealth>(ADMIN_ENDPOINTS.health);
  }

  async runHealthCheck(): Promise<SystemHealth> {
    return http.post<SystemHealth>(`${ADMIN_ENDPOINTS.health}/check`);
  }

  // User management
  async getUsers(params: {
    limit?: number;
    offset?: number;
    search?: string;
    role?: string;
    status?: string;
  } = {}): Promise<{
    users: AdminUser[];
    total: number;
    page: number;
    per_page: number;
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const url = queryParams.toString() 
      ? `${ADMIN_ENDPOINTS.users}?${queryParams}`
      : ADMIN_ENDPOINTS.users;
    
    return http.get(url);
  }

  async updateUser(userId: string, data: {
    is_admin?: boolean;
    status?: 'active' | 'suspended';
  }): Promise<AdminUser> {
    return http.put<AdminUser>(`${ADMIN_ENDPOINTS.users}/${userId}`, data);
  }

  // System settings
  async getSettings(): Promise<Record<string, any>> {
    return http.get<Record<string, any>>(ADMIN_ENDPOINTS.settings);
  }

  async updateSettings(settings: Record<string, any>): Promise<Record<string, any>> {
    return http.put<Record<string, any>>(ADMIN_ENDPOINTS.settings, settings);
  }
}

// Export singleton instance
export const adminApi = new AdminApiService();
export default adminApi;