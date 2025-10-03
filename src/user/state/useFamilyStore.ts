import { create } from 'zustand';
import type { FamilyOverview, FamilyRequest } from '../api/types';

type FamilyState = {
  household?: FamilyOverview;
  pendingRequests: FamilyRequest[];
  setHousehold: (household?: FamilyOverview) => void;
  setPendingRequests: (requests: FamilyRequest[]) => void;
  upsertRequest: (request: FamilyRequest) => void;
  removeRequest: (id: string) => void;
};

export const useFamilyStore = create<FamilyState>(set => ({
  household: undefined,
  pendingRequests: [],
  setHousehold: household => set(state => ({ ...state, household })),
  setPendingRequests: pendingRequests => set(state => ({ ...state, pendingRequests })),
  upsertRequest: request =>
    set(state => {
      const existingIndex = state.pendingRequests.findIndex(item => item.id === request.id);
      if (existingIndex >= 0) {
        const next = [...state.pendingRequests];
        next[existingIndex] = request;
        return { ...state, pendingRequests: next };
      }
      return { ...state, pendingRequests: [...state.pendingRequests, request] };
    }),
  removeRequest: id =>
    set(state => ({
      ...state,
      pendingRequests: state.pendingRequests.filter(item => item.id !== id),
    })),
}));
