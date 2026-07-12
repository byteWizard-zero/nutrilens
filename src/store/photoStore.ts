'use client';

import { create } from 'zustand';

interface PhotoState {
  photo: string | null;
  setPhoto: (photo: string | null) => void;
  clearPhoto: () => void;
}

export const usePhotoStore = create<PhotoState>((set) => ({
  photo: typeof window !== 'undefined' ? sessionStorage.getItem('nutrilens-photo') : null,
  setPhoto: (photo) => {
    set({ photo });
    if (typeof window !== 'undefined') {
      if (photo) {
        try {
          sessionStorage.setItem('nutrilens-photo', photo);
        } catch (e) {
          console.warn('sessionStorage failed (probably photo size exceeds 5MB limit):', e);
        }
      } else {
        sessionStorage.removeItem('nutrilens-photo');
      }
    }
  },
  clearPhoto: () => {
    set({ photo: null });
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('nutrilens-photo');
    }
  },
}));
