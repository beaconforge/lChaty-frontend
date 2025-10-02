/**
 * HTTP client service with axios
 * Configured for lChaty backend with credential support
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, TIMEOUTS, RETRY_CONFIG } from '@/config/backend';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

class HttpService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: TIMEOUTS.default,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any request modifications here (auth headers, etc.)
        try {
          // Surface request info to the browser console so Playwright can capture it
          // (only do this in browser context)
          if (typeof window !== 'undefined' && typeof (window as any).console !== 'undefined' && typeof (window as any).console.debug === 'function') {
            // build full url if baseURL present
            const fullUrl = (config.baseURL || '') + (config.url || '');
            // Avoid logging bodies that might contain sensitive data in CI; only log method+url
            // but in local dev this helps to diagnose missing network calls
            // eslint-disable-next-line no-console
            console.debug('[http] request ->', (config.method || '').toUpperCase(), fullUrl);
          }
        } catch (e) {
          // swallow logging errors
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        try {
          if (typeof window !== 'undefined' && typeof (window as any).console !== 'undefined' && typeof (window as any).console.debug === 'function') {
            const cfg: any = response.config || {};
            const fullUrl = (cfg.baseURL || '') + (cfg.url || '');
            // eslint-disable-next-line no-console
            console.debug('[http] response <-', response.status, fullUrl, response.headers && (response.headers['set-cookie'] || response.headers['Set-Cookie'] || '<no-set-cookie>'));
          }
        } catch (e) {
          // ignore
        }
        return response;
      },
      async (error: AxiosError) => {
        const apiError = this.transformError(error);
        
        // Retry logic for specific conditions
        if (this.shouldRetry(error)) {
          return this.retryRequest(error);
        }

        try {
          if (typeof window !== 'undefined' && typeof (window as any).console !== 'undefined' && typeof (window as any).console.debug === 'function') {
            // eslint-disable-next-line no-console
            console.debug('[http] error <-', apiError.status || '<no-status>', apiError.message || '<no-message>');
          }
        } catch (e) {
          // ignore
        }
        return Promise.reject(apiError);
      }
    );
  }

  private transformError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      return {
        message: data?.message || data?.error || `HTTP ${error.response.status}`,
        status: error.response.status,
        code: data?.code,
        details: data?.details
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR'
      };
    } else {
      // Request setup error
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'REQUEST_ERROR'
      };
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    const retryCount = (error.config as any)?.__retryCount || 0;
    return retryCount < RETRY_CONFIG.maxRetries && 
           RETRY_CONFIG.retryCondition(error);
  }

  private async retryRequest(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config as any;
    config.__retryCount = (config.__retryCount || 0) + 1;
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay));
    
    return this.client.request(config);
  }

  // Public methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // Stream support for chat
  async stream(url: string, data?: any, config?: AxiosRequestConfig): Promise<ReadableStream> {
    const response = await this.client.post(url, data, {
      ...config,
      timeout: TIMEOUTS.chat,
      responseType: 'stream'
    });
    
    return new ReadableStream({
      start(controller) {
        response.data.on('data', (chunk: Buffer) => {
          controller.enqueue(chunk);
        });
        
        response.data.on('end', () => {
          controller.close();
        });
        
        response.data.on('error', (err: Error) => {
          controller.error(err);
        });
      }
    });
  }
}

// Export singleton instance
export const http = new HttpService();
export default http;