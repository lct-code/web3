import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

interface OverlayState {
  isMaximized: boolean;
  isQueueOpen: boolean;
  open: () => void;
  toggle: () => void;
  toggleQueue: () => void;
}

export const usePlayerOverlayStore = create<OverlayState>()(
  immer((set, get) => ({
    isMaximized: false,
    isQueueOpen: false,
    open: () => {
      set(state => {
        state.isMaximized = true;
      });
    },
    toggle: () => {
      set(state => {
        state.isMaximized = !state.isMaximized;
      });
    },
    toggleQueue: () => {
      set(state => {
        state.isQueueOpen = !state.isQueueOpen;
      });
    },
  }))
);

export const playerOverlayState = usePlayerOverlayStore.getState();
