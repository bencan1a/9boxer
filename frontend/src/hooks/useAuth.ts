/**
 * Custom hook for authentication
 */

import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, isLoading, error } =
    useAuthStore();

  return {
    user,
    isAuthenticated,
    login,
    logout,
    isLoading,
    error,
  };
};
