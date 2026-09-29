import type { AppUser } from "@/types";
import { create } from "zustand";

export type AuthStatus = "idle" | "loading" | "error" | "ready";

export type AuthStore = {
  status: AuthStatus;
  isBootstrapped: boolean;
  user: AppUser | null;
  error: string | null;

  setLoading: () => void;
  setUser: (user: AppUser | null) => void;
  setError: (message: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  status: "idle",
  isBootstrapped: false,
  user: null,
  error: null,
  setLoading: () =>
    set({
      status: "loading",
      error: null,
    }),
  setUser: (user) =>
    set({ status: "ready", user, error: null, isBootstrapped: true }),
  setError: (message) =>
    set({ status: "error", error: message, isBootstrapped: true }),
  clearAuth: () => set({ status: "idle", user: null, error: null }),
}));
