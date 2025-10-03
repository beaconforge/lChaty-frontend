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
      <div class="mx-auto w-full max-w-3xl px-6 py-8">
        <form
          id="messageForm"
          class="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl backdrop-blur"
        >
          <div class="relative">
            <textarea
              id="messageTextarea"
              rows="1"
              data-testid="message-input"
              class="h-12 w-full resize-none bg-transparent text-base text-slate-100 placeholder-slate-500 focus:outline-none"
              placeholder="Type your message here..."
              style="min-height: 44px; max-height: 200px;"
            ></textarea>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>Press <kbd class="rounded bg-white/10 px-1 text-[10px] uppercase">Enter</kbd> to send • <kbd class="rounded bg-white/10 px-1 text-[10px] uppercase">Shift</kbd> + Enter for a new line</span>
            <button
              type="submit"
              id="sendButton"
              class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-900/40"
              disabled
            >
              <span id="sendButtonText">Send</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </form>
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