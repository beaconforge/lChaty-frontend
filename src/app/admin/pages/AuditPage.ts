/**
 * Audit logs page
 */

import { adminApi, AuditLog } from '@/services/api.admin';

export class AuditPage {
  private container: HTMLElement;
  private auditLogs: AuditLog[] = [];
  private currentPage = 1;
  private perPage = 25;
  private totalLogs = 0;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    this.container.innerHTML = `
      <div class="admin-content-header">
        <h2 class="admin-content-title">Audit Logs</h2>
        <button id="refreshButton" class="btn-ghost">
          Refresh
        </button>
      </div>
      
      <!-- Filters -->
      <div class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select id="actionFilter" class="input text-sm">
              <option value="">All actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="chat">Chat</option>
              <option value="admin">Admin Action</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
            <select id="resourceFilter" class="input text-sm">
              <option value="">All resources</option>
              <option value="user">User</option>
              <option value="provider">Provider</option>
              <option value="model">Model</option>
              <option value="chat">Chat</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" id="startDateFilter" class="input text-sm">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" id="endDateFilter" class="input text-sm">
          </div>
        </div>
        
        <div class="mt-4">
          <button id="applyFiltersButton" class="btn-primary">
            Apply Filters
          </button>
          <button id="clearFiltersButton" class="btn-ghost ml-2">
            Clear
          </button>
        </div>
      </div>
      
      <div id="auditContent">
        ${this.renderLoadingState()}
      </div>
      
      <!-- Pagination -->
      <div id="pagination" class="mt-6 flex justify-between items-center">
        <!-- Pagination will be rendered here -->
      </div>
    `;

    this.attachEventListeners();
    await this.loadAuditLogs();
  }

  private renderLoadingState(): string {
    return `
      <div class="space-y-3">
        ${Array.from({ length: 10 }, () => `
          <div class="admin-card">
            <div class="animate-pulse space-y-2">
              <div class="flex justify-between items-start">
                <div class="space-y-1">
                  <div class="h-3 bg-gray-200 rounded w-32"></div>
                  <div class="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div class="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div class="h-3 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private async loadAuditLogs(filters: any = {}): Promise<void> {
    try {
      const params = {
        limit: this.perPage,
        offset: (this.currentPage - 1) * this.perPage,
        ...filters
      };

      const response = await adminApi.getAuditLogs(params);
      
      this.auditLogs = response.logs;
      this.totalLogs = response.total;
      
      this.renderAuditLogs();
      this.renderPagination();
    } catch (error: any) {
      this.renderError(error.message || 'Failed to load audit logs');
    }
  }

  private renderAuditLogs(): void {
    const content = this.container.querySelector('#auditContent') as HTMLElement;
    if (!content) return;

    if (this.auditLogs.length === 0) {
      content.innerHTML = this.renderEmptyState();
      return;
    }

    content.innerHTML = `
      <div class="space-y-3">
        ${this.auditLogs.map(log => this.renderAuditLog(log)).join('')}
      </div>
    `;
  }

  private renderEmptyState(): string {
    return `
      <div class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
        <p class="text-gray-500">No logs match your current filters.</p>
      </div>
    `;
  }

  private renderAuditLog(log: AuditLog): string {
    const timestamp = new Date(log.created_at).toLocaleString();
    
    return `
      <div class="admin-card">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <span class="admin-badge admin-badge-info">${log.action}</span>
              <span class="admin-badge admin-badge-secondary">${log.resource_type}</span>
              <span class="text-sm text-gray-600">${log.username}</span>
            </div>
            
            <div class="text-sm text-gray-900 mb-2">
              ${this.formatLogMessage(log)}
            </div>
            
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-500">
              <div>
                <span>Time:</span> ${timestamp}
              </div>
              
              ${log.ip_address ? `
                <div>
                  <span>IP:</span> ${log.ip_address}
                </div>
              ` : ''}
              
              ${log.resource_id ? `
                <div>
                  <span>Resource ID:</span> <span class="font-mono">${log.resource_id}</span>
                </div>
              ` : ''}
              
              <div>
                <span>Log ID:</span> <span class="font-mono">${log.id}</span>
              </div>
            </div>
            
            ${log.details ? `
              <details class="mt-2">
                <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  View Details
                </summary>
                <pre class="mt-2 text-xs bg-gray-50 p-2 rounded font-mono overflow-x-auto">${JSON.stringify(log.details, null, 2)}</pre>
              </details>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  private formatLogMessage(log: AuditLog): string {
    switch (log.action) {
      case 'login':
        return `User logged in`;
      case 'logout':
        return `User logged out`;
      case 'chat':
        return `Chat message sent`;
      case 'create':
        return `Created ${log.resource_type}${log.resource_id ? ` (${log.resource_id})` : ''}`;
      case 'update':
        return `Updated ${log.resource_type}${log.resource_id ? ` (${log.resource_id})` : ''}`;
      case 'delete':
        return `Deleted ${log.resource_type}${log.resource_id ? ` (${log.resource_id})` : ''}`;
      default:
        return `${log.action} on ${log.resource_type}`;
    }
  }

  private renderPagination(): void {
    const pagination = this.container.querySelector('#pagination') as HTMLElement;
    if (!pagination) return;

    const totalPages = Math.ceil(this.totalLogs / this.perPage);
    const startItem = (this.currentPage - 1) * this.perPage + 1;
    const endItem = Math.min(this.currentPage * this.perPage, this.totalLogs);

    if (totalPages <= 1) {
      pagination.innerHTML = `
        <div class="text-sm text-gray-600">
          ${this.totalLogs} total log${this.totalLogs !== 1 ? 's' : ''}
        </div>
      `;
      return;
    }

    pagination.innerHTML = `
      <div class="text-sm text-gray-600">
        Showing ${startItem}-${endItem} of ${this.totalLogs} logs
      </div>
      
      <div class="flex space-x-2">
        <button 
          ${this.currentPage === 1 ? 'disabled' : ''} 
          class="btn-ghost text-sm ${this.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
          data-page="${this.currentPage - 1}"
        >
          Previous
        </button>
        
        ${this.renderPageNumbers(totalPages)}
        
        <button 
          ${this.currentPage === totalPages ? 'disabled' : ''} 
          class="btn-ghost text-sm ${this.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
          data-page="${this.currentPage + 1}"
        >
          Next
        </button>
      </div>
    `;
  }

  private renderPageNumbers(totalPages: number): string {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(`
        <button 
          class="btn-ghost text-sm ${i === this.currentPage ? 'bg-primary-100 text-primary-700' : ''}"
          data-page="${i}"
        >
          ${i}
        </button>
      `);
    }

    return pages.join('');
  }

  private renderError(message: string): void {
    const content = this.container.querySelector('#auditContent') as HTMLElement;
    if (!content) return;

    content.innerHTML = `
      <div class="text-center py-12">
        <div class="text-red-500 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Audit Logs</h3>
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
      this.loadAuditLogs();
    });

    // Filter buttons
    const applyButton = this.container.querySelector('#applyFiltersButton');
    applyButton?.addEventListener('click', () => {
      this.applyFilters();
    });

    const clearButton = this.container.querySelector('#clearFiltersButton');
    clearButton?.addEventListener('click', () => {
      this.clearFilters();
    });

    // Pagination
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const page = target.getAttribute('data-page');
      
      if (page && !(target as HTMLButtonElement).disabled) {
        this.currentPage = parseInt(page);
        this.loadAuditLogs(this.getCurrentFilters());
      }
    });
  }

  private applyFilters(): void {
    this.currentPage = 1; // Reset to first page
    this.loadAuditLogs(this.getCurrentFilters());
  }

  private clearFilters(): void {
    // Clear all filter inputs
    (this.container.querySelector('#actionFilter') as HTMLSelectElement).value = '';
    (this.container.querySelector('#resourceFilter') as HTMLSelectElement).value = '';
    (this.container.querySelector('#startDateFilter') as HTMLInputElement).value = '';
    (this.container.querySelector('#endDateFilter') as HTMLInputElement).value = '';
    
    // Reload with no filters
    this.currentPage = 1;
    this.loadAuditLogs();
  }

  private getCurrentFilters(): any {
    const filters: any = {};
    
    const action = (this.container.querySelector('#actionFilter') as HTMLSelectElement)?.value;
    if (action) filters.action = action;
    
    const resourceType = (this.container.querySelector('#resourceFilter') as HTMLSelectElement)?.value;
    if (resourceType) filters.resource_type = resourceType;
    
    const startDate = (this.container.querySelector('#startDateFilter') as HTMLInputElement)?.value;
    if (startDate) filters.start_date = startDate;
    
    const endDate = (this.container.querySelector('#endDateFilter') as HTMLInputElement)?.value;
    if (endDate) filters.end_date = endDate;
    
    return filters;
  }
}