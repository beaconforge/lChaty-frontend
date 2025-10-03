/**
 * Chat page component - main chat interface
 */

import { User, Model, userApi } from '@/services/api.user';
import { ChatComponent } from '../components/ChatComponent';
import { Sidebar } from '../components/Sidebar';
import { ModelSelector } from '../components/ModelSelector';
import { loadingService } from '@/services/loading';
import { errorService } from '@/services/error';
import { ThemeManager } from '@/lib/theme';
import { FamilyHubPanel } from '../components/FamilyHubPanel';

export class ChatPage {
  private container: HTMLElement;
  private user: User;
  private chatComponent?: ChatComponent;
  private sidebar?: Sidebar;
  private modelSelector?: ModelSelector;
  private currentModel?: Model;
  private currentConversationId?: string;
  private familyHubPanel?: FamilyHubPanel;
  
  public onLogout?: () => Promise<void>;

  constructor(container: HTMLElement, user: User) {
    this.container = container;
    this.user = user;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="flex h-screen bg-slate-950 text-slate-100">
        <!-- Sidebar -->
        <div id="sidebar" class="w-80 border-r border-white/10 bg-slate-900/70 backdrop-blur">
          <!-- Sidebar content will be rendered here -->
        </div>

        <!-- Main chat area -->
        <div class="relative flex flex-1 flex-col overflow-hidden">
          <!-- Header -->
          <header class="border-b border-white/10 bg-slate-900/60 px-8 py-5 backdrop-blur">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="space-y-1">
                <h1 class="text-2xl font-semibold tracking-tight text-white">lChaty</h1>
                <p id="conversationTitle" class="text-sm text-slate-400">New conversation</p>
              </div>

              <div class="flex flex-wrap items-center gap-4">
                <div id="modelSelector" class="min-w-[220px]"></div>
                <button
                  id="familyHubButton"
                  class="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                >
                  Family hub
                </button>
                <span class="text-sm text-slate-300">
                  Signed in as <span class="font-semibold">${this.user.username}</span>
                </span>
                <button
                  id="logoutButton"
                  class="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <!-- Chat container -->
          <div id="chatContainer" class="relative flex flex-1 flex-col overflow-hidden">
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
      sidebarContainer.addEventListener('newChat', () => {
        this.handleNewChat();
      });
      sidebarContainer.addEventListener('conversationSelected', event => {
        const detail = (event as CustomEvent<{ conversationId: string }>).detail;
        if (detail?.conversationId) {
          void this.handleConversationSelected(detail.conversationId);
        }
      });
      sidebarContainer.addEventListener('openSettings', () => {
        this.showSettingsPanel();
      });
      sidebarContainer.addEventListener('openFamilyHub', () => {
        this.openFamilyHub();
      });
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
      chatContainer.addEventListener('chat:message-sent', () => {
        this.sidebar?.refresh();
      });
      this.chatComponent.focusInput();
    }
  }

  private attachEventListeners(): void {
    const logoutButton = this.container.querySelector('#logoutButton');
    logoutButton?.addEventListener('click', async () => {
      if (this.onLogout) {
        await this.onLogout();
      }
    });

    const familyHubButton = this.container.querySelector('#familyHubButton');
    familyHubButton?.addEventListener('click', () => {
      this.openFamilyHub();
    });
  }

  private handleNewChat(): void {
    this.currentConversationId = undefined;
    this.updateConversationTitle('New conversation');
    this.chatComponent?.clearChat();
    this.chatComponent?.focusInput();
    this.sidebar?.setActiveConversation(undefined);
  }

  private async handleConversationSelected(conversationId: string): Promise<void> {
    if (!this.chatComponent) return;

    this.currentConversationId = conversationId;
    this.chatComponent.showHistoryLoading('Loading conversation…');
    loadingService.start('conversation-history');
    try {
      const conversation = await userApi.getConversationMessages(conversationId);
      this.updateConversationTitle(conversation.title || 'Conversation');
      this.chatComponent.loadConversation(conversation.messages);
      this.sidebar?.setActiveConversation(conversationId);
      loadingService.success('conversation-history');
    } catch (error) {
      const info = errorService.handleApiError(error, 'conversation-history');
      loadingService.error('conversation-history', info.message);
      this.chatComponent.clearChat();
      this.updateConversationTitle('New conversation');
    }
  }

  private updateConversationTitle(title: string): void {
    const titleElement = this.container.querySelector('#conversationTitle');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  private showSettingsPanel(): void {
    if (document.getElementById('chat-settings-panel')) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'chat-settings-panel';
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur';
    overlay.innerHTML = `
      <div class="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-white">Chat preferences</h2>
            <p class="text-xs text-slate-400">Fine tune your experience for this browser</p>
          </div>
          <button data-action="close" class="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-white hover:text-white">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mt-6 space-y-4 text-sm text-slate-200">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400">Signed in</p>
            <p class="mt-1 font-medium">${this.user.username}</p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400">Theme</p>
            <div class="mt-2 flex gap-2">
              <button data-theme="light" class="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-900 bg-white transition hover:border-white">Light mode</button>
              <button data-theme="dark" class="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white bg-slate-800 transition hover:border-white">Dark mode</button>
            </div>
          </div>
        </div>
      </div>
    `;

    overlay.addEventListener('click', event => {
      if (event.target === overlay) {
        overlay.remove();
      }
    });

    overlay.querySelector('[data-action="close"]')?.addEventListener('click', () => overlay.remove());

    overlay.querySelectorAll<HTMLButtonElement>('[data-theme]').forEach(button => {
      button.addEventListener('click', () => {
        const theme = button.dataset.theme;
        if (theme === 'light') {
          ThemeManager.setLight();
        } else {
          ThemeManager.setDark();
        }
        overlay.remove();
      });
    });

    document.body.appendChild(overlay);
  }

  private openFamilyHub(): void {
    if (!this.familyHubPanel) {
      this.familyHubPanel = new FamilyHubPanel(this.user);
    }
    this.familyHubPanel.open();
  }
}