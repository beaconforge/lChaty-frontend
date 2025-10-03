import { userApi, User, FamilyOverview, FamilyRequest } from '@/services/api.user';
import { errorService } from '@/services/error';

const DEFAULT_SCHEDULE: Record<string, string> = {
  Mon: 'Study 5 – 7 PM',
  Tue: 'Free play after homework',
  Wed: 'Homework 4 – 6 PM',
  Thu: 'STEM club 5 – 6 PM',
  Fri: 'Family movie night',
  Sat: 'Open schedule',
  Sun: 'Reading hour 6 – 7 PM',
};

type NoticeState = {
  message: string;
  type: 'success' | 'error' | 'info';
};

export class FamilyHubPanel {
  private overlay?: HTMLElement;
  private content?: HTMLElement;
  private isLoading = false;
  private error: string | null = null;
  private family: FamilyOverview | null = null;
  private requests: FamilyRequest[] = [];
  private notice: NoticeState | null = null;
  private noticeTimeout?: number;
  private readonly handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.close();
    }
  };

  constructor(private readonly user: User) {}

  open(): void {
    if (this.overlay) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.notice = null;

    this.overlay = document.createElement('div');
    this.overlay.className =
      'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur';
    this.overlay.innerHTML = `
      <div class="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div>
            <h2 class="text-xl font-semibold text-white">Family hub</h2>
            <p class="text-sm text-slate-400">
              Manage household safety controls, kid access, and activity insights in one place.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button data-action="refresh" class="rounded-full border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-white hover:text-white">
              Refresh
            </button>
            <button data-action="close" class="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-white hover:text-white" aria-label="Close family hub panel">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="max-h-[70vh] overflow-y-auto px-6 py-6" data-slot="content"></div>
      </div>
    `;

    this.content = this.overlay.querySelector('[data-slot="content"]') as HTMLElement | null;

    this.overlay.addEventListener('click', event => {
      if (event.target === this.overlay) {
        this.close();
      }
    });
    this.overlay.querySelector('[data-action="close"]')?.addEventListener('click', () => this.close());
    this.overlay.querySelector('[data-action="refresh"]')?.addEventListener('click', () => this.reload());

    document.body.appendChild(this.overlay);
    document.addEventListener('keydown', this.handleKeydown);

    this.render();
    void this.load();
  }

  close(): void {
    if (!this.overlay) {
      return;
    }

    if (this.noticeTimeout) {
      window.clearTimeout(this.noticeTimeout);
      this.noticeTimeout = undefined;
    }

    document.removeEventListener('keydown', this.handleKeydown);
    this.overlay.remove();
    this.overlay = undefined;
    this.content = undefined;
    this.family = null;
    this.requests = [];
    this.error = null;
    this.isLoading = false;
  }

  private reload(): void {
    this.isLoading = true;
    this.render();
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const [overview, requests] = await Promise.all([
        userApi.getFamilyOverview(),
        userApi
          .getFamilyRequests()
          .then(items => items)
          .catch(() => undefined),
      ]);

      this.family = overview;
      this.requests = requests ?? overview?.requests ?? [];
      this.error = null;
    } catch (error) {
      const info = errorService.handleApiError(error, 'family-hub');
      this.error = info.message;
      this.family = null;
      this.requests = [];
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  private render(): void {
    if (!this.content) {
      return;
    }

    if (this.isLoading) {
      this.content.innerHTML = this.renderLoading();
      return;
    }

    if (this.error) {
      this.content.innerHTML = this.renderError();
      this.bindErrorActions();
      return;
    }

    if (!this.family) {
      this.content.innerHTML = this.renderEmpty();
      return;
    }

    this.content.innerHTML = `
      <div class="space-y-6">
        ${this.renderNotice()}
        ${this.renderHousehold(this.family)}
        ${this.renderChildren(this.family)}
        ${this.renderRequests()}
        ${this.renderSchedule(this.family)}
      </div>
    `;

    this.bindChildActions();
    this.bindRequestActions();
  }

  private renderLoading(): string {
    return `
      <div class="space-y-4">
        <div class="animate-pulse space-y-3">
          <div class="h-6 w-48 rounded bg-white/10"></div>
          <div class="h-3 w-64 rounded bg-white/10"></div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          ${Array.from({ length: 4 })
            .map(
              () => `
                <div class="h-32 rounded-2xl border border-white/10 bg-white/5"></div>
              `,
            )
            .join('')}
        </div>
      </div>
    `;
  }

  private renderError(): string {
    return `
      <div class="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-100">
        <h3 class="text-lg font-semibold">Unable to load family hub</h3>
        <p class="mt-2 text-sm">${this.escape(this.error ?? 'Something went wrong while loading your household.')}</p>
        <button data-action="retry" class="mt-4 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white">
          Try again
        </button>
      </div>
    `;
  }

  private renderEmpty(): string {
    return `
      <div class="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-200">
        <h3 class="text-lg font-semibold text-white">Family hub not enabled</h3>
        <p class="mt-2 text-sm text-slate-400">
          Connect your household account to unlock kid controls, usage limits, and shared access tools.
        </p>
      </div>
    `;
  }

  private renderNotice(): string {
    if (!this.notice) {
      return '';
    }

    const tone =
      this.notice.type === 'success'
        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
        : this.notice.type === 'error'
          ? 'border-red-500/40 bg-red-500/10 text-red-100'
          : 'border-white/20 bg-white/10 text-slate-100';

    return `
      <div class="rounded-2xl border ${tone} p-4 text-sm font-medium">
        ${this.escape(this.notice.message)}
      </div>
    `;
  }

  private renderHousehold(family: FamilyOverview): string {
    return `
      <section class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <header class="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-white">Household</h3>
            <p class="text-sm text-slate-400">${this.escape(family.householdId)}</p>
          </div>
          <div class="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-wide text-slate-300">
            Signed in as ${this.escape(this.user.username)}
          </div>
        </header>
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Parents</h4>
            <ul class="mt-3 space-y-2">
              ${family.parents
                .map(
                  parent => `
                    <li class="flex items-center gap-3 rounded-xl border border-transparent bg-white/5 px-3 py-2">
                      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                        ${this.initials(parent.name)}
                      </div>
                      <span class="text-sm text-slate-100">${this.escape(parent.name)}</span>
                    </li>
                  `,
                )
                .join('') || '<li class="text-sm text-slate-400">No parents linked yet.</li>'}
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Children</h4>
            <ul class="mt-3 space-y-2">
              ${family.children
                .map(
                  child => `
                    <li class="flex items-center gap-3 rounded-xl border border-transparent bg-white/5 px-3 py-2">
                      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500/40 text-sm font-semibold text-white">
                        ${this.initials(child.name)}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-white">${this.escape(child.name)}</p>
                        <p class="text-xs text-slate-400">Safety: ${this.escape(child.safetyLevel ?? 'Unconfigured')}</p>
                      </div>
                    </li>
                  `,
                )
                .join('') || '<li class="text-sm text-slate-400">No children linked yet.</li>'}
            </ul>
          </div>
        </div>
      </section>
    `;
  }

  private renderChildren(family: FamilyOverview): string {
    if (!family.children.length) {
      return '';
    }

    return `
      <section class="space-y-4">
        <header>
          <h3 class="text-lg font-semibold text-white">Child controls</h3>
          <p class="text-sm text-slate-400">Adjust safety levels and daily limits for each child profile.</p>
        </header>
        <div class="grid gap-4 md:grid-cols-2">
          ${family.children
            .map(child => this.renderChildCard(child))
            .join('')}
        </div>
      </section>
    `;
  }

  private renderChildCard(child: FamilyOverview['children'][number]): string {
    const safety = this.escape(child.safetyLevel ?? 'PG');
    const allowance = child.allowanceMinutes ?? 0;
    const limit = child.limitMinutes ?? (safety === 'G' ? 45 : 90);

    return `
      <article class="rounded-2xl border border-white/10 bg-white/5 p-5" data-child-card="${this.escape(child.id)}">
        <header class="flex items-start justify-between gap-3">
          <div>
            <h4 class="text-base font-semibold text-white">${this.escape(child.name)}</h4>
            <p class="text-xs text-slate-400">Child ID: ${this.escape(child.id)}</p>
          </div>
          <label class="flex items-center gap-2 text-sm text-slate-200">
            <span class="text-xs uppercase tracking-wide text-slate-400">Safety</span>
            <select
              class="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs text-white focus:border-white focus:outline-none"
              data-child-safety="${this.escape(child.id)}"
            >
              ${['G', 'PG', 'PG-13', 'Teen', 'Custom']
                .map(level => `
                  <option value="${level}" ${level === safety ? 'selected' : ''}>${level}</option>
                `)
                .join('')}
            </select>
          </label>
        </header>
        <dl class="mt-4 space-y-2 text-sm text-slate-300">
          <div class="flex items-center justify-between">
            <dt class="text-xs uppercase tracking-wide text-slate-400">Allowance used</dt>
            <dd>${allowance} min</dd>
          </div>
          <div class="flex items-center justify-between">
            <dt class="text-xs uppercase tracking-wide text-slate-400">Daily limit</dt>
            <dd>${limit} min</dd>
          </div>
        </dl>
        <p class="mt-3 text-xs text-slate-400" data-child-status="${this.escape(child.id)}"></p>
      </article>
    `;
  }

  private renderRequests(): string {
    if (!this.requests.length) {
      return `
        <section class="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 class="text-lg font-semibold text-white">Requests</h3>
          <p class="mt-2 text-sm text-slate-400">No pending requests right now.</p>
        </section>
      `;
    }

    return `
      <section class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 class="text-lg font-semibold text-white">Pending requests</h3>
        <ul class="mt-4 space-y-4">
          ${this.requests
            .map(request => this.renderRequestItem(request))
            .join('')}
        </ul>
      </section>
    `;
  }

  private renderRequestItem(request: FamilyRequest): string {
    const createdAt = new Date(request.createdAt);
    const timestamp = isNaN(createdAt.getTime()) ? request.createdAt : createdAt.toLocaleString();
    const childName = this.family?.children.find(child => child.id === request.childId)?.name ?? 'Child';

    return `
      <li class="rounded-2xl border border-white/10 bg-slate-950/40 p-4" data-request="${this.escape(request.id)}">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-white">${this.escape(request.type)}</p>
            <p class="text-xs text-slate-400">For ${this.escape(childName)} • ${this.escape(timestamp)}</p>
          </div>
          <div class="flex items-center gap-2">
            <button data-request-action="approve" class="rounded-full border border-emerald-500/50 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-400 hover:text-emerald-50">
              Approve
            </button>
            <button data-request-action="deny" class="rounded-full border border-red-500/50 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:border-red-400 hover:text-red-50">
              Deny
            </button>
          </div>
        </div>
        ${request.payload ? `<pre class="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-300">${this.escape(JSON.stringify(request.payload, null, 2))}</pre>` : ''}
        <p class="mt-3 text-xs text-slate-400" data-request-status="${this.escape(request.id)}"></p>
      </li>
    `;
  }

  private renderSchedule(family: FamilyOverview): string {
    const scheduleEntries = Object.entries(family.schedule ?? DEFAULT_SCHEDULE);

    return `
      <section class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 class="text-lg font-semibold text-white">Weekly schedule</h3>
        <p class="mt-2 text-sm text-slate-400">Configure study time, downtime, and household quiet hours.</p>
        <div class="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          ${scheduleEntries
            .map(
              ([day, value]) => `
                <div class="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p class="text-xs uppercase tracking-wide text-slate-400">${this.escape(day)}</p>
                  <p class="mt-2 text-sm text-slate-100">${this.escape(String(value))}</p>
                </div>
              `,
            )
            .join('')}
        </div>
      </section>
    `;
  }

  private bindErrorActions(): void {
    if (!this.content) {
      return;
    }
    this.content.querySelector('[data-action="retry"]')?.addEventListener('click', () => this.reload());
  }

  private bindChildActions(): void {
    this.overlay?.querySelectorAll<HTMLSelectElement>('[data-child-safety]').forEach(select => {
      select.addEventListener('change', () => {
        const childId = select.dataset.childSafety;
        const value = select.value;
        if (!childId) return;
        this.handleSafetyChange(childId, value, select);
      });
    });
  }

  private bindRequestActions(): void {
    this.overlay?.querySelectorAll<HTMLButtonElement>('[data-request-action]').forEach(button => {
      button.addEventListener('click', () => {
        const listItem = button.closest('[data-request]');
        const requestId = listItem?.getAttribute('data-request');
        const action = button.getAttribute('data-request-action') as 'approve' | 'deny' | null;
        if (!requestId || !action) {
          return;
        }
        this.handleRequestAction(requestId, action, button);
      });
    });
  }

  private async handleSafetyChange(childId: string, value: string, select: HTMLSelectElement): Promise<void> {
    const status = this.overlay?.querySelector<HTMLElement>(`[data-child-status="${CSS.escape(childId)}"]`);
    if (status) {
      status.textContent = 'Saving safety update…';
      status.className = 'mt-3 text-xs text-slate-400';
    }

    select.disabled = true;
    try {
      const updated = await userApi.updateFamilyChild(childId, { safetyLevel: value });
      if (this.family) {
        const child = this.family.children.find(item => item.id === childId);
        if (child) {
          child.safetyLevel = updated.safetyLevel ?? value;
        }
      }
      this.showNotice(`Updated safety level to ${value}.`, 'success');
      if (status) {
        status.textContent = `Safety level set to ${value}.`;
        status.className = 'mt-3 text-xs text-emerald-300';
      }
    } catch (error) {
      const info = errorService.handleApiError(error, 'family-hub-update-child');
      this.showNotice(info.message, 'error');
      if (status) {
        status.textContent = info.message;
        status.className = 'mt-3 text-xs text-red-300';
      }
    } finally {
      select.disabled = false;
    }
  }

  private async handleRequestAction(requestId: string, action: 'approve' | 'deny', button: HTMLButtonElement): Promise<void> {
    const status = this.overlay?.querySelector<HTMLElement>(`[data-request-status="${CSS.escape(requestId)}"]`);
    if (status) {
      status.textContent = `${action === 'approve' ? 'Approving' : 'Denying'} request…`;
      status.className = 'mt-3 text-xs text-slate-400';
    }

    button.disabled = true;
    try {
      await userApi.updateFamilyRequest(requestId, action);
      this.requests = this.requests.filter(request => request.id !== requestId);
      this.showNotice(`Request ${action === 'approve' ? 'approved' : 'denied'}.`, 'success');
      this.render();
    } catch (error) {
      const info = errorService.handleApiError(error, 'family-hub-update-request');
      this.showNotice(info.message, 'error');
      if (status) {
        status.textContent = info.message;
        status.className = 'mt-3 text-xs text-red-300';
      }
      button.disabled = false;
    }
  }

  private showNotice(message: string, type: NoticeState['type']): void {
    this.notice = { message, type };
    if (this.noticeTimeout) {
      window.clearTimeout(this.noticeTimeout);
    }
    this.noticeTimeout = window.setTimeout(() => {
      this.notice = null;
      this.noticeTimeout = undefined;
      if (this.overlay) {
        this.render();
      }
    }, 4000);
  }

  private escape(value: string | number | undefined | null): string {
    if (value === undefined || value === null) {
      return '';
    }
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private initials(name: string | undefined): string {
    if (!name) {
      return 'F';
    }
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .padEnd(2, '•');
  }
}
