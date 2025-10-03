import { create } from 'zustand';

type Drafts = Record<string, string>;

type ChatState = {
  currentThreadId?: string;
  draftText: Drafts;
  streamingThreadId?: string;
  setCurrentThread: (id?: string) => void;
  setDraftText: (threadId: string, text: string) => void;
  clearDraft: (threadId: string) => void;
  setStreamingThread: (threadId?: string) => void;
};

export const useChatStore = create<ChatState>(set => ({
  currentThreadId: undefined,
  draftText: {},
  streamingThreadId: undefined,
  setCurrentThread: id => set(state => ({ ...state, currentThreadId: id })),
  setDraftText: (threadId, text) =>
    set(state => ({
      ...state,
      draftText: {
        ...state.draftText,
        [threadId]: text,
      },
    })),
  clearDraft: threadId =>
    set(state => {
      const next = { ...state.draftText };
      delete next[threadId];
      return { ...state, draftText: next };
    }),
  setStreamingThread: threadId => set(state => ({ ...state, streamingThreadId: threadId })),
}));
