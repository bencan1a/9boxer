/**
 * Custom hook for session management
 */

import { useSessionStore } from "../store/sessionStore";

export const useSession = () => {
  const {
    sessionId,
    employees,
    originalEmployees,
    changes,
    filename,
    isLoading,
    error,
    uploadFile,
    clearSession,
    loadEmployees,
    moveEmployee,
    updateChangeNotes,
    selectedEmployeeId,
    selectEmployee,
  } = useSessionStore();

  return {
    sessionId,
    employees,
    originalEmployees,
    changes,
    filename,
    isLoading,
    error,
    uploadFile,
    clearSession,
    loadEmployees,
    moveEmployee,
    updateChangeNotes,
    selectedEmployeeId,
    selectEmployee,
  };
};
