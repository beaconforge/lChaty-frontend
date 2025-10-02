/**
 * Loading state management utilities
 */

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  progress?: number;
}

export type LoadingListener = (state: LoadingState) => void;

class LoadingService {
  private states: Map<string, LoadingState> = new Map();
  private listeners: Map<string, Set<LoadingListener>> = new Map();

  /**
   * Start loading for a specific operation
   */
  start(operation: string, progress?: number): void {
    this.updateState(operation, {
      isLoading: true,
      error: null,
      progress
    });
  }

  /**
   * Update progress for an operation
   */
  updateProgress(operation: string, progress: number): void {
    const current = this.states.get(operation);
    if (current?.isLoading) {
      this.updateState(operation, { ...current, progress });
    }
  }

  /**
   * Complete loading successfully
   */
  success(operation: string): void {
    this.updateState(operation, {
      isLoading: false,
      error: null,
      progress: 100
    });
  }

  /**
   * Complete loading with error
   */
  error(operation: string, error: string): void {
    this.updateState(operation, {
      isLoading: false,
      error,
      progress: undefined
    });
  }

  /**
   * Get current state for an operation
   */
  getState(operation: string): LoadingState {
    return this.states.get(operation) || {
      isLoading: false,
      error: null
    };
  }

  /**
   * Subscribe to state changes for an operation
   */
  subscribe(operation: string, listener: LoadingListener): () => void {
    if (!this.listeners.has(operation)) {
      this.listeners.set(operation, new Set());
    }
    
    this.listeners.get(operation)!.add(listener);
    
    // Call immediately with current state
    listener(this.getState(operation));
    
    return () => {
      const operationListeners = this.listeners.get(operation);
      if (operationListeners) {
        operationListeners.delete(listener);
        if (operationListeners.size === 0) {
          this.listeners.delete(operation);
        }
      }
    };
  }

  /**
   * Clear all states
   */
  clear(): void {
    this.states.clear();
    this.notifyAllListeners();
  }

  private updateState(operation: string, state: LoadingState): void {
    this.states.set(operation, state);
    this.notifyListeners(operation);
  }

  private notifyListeners(operation: string): void {
    const listeners = this.listeners.get(operation);
    const state = this.getState(operation);
    
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(state);
        } catch (error) {
          console.error('Loading listener error:', error);
        }
      });
    }
  }

  private notifyAllListeners(): void {
    this.listeners.forEach((_, operation) => {
      this.notifyListeners(operation);
    });
  }
}

// Export singleton instance
export const loadingService = new LoadingService();

/**
 * Loading spinner component
 */
export class LoadingSpinner {
  private container: HTMLElement;
  private unsubscribe?: () => void;

  constructor(container: HTMLElement, operation: string = 'default') {
    this.container = container;
    
    this.unsubscribe = loadingService.subscribe(operation, (state) => {
      this.render(state);
    });
  }

  private render(state: LoadingState): void {
    if (state.isLoading) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center p-4" role="status" aria-live="polite">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--lchaty-accent-600)]"></div>
          <span class="ml-3 text-[var(--lchaty-fg)]">Loading...</span>
          ${state.progress !== undefined ? `
            <div class="ml-3 w-24 bg-gray-200 rounded-full h-2">
              <div class="bg-[var(--lchaty-accent-600)] h-2 rounded-full transition-all duration-300" style="width: ${state.progress}%"></div>
            </div>
          ` : ''}
        </div>
      `;
    } else if (state.error) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center p-4 text-red-600" role="alert">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span>Error: ${state.error}</span>
        </div>
      `;
    } else {
      this.container.innerHTML = '';
    }
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}