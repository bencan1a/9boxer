/**
 * Hook to track user activity and extend session timeout
 * Listens for mouse movements, clicks, and keyboard events
 */

import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";

const ACTIVITY_THROTTLE_MS = 60000; // Only record activity once per minute to avoid excessive updates

export const useActivityTracker = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const recordActivity = useAuthStore((state) => state.recordActivity);
  const lastRecordedRef = useRef<number>(0);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleActivity = () => {
      const now = Date.now();

      // Throttle activity recording to avoid excessive updates
      if (now - lastRecordedRef.current < ACTIVITY_THROTTLE_MS) {
        return;
      }

      lastRecordedRef.current = now;
      recordActivity();
    };

    // Listen to various user interaction events
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup event listeners on unmount
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, recordActivity]);
};
