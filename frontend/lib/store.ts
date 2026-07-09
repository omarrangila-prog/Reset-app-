import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MeProfile } from "./api";

export type MindState = "CLEAR" | "FOGGY" | "RESTLESS" | "STABLE" | "TURBULENT";
export type Soundscape = "SILENT" | "RAIN" | "DEEP_FOCUS" | "BREATHING" | "CALM";

interface AppState {
  // Session-derived; NOT persisted (auth lives in the httpOnly cookie).
  userId: string | null;
  user: MeProfile | null;
  authReady: boolean;

  // UI-only preferences (safe to persist locally — no recovery content).
  mindState: MindState;
  currentSoundscape: Soundscape;
  reducedData: boolean;

  setUserId: (id: string | null) => void;
  setUser: (user: MeProfile | null) => void;
  setAuthReady: (ready: boolean) => void;
  updateMindState: (state: MindState) => void;
  setSoundscape: (soundscape: Soundscape) => void;
  clearSession: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userId: null,
      user: null,
      authReady: false,

      mindState: "STABLE",
      currentSoundscape: "SILENT",
      reducedData: false,

      setUserId: (id) => set({ userId: id }),
      setUser: (user) => set({ user }),
      setAuthReady: (ready) => set({ authReady: ready }),
      updateMindState: (mindState) => set({ mindState }),
      setSoundscape: (currentSoundscape) => set({ currentSoundscape }),
      clearSession: () => set({ userId: null, user: null }),
    }),
    {
      name: "reset-prefs",
      // Persist ONLY non-sensitive UI preferences. No userId, no recovery data.
      partialize: (state) => ({
        mindState: state.mindState,
        currentSoundscape: state.currentSoundscape,
        reducedData: state.reducedData,
      }),
    }
  )
);
