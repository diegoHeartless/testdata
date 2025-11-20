import { create } from 'zustand';
import { Profile } from '../types';

interface ProfileStore {
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;
  clearCurrentProfile: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  currentProfile: null,
  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  clearCurrentProfile: () => set({ currentProfile: null }),
}));



