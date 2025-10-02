/**
 * Minimal table helper to render headers and rows and support selection.
 * This is intentionally light-weight and DOM-driven to fit the current codebase.
 */

export type TableColumn = {
  key: string;
  title: string;
  width?: string;
  render?: (row: any) => string | HTMLElement;
};

export interface TableOptions {
  selectable?: boolean;
  rowIdKey?: string;
  // initial selection for the current page (array of ids)
  initialSelectedIds?: string[];
  // callback when selection changes (selected ids for current page)
  onSelectionChange?: (selectedIds: string[]) => void;
}

export class Table {
  container: HTMLElement;
  table: HTMLTableElement;
  thead: HTMLTableSectionElement;
  tbody: HTMLTableSectionElement;
  columns: TableColumn[];
  options: TableOptions;
  selected: Set<string> = new Set();
  private selectAllCheckbox: HTMLInputElement | null = null;

  constructor(container: HTMLElement, columns: TableColumn[], options: TableOptions = {}) {
    this.container = container;
    this.columns = columns;
    this.options = options;
    this.table = document.createElement('table');
    this.table.className = 'min-w-full divide-y divide-gray-200';
    this.thead = document.createElement('thead');
    this.tbody = document.createElement('tbody');
    this.table.appendChild(this.thead);
    this.table.appendChild(this.tbody);
    this.container.innerHTML = '';
    this.container.appendChild(this.table);
    this.renderHeader();
  }

  private renderHeader() {
    const tr = document.createElement('tr');
    if (this.options.selectable) {
      const thSel = document.createElement('th');
      thSel.style.padding = '8px 12px';
      this.selectAllCheckbox = document.createElement('input');
      this.selectAllCheckbox.type = 'checkbox';
      this.selectAllCheckbox.addEventListener('change', () => {
        const checked = this.selectAllCheckbox!.checked;
        const checkboxes = this.tbody.querySelectorAll('input[data-row-select]') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach(cb => { cb.checked = checked; const id = cb.getAttribute('data-row-id'); if (id) { if (checked) this.selected.add(id); else this.selected.delete(id); } });
        if (this.options.onSelectionChange) this.options.onSelectionChange(Array.from(this.selected));
      });
      thSel.appendChild(this.selectAllCheckbox);
      tr.appendChild(thSel);
    }

    this.columns.forEach(col => {
      const th = document.createElement('th');
      th.style.textAlign = 'left';
      th.style.padding = '8px 12px';
      th.textContent = col.title;
      tr.appendChild(th);
    });
    this.thead.innerHTML = '';
    this.thead.appendChild(tr);
  }

  renderRows(rows: any[]) {
    this.tbody.innerHTML = '';
    // if an initial selection for this page is provided, seed it
    this.selected.clear();
    if (this.options.initialSelectedIds && this.options.initialSelectedIds.length) {
      this.options.initialSelectedIds.forEach(id => this.selected.add(id));
    }
    rows.forEach(row => {
      const tr = document.createElement('tr');
      if (this.options.selectable) {
        const tdSel = document.createElement('td');
        tdSel.style.padding = '8px 12px';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        const id = String(row[this.options.rowIdKey || 'id']);
        cb.setAttribute('data-row-select', '1');
        cb.setAttribute('data-row-id', id);
        // Set initial checkbox state
        cb.checked = this.selected.has(id);
        cb.addEventListener('change', () => {
          if (cb.checked) this.selected.add(id); else this.selected.delete(id);
          if (this.selectAllCheckbox) {
            const all = this.tbody.querySelectorAll('input[data-row-select]') as NodeListOf<HTMLInputElement>;
            const checked = Array.from(all).every(x => x.checked);
            this.selectAllCheckbox.checked = checked;
          }
          if (this.options.onSelectionChange) this.options.onSelectionChange(Array.from(this.selected));
        });
        tdSel.appendChild(cb);
        tr.appendChild(tdSel);
      }

      this.columns.forEach(col => {
        const td = document.createElement('td');
        td.style.padding = '8px 12px';
        if (col.render) {
          const out = col.render(row);
          if (typeof out === 'string') td.innerHTML = out;
          else td.appendChild(out);
        } else {
          td.textContent = row[col.key] ?? '';
        }
        tr.appendChild(td);
      });
      this.tbody.appendChild(tr);
    });
  }

  getSelectedIds(): string[] {
    return Array.from(this.selected);
  }

  clearSelection() {
    this.selected.clear();
    const checkboxes = this.tbody.querySelectorAll('input[data-row-select]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => cb.checked = false);
    if (this.selectAllCheckbox) this.selectAllCheckbox.checked = false;
  }
}

export default Table;
