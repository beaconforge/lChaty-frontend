/**
 * Model selector component - allows users to select AI models
 */

import { Model, userApi } from '@/services/api.user';

export class ModelSelector {
  private container: HTMLElement;
  private models: Model[] = [];
  private selectedModel?: Model;
  
  public onModelChange?: (model: Model) => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    // Show loading state
    this.container.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-600">Model:</span>
        <div class="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
      </div>
    `;

    try {
      // Load available models
      this.models = await userApi.getModels();
      
      // Select first available model by default
      if (this.models.length > 0 && !this.selectedModel) {
        const defaultModel = this.models.find(m => m.available) || this.models[0];
        this.setSelectedModel(defaultModel);
      }

      this.renderSelector();
    } catch (error) {
      console.error('Failed to load models:', error);
      this.renderError();
    }
  }

  private renderSelector(): void {
    const availableModels = this.models.filter(m => m.available);
    
    if (availableModels.length === 0) {
      this.renderNoModels();
      return;
    }

    this.container.innerHTML = `
      <div class="flex items-center space-x-2">
        <label for="modelSelect" class="text-sm text-gray-600">Model:</label>
        <select 
          id="modelSelect" 
          class="text-sm border border-gray-300 rounded px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          ${availableModels.map(model => `
            <option value="${model.id}" ${model.id === this.selectedModel?.id ? 'selected' : ''}>
              ${model.name} (${model.provider})
            </option>
          `).join('')}
        </select>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderError(): void {
    this.container.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-sm text-red-600">Failed to load models</span>
        <button id="retryButton" class="text-sm text-primary-600 hover:text-primary-500">
          Retry
        </button>
      </div>
    `;

    const retryButton = this.container.querySelector('#retryButton');
    retryButton?.addEventListener('click', () => {
      this.render();
    });
  }

  private renderNoModels(): void {
    this.container.innerHTML = `
      <div class="text-sm text-yellow-600">
        No models available
      </div>
    `;
  }

  private attachEventListeners(): void {
    const select = this.container.querySelector('#modelSelect') as HTMLSelectElement;
    
    select?.addEventListener('change', () => {
      const selectedId = select.value;
      const model = this.models.find(m => m.id === selectedId);
      
      if (model) {
        this.setSelectedModel(model);
      }
    });
  }

  private setSelectedModel(model: Model): void {
    this.selectedModel = model;
    
    if (this.onModelChange) {
      this.onModelChange(model);
    }
  }

  // Public methods
  getSelectedModel(): Model | undefined {
    return this.selectedModel;
  }

  refresh(): void {
    this.render();
  }
}