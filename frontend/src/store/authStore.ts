/**
 * Authentication store using Zustand
 */

import { create } from "zustand";
import { apiClient } from "../services/api";
import { UserResponse } from "../types/api";

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes in milliseconds

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  expiresAt: number | null; // Timestamp when session expires due to inactivity
  lastActivityAt: number | null; // Timestamp of last user activity
  logoutTimerId: number | null; // Timer ID for auto-logout

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUserFromToken: () => Promise<void>;
  clearError: () => void;
  checkTokenExpiration: () => boolean;
  recordActivity: () => void; // Record user activity and extend session
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("auth_token"),
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  expiresAt: localStorage.getItem("auth_expires_at")
    ? parseInt(localStorage.getItem("auth_expires_at")!, 10)
    : null,
  lastActivityAt: localStorage.getItem("auth_last_activity")
    ? parseInt(localStorage.getItem("auth_last_activity")!, 10)
    : null,
  logoutTimerId: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.login(username, password);
      const token = response.access_token;

      const now = Date.now();
      const expiresAt = now + INACTIVITY_TIMEOUT_MS;

      // Store token, expiration time, and last activity time
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_expires_at", expiresAt.toString());
      localStorage.setItem("auth_last_activity", now.toString());

      // Fetch user info
      const user = await apiClient.me();

      // Clear any existing logout timer
      const state = get();
      if (state.logoutTimerId) {
        clearTimeout(state.logoutTimerId);
      }

      // Set up inactivity-based auto-logout timer
      const logoutTimerId = setTimeout(() => {
        const currentState = get();
        if (currentState.isAuthenticated && currentState.expiresAt === expiresAt) {
          // Session expired due to inactivity
          currentState.logout();
        }
      }, INACTIVITY_TIMEOUT_MS);

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        expiresAt,
        lastActivityAt: now,
        logoutTimerId,
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
        expiresAt: null,
        lastActivityAt: null,
        logoutTimerId: null,
      });
      throw error;
    }
  },

  logout: () => {
    // Clear any existing logout timer
    const state = get();
    if (state.logoutTimerId) {
      clearTimeout(state.logoutTimerId);
    }

    // Clear token, expiration, and activity tracking from localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expires_at");
    localStorage.removeItem("auth_last_activity");

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
      expiresAt: null,
      lastActivityAt: null,
      logoutTimerId: null,
    });
  },

  loadUserFromToken: async () => {
    const token = localStorage.getItem("auth_token");
    const expiresAtStr = localStorage.getItem("auth_expires_at");
    const lastActivityStr = localStorage.getItem("auth_last_activity");

    if (!token) {
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        expiresAt: null,
        lastActivityAt: null,
        logoutTimerId: null,
      });
      return;
    }

    // Check if session expired due to inactivity
    if (expiresAtStr) {
      const expiresAt = parseInt(expiresAtStr, 10);
      if (Date.now() >= expiresAt) {
        // Session expired, clear it
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_expires_at");
        localStorage.removeItem("auth_last_activity");
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          expiresAt: null,
          lastActivityAt: null,
          logoutTimerId: null,
        });
        return;
      }
    }

    set({ isLoading: true });
    try {
      const user = await apiClient.me();
      const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null;
      const lastActivityAt = lastActivityStr ? parseInt(lastActivityStr, 10) : null;

      // Clear any existing logout timer
      const state = get();
      if (state.logoutTimerId) {
        clearTimeout(state.logoutTimerId);
      }

      // Set up auto-logout timer based on inactivity
      let logoutTimerId: number | null = null;
      if (expiresAt) {
        const timeUntilExpiry = expiresAt - Date.now();
        if (timeUntilExpiry > 0) {
          logoutTimerId = window.setTimeout(() => {
            const currentState = get();
            if (currentState.isAuthenticated && currentState.expiresAt === expiresAt) {
              // Session expired due to inactivity
              currentState.logout();
            }
          }, timeUntilExpiry);
        }
      }

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        expiresAt,
        lastActivityAt,
        logoutTimerId,
      });
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_expires_at");
      localStorage.removeItem("auth_last_activity");
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        expiresAt: null,
        lastActivityAt: null,
        logoutTimerId: null,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  checkTokenExpiration: () => {
    const { expiresAt } = get();
    if (!expiresAt) {
      return false;
    }
    return Date.now() < expiresAt;
  },

  recordActivity: () => {
    const state = get();

    // Only record activity if authenticated
    if (!state.isAuthenticated) {
      return;
    }

    const now = Date.now();
    const newExpiresAt = now + INACTIVITY_TIMEOUT_MS;

    // Update last activity and expiration time
    localStorage.setItem("auth_last_activity", now.toString());
    localStorage.setItem("auth_expires_at", newExpiresAt.toString());

    // Clear existing timeout
    if (state.logoutTimerId) {
      clearTimeout(state.logoutTimerId);
    }

    // Set new timeout for inactivity logout
    const logoutTimerId = window.setTimeout(() => {
      const currentState = get();
      if (currentState.isAuthenticated && currentState.expiresAt === newExpiresAt) {
        // Session expired due to inactivity
        currentState.logout();
      }
    }, INACTIVITY_TIMEOUT_MS);

    // Update state
    set({
      lastActivityAt: now,
      expiresAt: newExpiresAt,
      logoutTimerId,
    });
  },
}));
