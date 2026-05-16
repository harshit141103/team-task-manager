"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/lib/types/domain";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  setAuth: (payload: { user: User; access: string; refresh?: string }) => void;
  setAccessToken: (access: string, refresh?: string) => void;
  updateUser: (user: User) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

function setSessionMarker(active: boolean) {
  if (typeof document === "undefined") return;
  if (active) {
    document.cookie = "ttm_session=1; path=/; max-age=604800; SameSite=Lax";
  } else {
    document.cookie = "ttm_session=; path=/; max-age=0; SameSite=Lax";
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,
      setAuth: ({ user, access, refresh }) => {
        setSessionMarker(true);
        set({ user, accessToken: access, refreshToken: refresh ?? null });
      },
      setAccessToken: (access, refresh) => {
        setSessionMarker(true);
        set((state) => ({ accessToken: access, refreshToken: refresh ?? state.refreshToken }));
      },
      updateUser: (user) => set({ user }),
      clearAuth: () => {
        setSessionMarker(false);
        set({ user: null, accessToken: null, refreshToken: null });
      },
      setHasHydrated: (value) => set({ hasHydrated: value })
    }),
    {
      name: "team-task-manager-auth",
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true)
    }
  )
);
