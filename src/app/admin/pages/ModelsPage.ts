/**
 * Models management page
 */

import { adminApi, AdminModel } from '@/services/api.admin';

export class ModelsPage {
  private container: HTMLElement;
  private models: AdminModel[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    this.container.innerHTML = `
      <div class="admin-content-header">
        <h2 class="admin-content-title">AI Models</h2>
        <div class="flex space-x-2">
          <button id="syncModelsButton" class="btn-secondary">
            Sync Models
          </button>
          <button id="refreshButton" class="btn-ghost">
            Refresh
          </button>
        </div>
      </div>
      
      <div class="mb-6">
        <div class="flex space-x-4 text-sm">
          <label class="flex items-center">
            <input type="checkbox" id="showEnabledOnly" class="mr-2">
            Show enabled only
          </label>
          <select id="providerFilter" class="input text-sm">
            <option value="">All providers</option>
          </select>
        </div>
      </div>
      
      <div id="modelsContent">
        ${this.renderLoadingState()}
      </div>
    `;

    this.attachEventListeners();
    await this.loadModels();
  }

  private renderLoadingState(): string {
    return `
      <div class="space-y-4">
        ${Array.from({ length: 5 }, () => `
          <div class="admin-card">
            <div class="animate-pulse space-y-3">
              <div class="flex justify-between items-start">
                <div class="space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-48"></div>
                  <div class="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div class="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div class="h-3 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private async loadModels(): Promise<void> {
    try {
      this.models = await adminApi.getModels();
      this.updateProviderFilter();
      this.renderModels();
    } catch (error: any) {
      this.renderError(error.message || 'Failed to load models');
    }
  }

  private updateProviderFilter(): void {
    const filter = this.container.querySelector('#providerFilter') as HTMLSelectElement;
    if (!filter) return;

    const providers = [...new Set(this.models.map(m => m.provider_name))];
    
    filter.innerHTML = '<option value="">All providers</option>' + 
      providers.map(provider => `<option value="${provider}">${provider}</option>`).join('');
  }

  private renderModels(): void {
    const content = this.container.querySelector('#modelsContent') as HTMLElement;
    if (!content) return;

    const showEnabledOnly = (this.container.querySelector('#showEnabledOnly') as HTMLInputElement)?.checked || false;
    const providerFilter = (this.container.querySelector('#providerFilter') as HTMLSelectElement)?.value || '';

    let filteredModels = this.models;
    
    if (showEnabledOnly) {
      filteredModels = filteredModels.filter(m => m.enabled);
    }
    
    if (providerFilter) {
      filteredModels = filteredModels.filter(m => m.provider_name === providerFilter);
    }

    if (filteredModels.length === 0) {
      content.innerHTML = this.renderEmptyState();
      return;
    }

    content.innerHTML = `
      <div class="space-y-4">
        ${filteredModels.map(model => this.renderModel(model)).join('')}
      </div>
    `;
  }

  private renderEmptyState(): string {
    return `
      <div class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No models found</h3>
        <p class="text-gray-500 mb-4">
          No models match your current filters, or no models are configured.
        </p>
        <button id="syncModelsFromEmpty" class="btn-primary">
          Sync Models from Providers
        </button>
      </div>
    `;
  }

  private renderModel(model: AdminModel): string {
    return `
      <div class="admin-card" data-model-id="${model.id}">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="font-medium text-gray-900">${model.name}</h3>
              <span class="admin-badge admin-badge-info">${model.provider_name}</span>
              <span class="admin-badge ${model.enabled ? 'admin-badge-success' : 'admin-badge-warning'}">
                ${model.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Model ID:</span>
                <div class="font-mono text-xs">${model.model_id}</div>
              </div>
              
              ${model.max_tokens ? `
                <div>
                  <span class="text-gray-500">Max Tokens:</span>
                  <div class="font-medium">${model.max_tokens.toLocaleString()}</div>
                </div>
              ` : ''}
              
              <div>
                <span class="text-gray-500">Streaming:</span>
                <div class="admin-badge ${model.supports_streaming ? 'admin-badge-success' : 'admin-badge-warning'}">
                  ${model.supports_streaming ? 'Yes' : 'No'}
                </div>
              </div>
              
              ${model.cost_per_token ? `
                <div>
                  <span class="text-gray-500">Cost/Token:</span>
                  <div class="font-medium">$${model.cost_per_token}</div>
                </div>
              ` : ''}
            </div>
            
            <div class="mt-3 text-xs text-gray-400">
              Updated ${new Date(model.updated_at).toLocaleDateString()}
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <label class="flex items-center">
              <input 
                type="checkbox" 
                ${model.enabled ? 'checked' : ''} 
                data-action="toggle" 
                data-model-id="${model.id}"
                class="mr-2"
              >
              <span class="text-sm">Enabled</span>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  private renderError(message: string): void {
    const content = this.container.querySelector('#modelsContent') as HTMLElement;
    if (!content) return;

    content.innerHTML = `
      <div class="text-center py-12">
        <div class="text-red-500 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Models</h3>
        <p class="text-gray-500 mb-4">${message}</p>
        <button class="btn-primary" onclick="window.location.reload()">
          Retry
        </button>
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Sync models button
    const syncButton = this.container.querySelector('#syncModelsButton');
    syncButton?.addEventListener('click', () => {
      this.syncModels();
    });

    // Refresh button
    const refreshButton = this.container.querySelector('#refreshButton');
    refreshButton?.addEventListener('click', () => {
      this.loadModels();
    });

    // Filter controls
    const showEnabledOnly = this.container.querySelector('#showEnabledOnly');
    showEnabledOnly?.addEventListener('change', () => {
      this.renderModels();
    });

    const providerFilter = this.container.querySelector('#providerFilter');
    providerFilter?.addEventListener('change', () => {
      this.renderModels();
    });

    // Model actions
    this.container.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const action = target.getAttribute('data-action');
      const modelId = target.getAttribute('data-model-id');

      if (action === 'toggle' && modelId) {
        await this.toggleModel(modelId, target.checked);
      }
    });

    // Sync from empty state
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.id === 'syncModelsFromEmpty') {
        this.syncModels();
      }
    });
  }

  private async syncModels(): Promise<void> {
    try {
      const button = this.container.querySelector('#syncModelsButton') as HTMLButtonElement;
      
      if (button) {
        button.disabled = true;
        button.textContent = 'Syncing...';
      }

      const result = await adminApi.syncModels();
      alert(`Sync completed: ${result.message}`);
      
      await this.loadModels(); // Refresh the list
    } catch (error: any) {
      alert(`Sync failed: ${error.message}`);
    } finally {
      const button = this.container.querySelector('#syncModelsButton') as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.textContent = 'Sync Models';
      }
    }
  }

  private async toggleModel(modelId: string, enabled: boolean): Promise<void> {
    try {
      await adminApi.updateModel(modelId, { enabled });
      
      // Update local state
      const model = this.models.find(m => m.id === modelId);
      if (model) {
        model.enabled = enabled;
      }
    } catch (error: any) {
      // Revert checkbox state
      const checkbox = this.container.querySelector(`[data-model-id="${modelId}"]`) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = !enabled;
      }
      
      alert(`Failed to update model: ${error.message}`);
    }
  }
}