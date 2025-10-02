import { adminApi } from '../../../services/api.admin';
import { toastService } from '../../../components/Toast';
import { modalService } from '../../../components/Modal';

export class SettingsPage {
  container: HTMLElement;
  content: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.content = document.createElement('div');
    this.content.className = 'admin-page settings-page p-4';
    this.container.appendChild(this.content);
    this.load();
  }

  async load() {
    this.renderLoading();
    try {
      const settings = await adminApi.getSettings();
      this.renderSettings(settings || {});
    } catch (err: any) {
      this.renderError(err);
    }
  }

  renderLoading() {
    this.content.innerHTML = `<div class="text-gray-500">Loading settings...</div>`;
  }

  renderError(err: any) {
    const message = err?.message || 'Failed to load settings';
    this.content.innerHTML = `<div class="text-red-600">${message}</div>`;
  }

  renderSettings(settings: Record<string, any>) {
    const wrapper = document.createElement('div');
    const title = document.createElement('h2');
    title.className = 'text-lg font-medium mb-4';
    title.textContent = 'System Settings';

    const textarea = document.createElement('textarea');
    textarea.className = 'w-full h-64 p-2 border rounded bg-white text-sm font-mono';
    textarea.value = JSON.stringify(settings, null, 2);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary mt-3';
    saveBtn.textContent = 'Save Settings';
    saveBtn.addEventListener('click', async () => {
      try {
        JSON.parse(textarea.value);
      } catch (err) {
        toastService.error('Invalid JSON: please fix the editor before saving');
        return;
      }
      const confirmed = await modalService.confirm({
        title: 'Save settings',
        body: 'Are you sure you want to overwrite system settings? This will affect runtime behavior.',
        confirmText: 'Save'
      });
      if (!confirmed) return;
      saveBtn.disabled = true;
      try {
        const newSettings = JSON.parse(textarea.value);
        const updated = await adminApi.updateSettings(newSettings);
        textarea.value = JSON.stringify(updated, null, 2);
        toastService.success('Settings saved');
      } catch (err: any) {
        toastService.error(err?.message || 'Failed to save settings');
      } finally {
        saveBtn.disabled = false;
      }
    });

    wrapper.appendChild(title);
    wrapper.appendChild(textarea);
    wrapper.appendChild(saveBtn);
    this.content.innerHTML = '';
    this.content.appendChild(wrapper);
  }

  // Public render method to match AdminPortal expectations
  render() {
    // constructor already invoked load which populated the content
  }
}
