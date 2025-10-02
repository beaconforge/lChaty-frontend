/**
 * Minimal modal service with a confirm() helper returning Promise<boolean>
 */

type ModalOptions = {
  title?: string;
  body?: string | HTMLElement;
  confirmText?: string;
  cancelText?: string;
};

class ModalService {
  async confirm(opts: ModalOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.style.position = 'fixed';
      backdrop.style.left = '0';
      backdrop.style.top = '0';
      backdrop.style.right = '0';
      backdrop.style.bottom = '0';
      backdrop.style.background = 'rgba(0,0,0,0.4)';
      backdrop.style.zIndex = '10000';

      const dialog = document.createElement('div');
      dialog.style.position = 'absolute';
      dialog.style.left = '50%';
      dialog.style.top = '50%';
      dialog.style.transform = 'translate(-50%, -50%)';
      dialog.style.background = '#fff';
      dialog.style.borderRadius = '8px';
      dialog.style.padding = '18px';
      dialog.style.minWidth = '320px';
      dialog.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';

      const title = document.createElement('h3');
      title.style.margin = '0 0 8px 0';
      title.style.fontSize = '16px';
      title.textContent = opts.title || 'Confirm';

      const body = document.createElement('div');
      body.style.marginBottom = '12px';
      if (typeof opts.body === 'string' || opts.body === undefined) {
        body.textContent = opts.body || '';
      } else {
        body.appendChild(opts.body);
      }

      const footer = document.createElement('div');
      footer.style.textAlign = 'right';

      const cancel = document.createElement('button');
      cancel.textContent = opts.cancelText || 'Cancel';
      cancel.style.marginRight = '8px';

      const confirm = document.createElement('button');
      confirm.textContent = opts.confirmText || 'Confirm';
      confirm.style.background = '#2563eb';
      confirm.style.color = '#fff';
      confirm.style.border = 'none';
      confirm.style.padding = '8px 12px';
      confirm.style.borderRadius = '6px';

      footer.appendChild(cancel);
      footer.appendChild(confirm);

      dialog.appendChild(title);
      dialog.appendChild(body);
      dialog.appendChild(footer);
      backdrop.appendChild(dialog);
      document.body.appendChild(backdrop);

      cancel.addEventListener('click', () => {
        backdrop.remove();
        resolve(false);
      });

      confirm.addEventListener('click', () => {
        backdrop.remove();
        resolve(true);
      });
    });
  }
}

export const modalService = new ModalService();
export default modalService;
