/**
 * Chat page component - main chat interface
 */

import { User, Model } from '@/services/api.user';
import { ChatComponent } from '../components/ChatComponent';
import { Sidebar } from '../components/Sidebar';
import { ModelSelector } from '../components/ModelSelector';

export class ChatPage {
  private container: HTMLElement;
  private user: User;
  private chatComponent?: ChatComponent;
  private sidebar?: Sidebar;
  private modelSelector?: ModelSelector;
  private currentModel?: Model;
  
  public onLogout?: () => Promise<void>;

  constructor(container: HTMLElement, user: User) {
    this.container = container;
    this.user = user;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="flex h-screen bg-white">
        <!-- Sidebar -->
        <div id="sidebar" class="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <!-- Sidebar content will be rendered here -->
        </div>
        
        <!-- Main chat area -->
        <div class="flex-1 flex flex-col">
          <!-- Header -->
          <header class="bg-white border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <h1 class="text-xl font-semibold text-gray-900">lChaty</h1>
                <div id="modelSelector">
                  <!-- Model selector will be rendered here -->
                </div>
              </div>
              
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">
                  Welcome, <span class="font-medium">${this.user.username}</span>
                </span>
                <button 
                  id="logoutButton" 
                  class="btn-ghost text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          
          <!-- Chat container -->
          <div id="chatContainer" class="flex-1 flex flex-col">
            <!-- Chat component will be rendered here -->
          </div>
        </div>
      </div>
    `;

    this.renderComponents();
    this.attachEventListeners();
  }

  private renderComponents(): void {
    // Render sidebar
    const sidebarContainer = this.container.querySelector('#sidebar') as HTMLElement;
    if (sidebarContainer) {
      this.sidebar = new Sidebar(sidebarContainer, this.user);
      this.sidebar.render();
    }

    // Render model selector
    const modelSelectorContainer = this.container.querySelector('#modelSelector') as HTMLElement;
    if (modelSelectorContainer) {
      this.modelSelector = new ModelSelector(modelSelectorContainer);
      this.modelSelector.onModelChange = (model) => {
        this.currentModel = model;
        if (this.chatComponent) {
          this.chatComponent.setModel(model);
        }
      };
      this.modelSelector.render();
    }

    // Render chat component
    const chatContainer = this.container.querySelector('#chatContainer') as HTMLElement;
    if (chatContainer) {
      this.chatComponent = new ChatComponent(chatContainer, this.user);
      if (this.currentModel) {
        this.chatComponent.setModel(this.currentModel);
      }
      this.chatComponent.render();
    }
  }

  private attachEventListeners(): void {
    const logoutButton = this.container.querySelector('#logoutButton');
    logoutButton?.addEventListener('click', async () => {
      if (this.onLogout) {
        await this.onLogout();
      }
    });
  }
}