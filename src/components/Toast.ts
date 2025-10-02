/**
 * Small toast service for ephemeral notifications.
 * Usage: toastService.success('Saved'); toastService.error('Failed');
 */
export type ToastType = 'info' | 'success' | 'error' | 'warn';

class ToastService {
  private container: HTMLElement | null = null;

  private ensureContainer() {
    if (!this.container) {
      this.container = document.querySelector('#toastContainer') as HTMLElement;
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.setAttribute('aria-live', 'polite');
        this.container.style.position = 'fixed';
        this.container.style.top = '16px';
        this.container.style.right = '16px';
        this.container.style.zIndex = '9999';
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  }

  show(message: string, type: ToastType = 'info', duration = 4000) {
    const container = this.ensureContainer();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.style.marginTop = '8px';
    el.style.minWidth = '220px';
    el.style.padding = '10px 12px';
    el.style.borderRadius = '6px';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    el.style.color = '#fff';
    el.style.fontSize = '13px';
    el.style.opacity = '0';
    el.style.transition = 'opacity 200ms ease, transform 200ms ease';
    el.style.transform = 'translateY(-6px)';

    switch (type) {
      case 'success':
        el.style.background = '#16a34a';
        break;
      case 'error':
        el.style.background = '#dc2626';
        break;
      case 'warn':
        el.style.background = '#f59e0b';
        el.style.color = '#111827';
        break;
      default:
        el.style.background = '#2563eb';
    }

    el.textContent = message;
    container.appendChild(el);

    // animate in
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });

    const timeout = setTimeout(() => this.dismiss(el), duration);

    el.addEventListener('click', () => {
      clearTimeout(timeout);
      this.dismiss(el);
    });
  }

  dismiss(el: HTMLElement) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => {
      el.remove();
    }, 200);
  }

  success(msg: string, d = 3000) { this.show(msg, 'success', d); }
  error(msg: string, d = 5000) { this.show(msg, 'error', d); }
  info(msg: string, d = 3000) { this.show(msg, 'info', d); }
  warn(msg: string, d = 4000) { this.show(msg, 'warn', d); }
}

export const toastService = new ToastService();

export default toastService;
