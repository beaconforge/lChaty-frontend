/**
 * Sidebar component - navigation and conversation history
 */

import { userApi, User } from '@/services/api.user';

type ConversationSummary = {
  id: string;
  title: string;
  updated_at: string;
  message_count: number;
};

export class Sidebar {
  private container: HTMLElement;
  private user: User;
  private conversations: ConversationSummary[] = [];
  private isLoading = false;
  private error: string | null = null;
  private selectedConversationId?: string;

  constructor(container: HTMLElement, user: User) {
    this.container = container;
    this.user = user;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="flex h-full flex-col" data-testid="sidebar">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200">
          <button id="newChatButton" class="btn-primary w-full" data-testid="sidebar-new-chat">
            New Chat
          </button>
          <button id="familyHubLink" class="btn-secondary mt-3 w-full" data-testid="sidebar-family-hub">
            Family hub
          </button>
        </div>

        <!-- Conversation History -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Recent Conversations</h3>
            <div id="conversationList" class="space-y-2">
              ${this.renderConversationList()}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200">
          <div class="text-xs text-gray-500 mb-2">
            Signed in as <span class="font-medium">${this.user.username}</span>
          </div>
          ${this.user.is_admin ? `
            <a href="/admin.html" class="text-xs text-primary-600 hover:text-primary-500 block mb-2">
              Admin Portal
            </a>
          ` : ''}
          <button id="settingsButton" class="text-xs text-gray-500 hover:text-gray-700">
            Settings
          </button>
        </div>
      </div>
    `;

    this.attachEventListeners();
    void this.loadConversations();
  }

  private attachEventListeners(): void {
    const newChatButton = this.container.querySelector('#newChatButton');
    newChatButton?.addEventListener('click', () => {
      this.startNewChat();
    });

    const settingsButton = this.container.querySelector('#settingsButton');
    settingsButton?.addEventListener('click', () => {
      this.openSettings();
    });

    const familyHubButton = this.container.querySelector('#familyHubLink');
    familyHubButton?.addEventListener('click', () => {
      this.openFamilyHub();
    });
  }

  private startNewChat(): void {
    this.selectedConversationId = undefined;
    this.updateConversationList();
    const event = new CustomEvent('newChat');
    this.container.dispatchEvent(event);
  }

  private openSettings(): void {
    const event = new CustomEvent('openSettings');
    this.container.dispatchEvent(event);

  }

  private openFamilyHub(): void {
    const event = new CustomEvent('openFamilyHub');
    this.container.dispatchEvent(event);

  }

  // Public methods for future conversation history integration
  addConversation(conversation: {
    id: string;
    title: string;
    timestamp: string;
  }): void {
    const conversationList = this.container.querySelector('#conversationList') as HTMLElement;
    if (conversationList) {
      const conversationElement = this.renderConversation(conversation);
      conversationList.insertAdjacentHTML('afterbegin', conversationElement);
      this.attachConversationHandlers();
    }
  }

  setActiveConversation(conversationId?: string): void {
    this.selectedConversationId = conversationId;
    this.updateConversationList();
  }

  refresh(): void {
    void this.loadConversations();
  }

  private async loadConversations(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      this.updateConversationList();

      const history = await userApi.getChatHistory(20, 0);
      this.conversations = history.conversations.map(conversation => ({
        id: conversation.id,
        title: conversation.title || 'Untitled conversation',
        updated_at: conversation.updated_at,
        message_count: conversation.message_count,
      }));
    } catch (error) {
      console.error('Failed to load conversation history', error);
      this.error = 'Unable to load recent conversations';
    } finally {
      this.isLoading = false;
      this.updateConversationList();
    }
  }

  private renderConversationList(): string {
    if (this.isLoading) {
      return Array.from({ length: 4 })
        .map(
          () =>
            `<div class="h-12 animate-pulse rounded-xl border border-white/5 bg-white/5"></div>`,
        )
        .join('');
    }

    if (this.error) {
      return `
        <div class="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          ${this.error}
        </div>
      `;
    }

    if (!this.conversations.length) {
      return `
        <div class="py-8 text-center text-slate-300">
          <div class="mb-2 text-slate-500">
            <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <p class="text-sm font-medium">No conversations yet</p>
          <p class="mt-1 text-xs text-slate-500">Start a new chat to begin</p>
        </div>
      `;
    }

    return this.conversations
      .map(conversation => this.renderConversation({
        id: conversation.id,
        title: conversation.title,
        timestamp: conversation.updated_at,
      }))
      .join('');
  }

  private updateConversationList(): void {
    const conversationList = this.container.querySelector('#conversationList');
    if (!conversationList) return;

    conversationList.innerHTML = this.renderConversationList();
    this.attachConversationHandlers();
  }

  private attachConversationHandlers(): void {
    const items = this.container.querySelectorAll<HTMLElement>('.conversation-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const conversationId = item.dataset.id;
        if (!conversationId) return;

        this.selectedConversationId = conversationId;
        const event = new CustomEvent('conversationSelected', {
          detail: { conversationId },
        });
        this.container.dispatchEvent(event);
        this.updateConversationList();
      });
    });
  }

  private renderConversation(conversation: {
    id: string;
    title: string;
    timestamp: string;
  }): string {
    const date = new Date(conversation.timestamp);
    const timeStr = date.toLocaleString();

    return `
      <div
        class="conversation-item rounded-2xl border px-3 py-3 text-left transition hover:border-white/30 hover:bg-white/10 ${
          this.selectedConversationId === conversation.id
            ? 'border-white/50 bg-white/10 text-white'
            : 'border-white/5 bg-white/5 text-slate-200'
        }"
        data-id="${conversation.id}"
      >
        <div class="text-sm font-medium truncate">${conversation.title}</div>
        <div class="text-xs text-slate-400">${timeStr}</div>
      </div>
    `;
  }
}