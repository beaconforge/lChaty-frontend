/**
 * Message input component - handles user message input
 */

export class MessageInput {
  private container: HTMLElement;
  private isLoading = false;
  
  public onSendMessage?: (content: string) => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="p-6">
        <form id="messageForm" class="flex space-x-4">
          <div class="flex-1">
            <textarea
              id="messageTextarea"
              rows="1"
              class="input resize-none"
              placeholder="Type your message here..."
              style="min-height: 44px; max-height: 200px;"
            ></textarea>
          </div>
          
          <button
            type="submit"
            id="sendButton"
            class="btn-primary px-6 py-2 flex items-center space-x-2"
            disabled
          >
            <span id="sendButtonText">Send</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </form>
        
        <div class="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const form = this.container.querySelector('#messageForm') as HTMLFormElement;
    const textarea = this.container.querySelector('#messageTextarea') as HTMLTextAreaElement;

    // Auto-resize textarea
    textarea.addEventListener('input', () => {
      this.autoResizeTextarea(textarea);
      this.updateSendButton();
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSend();
    });

    // Handle keyboard shortcuts
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // Initial state
    this.updateSendButton();
  }

  private autoResizeTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  private updateSendButton(): void {
    const textarea = this.container.querySelector('#messageTextarea') as HTMLTextAreaElement;
    const button = this.container.querySelector('#sendButton') as HTMLButtonElement;
    
    if (textarea && button) {
      const hasContent = textarea.value.trim().length > 0;
      button.disabled = this.isLoading || !hasContent;
    }
  }

  private handleSend(): void {
    if (this.isLoading) return;

    const textarea = this.container.querySelector('#messageTextarea') as HTMLTextAreaElement;
    const content = textarea.value.trim();

    if (!content || !this.onSendMessage) return;

    this.onSendMessage(content);
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading;
    
    const button = this.container.querySelector('#sendButton') as HTMLButtonElement;
    const buttonText = this.container.querySelector('#sendButtonText') as HTMLElement;
    
    if (button && buttonText) {
      if (loading) {
        button.disabled = true;
        buttonText.textContent = 'Sending...';
      } else {
        buttonText.textContent = 'Send';
        this.updateSendButton();
      }
    }
  }

  clearInput(): void {
    const textarea = this.container.querySelector('#messageTextarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = '';
      this.autoResizeTextarea(textarea);
      this.updateSendButton();
    }
  }

  focusInput(): void {
    const textarea = this.container.querySelector('#messageTextarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  }
}