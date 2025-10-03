/**
 * Chat component - handles message display and conversation
 */

import { User, ChatMessage, ChatRequest, userApi, Model } from '@/services/api.user';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export class ChatComponent {
  private container: HTMLElement;
  private user: User; // Used for user identification in messages
  private messages: ChatMessage[] = [];
  private currentModel?: Model;
  private messageList?: MessageList;
  private messageInput?: MessageInput;
  private isLoading = false;

  constructor(container: HTMLElement, user: User) {
    this.container = container;
    this.user = user;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="flex h-full flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <!-- Messages container -->
        <div id="messageList" class="flex-1 overflow-hidden">
          <!-- Message list component will be rendered here -->
        </div>

        <!-- Input container -->
        <div id="messageInput" class="border-t border-slate-800/40 bg-slate-900/80 backdrop-blur">
          <!-- Message input component will be rendered here -->
        </div>
      </div>
    `;

    this.renderSubComponents();
  }

  private renderSubComponents(): void {
    // Render message list
    const messageListContainer = this.container.querySelector('#messageList') as HTMLElement;
    if (messageListContainer) {
      this.messageList = new MessageList(messageListContainer);
      this.messageList.render();
      this.updateMessageList();
    }

    // Render message input
    const messageInputContainer = this.container.querySelector('#messageInput') as HTMLElement;
    if (messageInputContainer) {
      this.messageInput = new MessageInput(messageInputContainer);
      this.messageInput.onSendMessage = (content) => {
        this.sendMessage(content);
      };
      this.messageInput.render();
    }
  }

  setModel(model: Model): void {
    this.currentModel = model;
  }

  focusInput(): void {
    this.messageInput?.focusInput();
  }

  showHistoryLoading(message = 'Loading conversation…'): void {
    this.messageList?.showLoading(message);
  }

  private async sendMessage(content: string): Promise<void> {
    if (this.isLoading || !content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Log for debugging (uses this.user)
    console.log(`User ${this.user.username} sent message`);
    
    this.messages.push(userMessage);
    this.updateMessageList();

    // Clear input and show loading
    this.messageInput?.clearInput();
    this.setLoading(true);

    try {
      // Prepare chat request
      const request: ChatRequest = {
        messages: this.messages,
        model: this.currentModel?.id,
        stream: false // For now, use non-streaming
      };

      // Send to API
      const response = await userApi.chat(request);

      // Add assistant response
      if (response.messages && response.messages.length > 0) {
        const lastMessage = response.messages[response.messages.length - 1];
        if (lastMessage.role === 'assistant') {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: lastMessage.content,
            timestamp: new Date().toISOString(),
            model: response.model
          };
          
          this.messages.push(assistantMessage);
          this.updateMessageList();
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
      
      this.messages.push(errorMessage);
      this.updateMessageList();
    } finally {
      this.setLoading(false);
      this.container.dispatchEvent(new CustomEvent('chat:message-sent'));
    }
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.messageInput?.setLoading(loading);
  }

  private updateMessageList(): void {
    if (this.messageList) {
      this.messageList.setMessages(this.messages);
    }
  }

  // Public methods
  clearChat(): void {
    this.messages = [];
    this.messageList?.hideLoading();
    this.updateMessageList();
  }

  loadConversation(messages: ChatMessage[]): void {
    this.messages = [...messages];
    this.messageList?.hideLoading();
    this.updateMessageList();
  }
}