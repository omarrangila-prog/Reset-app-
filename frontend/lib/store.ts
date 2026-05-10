import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile } from "./api";

interface AppState {
  userId: string | null;
  user: UserProfile | null;
  currentMode: "URGE" | "VULNERABILITY" | "RECOVERY";

  setUserId: (id: string) => void;
  setUser: (user: UserProfile) => void;
  setMode: (mode: "URGE" | "VULNERABILITY" | "RECOVERY") => void;
  updateStreak: (streak: number, disciplineScore: number) => void;
  clearUser: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userId: null,
      user: null,
      currentMode: "RECOVERY",

      setUserId: (id) => set({ userId: id }),
      setUser: (user) => set({ user }),
      setMode: (mode) => set({ currentMode: mode }),
      updateStreak: (streak, disciplineScore) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, streak, disciplineScore }
            : null,
        })),
      clearUser: () => set({ userId: null, user: null }),
    }),
    {
      name: "reset-store",
      partialize: (state) => ({ userId: state.userId }),
    }
  )
);
