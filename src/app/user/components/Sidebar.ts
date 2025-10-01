/**
 * Sidebar component - navigation and conversation history
 */

import { User } from '@/services/api.user';

export class Sidebar {
  private container: HTMLElement;
  private user: User;

  constructor(container: HTMLElement, user: User) {
    this.container = container;
    this.user = user;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200">
          <button id="newChatButton" class="btn-primary w-full">
            New Chat
          </button>
        </div>
        
        <!-- Conversation History -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Recent Conversations</h3>
            <div id="conversationList" class="space-y-2">
              <!-- Conversation items will be loaded here -->
              ${this.renderPlaceholderConversations()}
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
  }

  private renderPlaceholderConversations(): string {
    return `
      <div class="text-center py-8">
        <div class="text-gray-400 mb-2">
          <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <p class="text-sm text-gray-500">No conversations yet</p>
        <p class="text-xs text-gray-400 mt-1">Start a new chat to begin</p>
      </div>
    `;
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
  }

  private startNewChat(): void {
    // Emit event or call parent method to start new chat
    const event = new CustomEvent('newChat');
    this.container.dispatchEvent(event);
  }

  private openSettings(): void {
    // Placeholder for settings functionality
    alert('Settings coming soon!');
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
    }
  }

  private renderConversation(conversation: {
    id: string;
    title: string;
    timestamp: string;
  }): string {
    const date = new Date(conversation.timestamp);
    const timeStr = date.toLocaleString();
    
    return `
      <div class="conversation-item p-2 rounded-md hover:bg-gray-100 cursor-pointer" data-id="${conversation.id}">
        <div class="text-sm font-medium text-gray-900 truncate">${conversation.title}</div>
        <div class="text-xs text-gray-500">${timeStr}</div>
      </div>
    `;
  }
}