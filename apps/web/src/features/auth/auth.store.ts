import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api-client.js";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { accessToken } = await apiClient.post<{ accessToken: string }>(
          "/auth/login",
          { email, password },
        );
        localStorage.setItem("access_token", accessToken);
        set({ accessToken, isAuthenticated: true });
      },

      register: async (email, password) => {
        const { accessToken } = await apiClient.post<{ accessToken: string }>(
          "/auth/register",
          { email, password },
        );
        localStorage.setItem("access_token", accessToken);
        set({ accessToken, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("access_token");
        set({ accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) state.isAuthenticated = true;
      },
    },
  ),
);
