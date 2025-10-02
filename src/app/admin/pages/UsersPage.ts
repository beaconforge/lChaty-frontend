import { adminApi } from '../../../services/api.admin';
import { modalService } from '../../../components/Modal';
import { toastService } from '../../../components/Toast';
import Table from '../../../components/Table';

export class UsersPage {
  container: HTMLElement;
  content: HTMLElement;
  table?: Table;
  page = 1;
  per_page = 10;
  total = 0;
  // Persisted selection across pages
  selectedAcrossPages: Set<string> = new Set();
  allSelectedAcrossPages = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.content = document.createElement('div');
    this.content.className = 'admin-page users-page p-4';
    this.container.appendChild(this.content);
    this.load();
  }

  async load() {
    this.renderLoading();
    try {
  const res = await adminApi.getUsers({ limit: this.per_page, offset: (this.page - 1) * this.per_page });
      const users = Array.isArray((res as any).users) ? (res as any).users : (res as any);
      // if paginated, assign totals
      if ((res as any).total !== undefined) {
        this.total = (res as any).total;
        this.per_page = (res as any).per_page || this.per_page;
        this.page = (res as any).page || this.page;
      }
      this.renderUsers(users || []);
    } catch (err: any) {
      this.renderError(err);
    }
  }

  renderLoading() {
    this.content.innerHTML = `<div class="text-gray-500">Loading users...</div>`;
  }

  renderError(err: any) {
    const message = err?.message || 'Failed to load users';
    this.content.innerHTML = `<div class="text-red-600">${message}</div>`;
  }

  renderUsers(users: any[]) {
    // build toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'mb-3 flex items-center justify-between';

    const left = document.createElement('div');
    const setAdminBtn = document.createElement('button');
    setAdminBtn.className = 'btn btn-secondary mr-2';
    setAdminBtn.textContent = 'Set Admin for selected';
    setAdminBtn.addEventListener('click', async () => {
      const targetIds = this.selectedAcrossPages.size ? Array.from(this.selectedAcrossPages) : (this.table?.getSelectedIds() || []);
      if (!targetIds.length) { toastService.info('No users selected'); return; }
      const confirmed = await modalService.confirm({ title: 'Set Admin', body: `Set admin for ${targetIds.length} user(s)?`, confirmText: 'Set' });
      if (!confirmed) return;
      setAdminBtn.disabled = true;
      try {
        const concurrency = 5;
        let idx = 0;
        const results: { id: string; ok: boolean; err?: any }[] = [];
        const worker = async () => {
          while (idx < targetIds.length) {
            const i = idx++;
            const id = targetIds[i];
            try {
              await adminApi.updateUser(id, { is_admin: true });
              results.push({ id, ok: true });
            } catch (err: any) {
              results.push({ id, ok: false, err });
            }
          }
        };
        await Promise.all(Array.from({ length: concurrency }, () => worker()));
        const failed = results.filter(r => !r.ok);
        if (failed.length) toastService.error(`${failed.length} updates failed`); else toastService.success('Bulk set completed');
        this.selectedAcrossPages.clear(); this.allSelectedAcrossPages = false; this.load();
      } catch (err: any) {
        toastService.error(err?.message || 'Bulk update failed');
      } finally { setAdminBtn.disabled = false; }
    });

    const revokeAdminBtn = document.createElement('button');
    revokeAdminBtn.className = 'btn btn-secondary mr-2';
    revokeAdminBtn.textContent = 'Revoke Admin for selected';
    revokeAdminBtn.addEventListener('click', async () => {
      const targetIds = this.selectedAcrossPages.size ? Array.from(this.selectedAcrossPages) : (this.table?.getSelectedIds() || []);
      if (!targetIds.length) { toastService.info('No users selected'); return; }
      const confirmed = await modalService.confirm({ title: 'Revoke Admin', body: `Revoke admin for ${targetIds.length} user(s)?`, confirmText: 'Revoke' });
      if (!confirmed) return;
      revokeAdminBtn.disabled = true;
      try {
        const concurrency = 5;
        let idx = 0;
        const results: { id: string; ok: boolean; err?: any }[] = [];
        const worker = async () => {
          while (idx < targetIds.length) {
            const i = idx++;
            const id = targetIds[i];
            try {
              await adminApi.updateUser(id, { is_admin: false });
              results.push({ id, ok: true });
            } catch (err: any) {
              results.push({ id, ok: false, err });
            }
          }
        };
        await Promise.all(Array.from({ length: concurrency }, () => worker()));
        const failed = results.filter(r => !r.ok);
        if (failed.length) toastService.error(`${failed.length} updates failed`); else toastService.success('Bulk revoke completed');
        this.selectedAcrossPages.clear(); this.allSelectedAcrossPages = false; this.load();
      } catch (err: any) {
        toastService.error(err?.message || 'Bulk update failed');
      } finally { revokeAdminBtn.disabled = false; }
    });
    const selectAllPagesBtn = document.createElement('button');
    selectAllPagesBtn.className = 'btn btn-sm';
    selectAllPagesBtn.textContent = 'Select all pages';
    selectAllPagesBtn.addEventListener('click', async () => {
      // Fetch all users IDs (simple loop through pages)
      try {
        toastService.info('Selecting all users...');
        const ids: string[] = [];
        let offset = 0;
        const limit = 200; // reasonable page size to fetch ids
        while (true) {
          const res = await adminApi.getUsers({ limit, offset });
          const items = Array.isArray((res as any).users) ? (res as any).users : (res as any);
          if (!items || !items.length) break;
          items.forEach((u: any) => ids.push(String(u.id)));
          offset += limit;
          if ((res as any).total !== undefined && ids.length >= (res as any).total) break;
        }
        ids.forEach(id => this.selectedAcrossPages.add(id));
        this.allSelectedAcrossPages = true;
        toastService.success(`Selected ${this.selectedAcrossPages.size} users`);
        // re-render table to reflect selection for current page
        this.table?.clearSelection();
        this.table?.renderRows((this.table as any).currentRows || []);
      } catch (err: any) {
        toastService.error(err?.message || 'Failed to select all users');
      }
    });

  left.appendChild(setAdminBtn);
  left.appendChild(revokeAdminBtn);
  left.appendChild(selectAllPagesBtn);

    const right = document.createElement('div');
    const pagination = document.createElement('div');
    pagination.className = 'space-x-2';
    const prev = document.createElement('button');
    prev.className = 'btn btn-sm';
    prev.textContent = 'Previous';
    prev.addEventListener('click', () => {
      if (this.page > 1) {
        this.page -= 1; this.load();
      }
    });
    const next = document.createElement('button');
    next.className = 'btn btn-sm';
    next.textContent = 'Next';
    next.addEventListener('click', () => {
      const maxPage = Math.ceil((this.total || 0) / this.per_page) || 1;
      if (this.page < maxPage) { this.page += 1; this.load(); }
    });
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${this.page} of ${Math.max(1, Math.ceil((this.total || 0) / this.per_page))}`;
    pagination.appendChild(prev);
    pagination.appendChild(pageInfo);
    pagination.appendChild(next);
    right.appendChild(pagination);

    toolbar.appendChild(left);
    toolbar.appendChild(right);

    this.content.innerHTML = '';
    this.content.appendChild(toolbar);

    // render table
    const tableContainer = document.createElement('div');
    this.content.appendChild(tableContainer);

    const columns = [
      { key: 'id', title: 'ID' },
      { key: 'username', title: 'Username' },
      { key: 'email', title: 'Email' },
      { key: 'is_admin', title: 'Admin', render: (row: any) => row.is_admin ? 'Yes' : 'No' },
      { key: 'actions', title: 'Actions', render: (row: any) => {
        const container = document.createElement('div');
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm';
        btn.textContent = row.is_admin ? 'Revoke Admin' : 'Make Admin';
        btn.addEventListener('click', async () => {
          const confirmed = await modalService.confirm({
            title: row.is_admin ? 'Revoke admin' : 'Grant admin',
            body: `Are you sure you want to ${row.is_admin ? 'revoke' : 'grant'} admin for ${row.username}?`,
            confirmText: row.is_admin ? 'Revoke' : 'Grant',
          });
          if (!confirmed) return;
          try {
            await adminApi.updateUser(row.id, { is_admin: !row.is_admin });
            toastService.success(`Updated ${row.username}`);
            this.load();
          } catch (err: any) {
            toastService.error(err?.message || 'Failed to update user');
          }
        });
        container.appendChild(btn);
        return container;
      }}
    ];

    this.table = new Table(tableContainer, columns as any, {
      selectable: true,
      rowIdKey: 'id',
      initialSelectedIds: users.map(u => String(u.id)).filter(id => this.selectedAcrossPages.has(id)),
      onSelectionChange: (selectedIds) => {
        // update persisted selection for current page
        selectedIds.forEach(id => this.selectedAcrossPages.add(id));
        // remove any that were deselected on the page
        const pageIds = users.map(u => String(u.id));
        pageIds.forEach(pid => { if (!selectedIds.includes(pid)) this.selectedAcrossPages.delete(pid); });
        // if any are missing from persisted selection, unset allSelectedAcrossPages
        if (this.selectedAcrossPages.size === 0) this.allSelectedAcrossPages = false;
      }
    });
    // store current rows on table for re-rendering when selecting all pages
    (this.table as any).currentRows = users;
    this.table.renderRows(users);

    // update page info
    pageInfo.textContent = `Page ${this.page} of ${Math.max(1, Math.ceil((this.total || 0) / this.per_page))}`;
    // clear selection on reload
    this.table.clearSelection();
  }

  // Public render method to align with other page classes
  render() {
    // constructor triggers load which updates the DOM
  }

}
