/**
 * System health monitoring page
 */

import { adminApi, SystemHealth } from '@/services/api.admin';

export class HealthPage {
  private container: HTMLElement;
  private healthData?: SystemHealth;
  private autoRefreshInterval?: NodeJS.Timeout;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    this.container.innerHTML = `
      <div class="admin-content-header">
        <h2 class="admin-content-title">System Health</h2>
        <div class="flex space-x-2">
          <button id="refreshButton" class="btn-secondary">
            Refresh
          </button>
          <button id="runHealthCheckButton" class="btn-primary">
            Run Health Check
          </button>
          <label class="flex items-center text-sm">
            <input type="checkbox" id="autoRefreshToggle" class="mr-2">
            Auto refresh (30s)
          </label>
        </div>
      </div>
      
      <div id="healthContent">
        ${this.renderLoadingState()}
      </div>
    `;

    this.attachEventListeners();
    await this.loadHealthData();
  }

  private renderLoadingState(): string {
    return `
      <div class="admin-grid admin-grid-2">
        ${Array.from({ length: 4 }, () => `
          <div class="admin-card">
            <div class="animate-pulse space-y-3">
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-8 bg-gray-200 rounded"></div>
              <div class="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private async loadHealthData(): Promise<void> {
    try {
      this.healthData = await adminApi.getHealth();
      this.renderHealthData();
    } catch (error: any) {
      this.renderError(error.message || 'Failed to load health data');
    }
  }

  private renderHealthData(): void {
    const content = this.container.querySelector('#healthContent') as HTMLElement;
    if (!content || !this.healthData) return;

    content.innerHTML = `
      <!-- Overall Status -->
      <div class="mb-8">
        <div class="admin-card">
          <div class="text-center">
            <div class="mb-4">
              ${this.renderStatusIcon(this.healthData.status)}
            </div>
            <h3 class="text-2xl font-bold mb-2">System Status: ${this.formatStatus(this.healthData.status)}</h3>
            <p class="text-gray-600">
              Version ${this.healthData.version} • Uptime: ${this.formatUptime(this.healthData.uptime)}
            </p>
            <p class="text-sm text-gray-500 mt-2">
              Last checked: ${new Date(this.healthData.last_check).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Component Status Grid -->
      <div class="admin-grid admin-grid-3">
        ${this.renderDatabaseStatus()}
        ${this.renderModelsStatus()}
        ${this.renderProvidersStatus()}
      </div>
      
      <!-- Additional Metrics -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">System Metrics</h3>
        <div class="admin-grid admin-grid-2">
          ${this.renderSystemMetrics()}
        </div>
      </div>
    `;
  }

  private renderStatusIcon(status: string): string {
    switch (status) {
      case 'healthy':
        return `
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        `;
      case 'degraded':
        return `
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
        `;
      case 'unhealthy':
        return `
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
        `;
      default:
        return '';
    }
  }

  private renderDatabaseStatus(): string {
    const db = this.healthData!.components.database;
    const status = db.status === 'up' ? 'healthy' : 'unhealthy';
    
    return `
      <div class="admin-card">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-gray-900">Database</h4>
          <span class="admin-badge ${status === 'healthy' ? 'admin-badge-success' : 'admin-badge-error'}">
            ${db.status.toUpperCase()}
          </span>
        </div>
        
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Status:</span>
            <span class="font-medium">${db.status === 'up' ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          ${db.response_time_ms ? `
            <div class="flex justify-between">
              <span class="text-gray-600">Response Time:</span>
              <span class="font-medium">${db.response_time_ms}ms</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderModelsStatus(): string {
    const models = this.healthData!.components.models;
    const percentage = models.total_count > 0 ? Math.round((models.available_count / models.total_count) * 100) : 0;
    const status = models.status === 'up' ? 'healthy' : 'unhealthy';
    
    return `
      <div class="admin-card">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-gray-900">AI Models</h4>
          <span class="admin-badge ${status === 'healthy' ? 'admin-badge-success' : 'admin-badge-error'}">
            ${models.status.toUpperCase()}
          </span>
        </div>
        
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Available:</span>
            <span class="font-medium">${models.available_count} / ${models.total_count}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Availability:</span>
            <span class="font-medium">${percentage}%</span>
          </div>
          
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div class="bg-${percentage >= 80 ? 'green' : percentage >= 50 ? 'yellow' : 'red'}-600 h-2 rounded-full" style="width: ${percentage}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  private renderProvidersStatus(): string {
    const providers = this.healthData!.components.providers;
    const percentage = providers.total_count > 0 ? Math.round((providers.active_count / providers.total_count) * 100) : 0;
    const status = providers.status === 'up' ? 'healthy' : 'unhealthy';
    
    return `
      <div class="admin-card">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-gray-900">AI Providers</h4>
          <span class="admin-badge ${status === 'healthy' ? 'admin-badge-success' : 'admin-badge-error'}">
            ${providers.status.toUpperCase()}
          </span>
        </div>
        
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Active:</span>
            <span class="font-medium">${providers.active_count} / ${providers.total_count}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Availability:</span>
            <span class="font-medium">${percentage}%</span>
          </div>
          
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div class="bg-${percentage >= 80 ? 'green' : percentage >= 50 ? 'yellow' : 'red'}-600 h-2 rounded-full" style="width: ${percentage}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  private renderSystemMetrics(): string {
    return `
      <div class="admin-card">
        <h5 class="font-medium text-gray-900 mb-3">Performance Metrics</h5>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">System Uptime:</span>
            <span class="font-medium">${this.formatUptime(this.healthData!.uptime)}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Version:</span>
            <span class="font-medium font-mono">${this.healthData!.version}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Last Health Check:</span>
            <span class="font-medium">${new Date(this.healthData!.last_check).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
      
      <div class="admin-card">
        <h5 class="font-medium text-gray-900 mb-3">Component Summary</h5>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Database Health:</span>
            <span class="admin-badge ${this.healthData!.components.database.status === 'up' ? 'admin-badge-success' : 'admin-badge-error'}">
              ${this.healthData!.components.database.status.toUpperCase()}
            </span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Models Health:</span>
            <span class="admin-badge ${this.healthData!.components.models.status === 'up' ? 'admin-badge-success' : 'admin-badge-error'}">
              ${this.healthData!.components.models.status.toUpperCase()}
            </span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Providers Health:</span>
            <span class="admin-badge ${this.healthData!.components.providers.status === 'up' ? 'admin-badge-success' : 'admin-badge-error'}">
              ${this.healthData!.components.providers.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  private formatStatus(status: string): string {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'degraded': return 'Degraded';
      case 'unhealthy': return 'Unhealthy';
      default: return 'Unknown';
    }
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  private renderError(message: string): void {
    const content = this.container.querySelector('#healthContent') as HTMLElement;
    if (!content) return;

    content.innerHTML = `
      <div class="text-center py-12">
        <div class="text-red-500 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Health Data</h3>
        <p class="text-gray-500 mb-4">${message}</p>
        <button class="btn-primary" onclick="window.location.reload()">
          Retry
        </button>
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Refresh button
    const refreshButton = this.container.querySelector('#refreshButton');
    refreshButton?.addEventListener('click', () => {
      this.loadHealthData();
    });

    // Run health check button
    const runCheckButton = this.container.querySelector('#runHealthCheckButton');
    runCheckButton?.addEventListener('click', () => {
      this.runHealthCheck();
    });

    // Auto refresh toggle
    const autoRefreshToggle = this.container.querySelector('#autoRefreshToggle') as HTMLInputElement;
    autoRefreshToggle?.addEventListener('change', () => {
      this.toggleAutoRefresh(autoRefreshToggle.checked);
    });
  }

  private async runHealthCheck(): Promise<void> {
    try {
      const button = this.container.querySelector('#runHealthCheckButton') as HTMLButtonElement;
      button.disabled = true;
      button.textContent = 'Running Check...';

      this.healthData = await adminApi.runHealthCheck();
      this.renderHealthData();
    } catch (error: any) {
      alert(`Health check failed: ${error.message}`);
    } finally {
      const button = this.container.querySelector('#runHealthCheckButton') as HTMLButtonElement;
      button.disabled = false;
      button.textContent = 'Run Health Check';
    }
  }

  private toggleAutoRefresh(enabled: boolean): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = undefined;
    }

    if (enabled) {
      this.autoRefreshInterval = setInterval(() => {
        this.loadHealthData();
      }, 30000); // Refresh every 30 seconds
    }
  }

  // Cleanup method to call when leaving the page
  destroy(): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = undefined;
    }
  }
}