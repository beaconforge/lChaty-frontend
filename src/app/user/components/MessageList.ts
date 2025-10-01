/**
 * Message list component - displays chat messages
 */

import { ChatMessage } from '@/services/api.user';

export class MessageList {
  private container: HTMLElement;
  private messages: ChatMessage[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(): void {
    this.container.innerHTML = `
      <div id="messagesScroll" class="h-full overflow-y-auto px-6 py-4">
        <div id="messagesContainer" class="space-y-4">
          ${this.messages.length === 0 ? this.renderEmptyState() : ''}
        </div>
      </div>
    `;

    this.updateMessages();
  }

  private renderEmptyState(): string {
    return `
      <div class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="text-6xl mb-4">💬</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
          <p class="text-gray-500">Type a message below to get started with AI chat</p>
        </div>
      </div>
    `;
  }

  setMessages(messages: ChatMessage[]): void {
    this.messages = messages;
    this.updateMessages();
  }

  private updateMessages(): void {
    const container = this.container.querySelector('#messagesContainer') as HTMLElement;
    if (!container) return;

    if (this.messages.length === 0) {
      container.innerHTML = this.renderEmptyState();
      return;
    }

    container.innerHTML = this.messages.map(message => this.renderMessage(message)).join('');
    
    // Scroll to bottom
    this.scrollToBottom();
  }

  private renderMessage(message: ChatMessage): string {
    const isUser = message.role === 'user';
    const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '';
    
    return `
      <div class="flex ${isUser ? 'justify-end' : 'justify-start'}">
        <div class="max-w-2xl ${isUser ? 'order-2' : 'order-1'}">
          <div class="flex items-center ${isUser ? 'justify-end' : 'justify-start'} mb-1">
            <span class="text-xs text-gray-500">
              ${isUser ? 'You' : (message.model ? `AI (${message.model})` : 'AI')}
              ${timestamp ? ` • ${timestamp}` : ''}
            </span>
          </div>
          
          <div class="rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-900 border border-gray-200'
          }">
            <div class="whitespace-pre-wrap">${this.escapeHtml(message.content)}</div>
          </div>
        </div>
        
        <div class="${isUser ? 'order-1 mr-3' : 'order-2 ml-3'} flex-shrink-0">
          <div class="w-8 h-8 rounded-full ${
            isUser ? 'bg-primary-500' : 'bg-gray-300'
          } flex items-center justify-center text-white text-sm font-medium">
            ${isUser ? 'U' : 'AI'}
          </div>
        </div>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private scrollToBottom(): void {
    const scrollContainer = this.container.querySelector('#messagesScroll') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }
}