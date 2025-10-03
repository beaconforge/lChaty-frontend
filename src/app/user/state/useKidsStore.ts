import { create } from 'zustand';
import type { KidsPreset } from '../api/types';

type KidsState = {
  presets: KidsPreset[];
  lastUsed?: string;
  voiceEnabled: boolean;
  setPresets: (presets: KidsPreset[]) => void;
  markUsed: (key: string) => void;
  setVoiceEnabled: (enabled: boolean) => void;
};

export const useKidsStore = create<KidsState>(set => ({
  presets: [],
  lastUsed: undefined,
  voiceEnabled: false,
  setPresets: presets => set(state => ({ ...state, presets })),
  markUsed: key => set(state => ({ ...state, lastUsed: key })),
  setVoiceEnabled: enabled => set(state => ({ ...state, voiceEnabled: enabled })),
}));
