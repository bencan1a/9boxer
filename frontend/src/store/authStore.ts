/**
 * Authentication store using Zustand
 */

import { create } from "zustand";
import { apiClient } from "../services/api";
import { UserResponse } from "../types/api";

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUserFromToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("auth_token"),
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.login(username, password);
      const token = response.access_token;

      // Store token
      localStorage.setItem("auth_token", token);

      // Fetch user info
      const user = await apiClient.me();

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Login failed. Please try again.";
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: () => {
    // Clear token from localStorage
    localStorage.removeItem("auth_token");

    // Call backend logout (fire and forget)
    apiClient.logout().catch(() => {
      // Ignore errors on logout
    });

    // Reset state
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  loadUserFromToken: async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await apiClient.me();
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem("auth_token");
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
