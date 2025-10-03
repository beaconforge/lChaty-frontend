import { create } from 'zustand';
import { AdminCommand } from '../types';

interface CommandPaletteState {
  open: boolean;
  commands: AdminCommand[];
  setCommands: (commands: AdminCommand[]) => void;
  toggle: (open?: boolean) => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>(set => ({
  open: false,
  commands: [],
  setCommands: commands => set({ commands }),
  toggle: open =>
    set(state => ({
      open: typeof open === 'boolean' ? open : !state.open,
    })),
}));
