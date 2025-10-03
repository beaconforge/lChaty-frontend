import { create } from 'zustand';

type SelectionState = {
  selectedIds: Record<string, Set<string>>;
  select: (table: string, id: string) => void;
  deselect: (table: string, id: string) => void;
  clear: (table: string) => void;
  replace: (table: string, ids: string[]) => void;
};

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedIds: {},
  select: (table, id) => {
    const current = new Set(get().selectedIds[table] ?? []);
    current.add(id);
    set(state => ({ selectedIds: { ...state.selectedIds, [table]: current } }));
  },
  deselect: (table, id) => {
    const current = new Set(get().selectedIds[table] ?? []);
    current.delete(id);
    set(state => ({ selectedIds: { ...state.selectedIds, [table]: current } }));
  },
  clear: table => {
    set(state => ({ selectedIds: { ...state.selectedIds, [table]: new Set<string>() } }));
  },
  replace: (table, ids) => {
    set(state => ({ selectedIds: { ...state.selectedIds, [table]: new Set(ids) } }));
  },
}));
