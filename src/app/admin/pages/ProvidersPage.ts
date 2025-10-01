/**
 * Providers management page
 */

import { adminApi, Provider } from '@/services/api.admin';

export class ProvidersPage {
  private container: HTMLElement;
  private providers: Provider[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    this.container.innerHTML = `
      <div class="admin-content-header">
        <h2 class="admin-content-title">AI Providers</h2>
        <button id="addProviderButton" class="btn-primary">
          Add Provider
        </button>
      </div>
      
      <div id="providersContent" class="admin-grid admin-grid-2">
        ${this.renderLoadingState()}
      </div>
    `;

    this.attachEventListeners();
    await this.loadProviders();
  }

  private renderLoadingState(): string {
    return Array.from({ length: 3 }, () => `
      <div class="admin-card">
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    `).join('');
  }

  private async loadProviders(): Promise<void> {
    try {
      this.providers = await adminApi.getProviders();
      this.renderProviders();
    } catch (error: any) {
      this.renderError(error.message || 'Failed to load providers');
    }
  }

  private renderProviders(): void {
    const content = this.container.querySelector('#providersContent') as HTMLElement;
    if (!content) return;

    if (this.providers.length === 0) {
      content.innerHTML = `
        <div class="col-span-2 text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No providers configured</h3>
          <p class="text-gray-500 mb-4">Add AI providers to start using the chat platform.</p>
          <button class="btn-primary" onclick="document.getElementById('addProviderButton').click()">
            Add Your First Provider
          </button>
        </div>
      `;
      return;
    }

    content.innerHTML = this.providers.map(provider => this.renderProvider(provider)).join('');
  }

  private renderProvider(provider: Provider): string {
    return `
      <div class="admin-card" data-provider-id="${provider.id}">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="font-semibold text-gray-900">${provider.name}</h3>
            <p class="text-sm text-gray-600">${provider.type}</p>
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="admin-badge ${provider.enabled ? 'admin-badge-success' : 'admin-badge-warning'}">
              ${provider.enabled ? 'Enabled' : 'Disabled'}
            </span>
            
            <div class="relative" data-dropdown>
              <button class="text-gray-400 hover:text-gray-600" data-dropdown-toggle>
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="space-y-2">
          ${provider.endpoint ? `
            <div class="text-sm">
              <span class="text-gray-500">Endpoint:</span>
              <span class="font-mono">${provider.endpoint}</span>
            </div>
          ` : ''}
          
          <div class="text-sm">
            <span class="text-gray-500">API Key:</span>
            <span class="admin-badge ${provider.api_key_set ? 'admin-badge-success' : 'admin-badge-error'}">
              ${provider.api_key_set ? 'Configured' : 'Missing'}
            </span>
          </div>
          
          <div class="text-sm">
            <span class="text-gray-500">Models:</span>
            <span class="font-medium">${provider.models.length}</span>
          </div>
          
          <div class="text-xs text-gray-400">
            Created ${new Date(provider.created_at).toLocaleDateString()}
          </div>
        </div>
        
        <div class="mt-4 flex space-x-2">
          <button class="btn-ghost text-sm" data-action="test" data-provider-id="${provider.id}">
            Test Connection
          </button>
          <button class="btn-ghost text-sm" data-action="edit" data-provider-id="${provider.id}">
            Edit
          </button>
          <button class="btn-ghost text-sm text-red-600" data-action="delete" data-provider-id="${provider.id}">
            Delete
          </button>
        </div>
      </div>
    `;
  }

  private renderError(message: string): void {
    const content = this.container.querySelector('#providersContent') as HTMLElement;
    if (!content) return;

    content.innerHTML = `
      <div class="col-span-2 text-center py-12">
        <div class="text-red-500 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Providers</h3>
        <p class="text-gray-500 mb-4">${message}</p>
        <button class="btn-primary" onclick="window.location.reload()">
          Retry
        </button>
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Add provider button
    const addButton = this.container.querySelector('#addProviderButton');
    addButton?.addEventListener('click', () => {
      this.showAddProviderForm();
    });

    // Provider action buttons
    this.container.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const action = target.getAttribute('data-action');
      const providerId = target.getAttribute('data-provider-id');

      if (!action || !providerId) return;

      switch (action) {
        case 'test':
          await this.testProvider(providerId);
          break;
        case 'edit':
          this.editProvider(providerId);
          break;
        case 'delete':
          await this.deleteProvider(providerId);
          break;
      }
    });
  }

  private showAddProviderForm(): void {
    // Placeholder for add provider modal/form
    alert('Add Provider form coming soon!');
  }

  private editProvider(providerId: string): void {
    // Placeholder for edit provider modal/form
    console.log('Edit provider:', providerId);
    alert('Edit Provider form coming soon!');
  }

  private async testProvider(providerId: string): Promise<void> {
    try {
      const result = await adminApi.testProvider(providerId);
      alert(`Test ${result.success ? 'successful' : 'failed'}: ${result.message}`);
    } catch (error: any) {
      alert(`Test failed: ${error.message}`);
    }
  }

  private async deleteProvider(providerId: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this provider?')) {
      return;
    }

    try {
      await adminApi.deleteProvider(providerId);
      await this.loadProviders(); // Refresh list
    } catch (error: any) {
      alert(`Failed to delete provider: ${error.message}`);
    }
  }
}