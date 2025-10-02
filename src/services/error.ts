/**
 * Global error handling and error boundary functionality
 */

export interface ErrorInfo {
  message: string;
  stack?: string;
  status?: number;
  timestamp: Date;
  operation?: string;
  userAgent?: string;
}

export type ErrorListener = (error: ErrorInfo) => void;

class ErrorService {
  private listeners: Set<ErrorListener> = new Set();
  private errors: ErrorInfo[] = [];
  private maxErrors = 100; // Keep last 100 errors

  constructor() {
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date(),
        operation: 'unhandledPromise',
        userAgent: navigator.userAgent
      });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
        timestamp: new Date(),
        operation: 'globalError',
        userAgent: navigator.userAgent
      });
    });
  }

  /**
   * Capture and log an error
   */
  captureError(error: Partial<ErrorInfo> & { message: string }): void {
    const errorInfo: ErrorInfo = {
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      ...error
    };

    // Add to errors array
    this.errors.unshift(errorInfo);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error captured:', errorInfo);
    }

    // Notify listeners
    this.notifyListeners(errorInfo);
  }

  /**
   * Handle API errors with user-friendly messages
   */
  handleApiError(error: any, operation?: string): ErrorInfo {
    let message = 'An unexpected error occurred';
    let status: number | undefined;

    if (error?.response) {
      status = error.response.status;
      switch (status) {
        case 400:
          message = 'Invalid request. Please check your input.';
          break;
        case 401:
          message = 'Authentication required. Please log in.';
          break;
        case 403:
          message = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 408:
          message = 'Request timeout. Please try again.';
          break;
        case 429:
          message = 'Too many requests. Please wait and try again.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        case 502:
        case 503:
        case 504:
          message = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          message = error.response.data?.message || `Server error (${status})`;
      }
    } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      message = 'Network connection failed. Please check your internet connection.';
    } else if (error?.code === 'TIMEOUT') {
      message = 'Request timed out. Please try again.';
    } else if (error?.message) {
      message = error.message;
    }

    const errorInfo: ErrorInfo = {
      message,
      status,
      stack: error?.stack,
      timestamp: new Date(),
      operation,
      userAgent: navigator.userAgent
    };

    this.captureError(errorInfo);
    return errorInfo;
  }

  /**
   * Subscribe to error events
   */
  subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get recent errors
   */
  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = [];
  }

  private notifyListeners(error: ErrorInfo): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error listener failed:', err);
      }
    });
  }
}

// Export singleton instance
export const errorService = new ErrorService();

/**
 * Error boundary component for displaying errors to users
 */
export class ErrorBoundary {
  private unsubscribe?: () => void;

  constructor(_container: HTMLElement) {
    // Container not currently used but kept for future expansion
    
    this.unsubscribe = errorService.subscribe((error) => {
      this.renderError(error);
    });
  }

  private renderError(error: ErrorInfo): void {
    // Only show recent errors (within last 5 seconds)
    const isRecent = Date.now() - error.timestamp.getTime() < 5000;
    
    if (!isRecent) return;

    const errorElement = document.createElement('div');
    errorElement.className = 'fixed top-4 right-4 max-w-sm bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 animate-slide-in';
    errorElement.setAttribute('role', 'alert');
    
    errorElement.innerHTML = `
      <div class="flex items-start">
        <svg class="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-1 text-sm text-red-700">
            ${error.message}
            ${error.operation ? `<div class="text-xs text-red-600 mt-1">Operation: ${error.operation}</div>` : ''}
          </div>
        </div>
        <button 
          class="ml-3 inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          onclick="this.parentElement.parentElement.remove()"
          aria-label="Dismiss error"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(errorElement);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.remove();
      }
    }, 10000);
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}