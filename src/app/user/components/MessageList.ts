/**
 * Message list component - displays chat messages
 */

import { ChatMessage } from '@/services/api.user';

export class MessageList {
  private container: HTMLElement;
  private messages: ChatMessage[] = [];
  private isLoading = false;
  private loadingMessage = 'Loading…';

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(): void {
    this.container.innerHTML = `
      <div id="messagesScroll" class="h-full overflow-y-auto px-6 py-8">
        <div id="messagesContainer" class="space-y-6" data-testid="messages-container">
          ${this.messages.length === 0 ? this.renderEmptyState() : ''}
        </div>
      </div>
    `;

    this.updateMessages();
  }

  private renderEmptyState(): string {
    return `
      <div class="flex min-h-[280px] items-center justify-center text-slate-200">
        <div class="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-xl backdrop-blur">
          <div class="mb-4 text-5xl">💬</div>
          <h3 class="mb-2 text-lg font-semibold text-white">Start a conversation</h3>
          <p class="text-sm text-slate-300">Type a message below to begin your next AI session.</p>
        </div>
      </div>
    `;
  }

  setMessages(messages: ChatMessage[]): void {
    this.messages = messages;
    this.isLoading = false;
    this.updateMessages();
  }

  showLoading(message: string): void {
    this.isLoading = true;
    this.loadingMessage = message;
    this.updateMessages();
  }

  hideLoading(): void {
    if (!this.isLoading) return;
    this.isLoading = false;
    this.updateMessages();
  }

  private updateMessages(): void {
    const container = this.container.querySelector('#messagesContainer') as HTMLElement;
    if (!container) return;

    if (this.isLoading) {
      container.innerHTML = `
        <div class="flex h-full min-h-[240px] items-center justify-center text-slate-300">
          <div class="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <span class="h-3 w-3 animate-ping rounded-full bg-blue-400"></span>
            <span>${this.loadingMessage}</span>
          </div>
        </div>
      `;
      return;
    }

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
        <div class="flex max-w-2xl items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}">
          <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-semibold uppercase">
            ${isUser ? 'You' : 'AI'}
          </div>
          <div class="flex min-w-[200px] flex-col gap-1 ${isUser ? 'items-end text-right' : 'items-start text-left'}">
            <span class="text-[11px] uppercase tracking-wide text-slate-400">
              ${isUser ? 'You' : message.model ? `AI · ${message.model}` : 'AI'}${
                timestamp ? ` · ${timestamp}` : ''
              }
            </span>
            <div class="rounded-2xl px-4 py-3 text-sm shadow-lg ring-1 ring-white/10 ${
              isUser
                ? 'bg-blue-600 text-white'
                : 'bg-white/90 text-slate-900 backdrop-blur'
            }">
              <div class="whitespace-pre-wrap leading-relaxed">${this.escapeHtml(message.content)}</div>
            </div>
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