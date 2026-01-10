import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Toast, type ToastProps } from "../components/notifications/Toast";
import {
  NotificationBanner,
  type NotificationBannerProps,
} from "../components/notifications/NotificationBanner";
import Box from "@mui/material/Box";

// Toast notification interface
interface ToastNotification extends Omit<ToastProps, "open" | "onClose"> {
  id: string;
}

// Banner notification interface
interface BannerNotification extends Omit<NotificationBannerProps, "onClose"> {
  id: string;
}

// Context interface
interface NotificationContextValue {
  // Toast methods
  showToast: (options: Omit<ToastNotification, "id">) => string;
  showInfoToast: (message: string, action?: ToastProps["action"]) => string;
  showSuccessToast: (message: string, action?: ToastProps["action"]) => string;
  showWarningToast: (message: string, action?: ToastProps["action"]) => string;
  showErrorToast: (message: string, action?: ToastProps["action"]) => string;
  hideToast: (id: string) => void;

  // Banner methods
  showBanner: (options: Omit<BannerNotification, "id">) => string;
  hideBanner: (id: string) => void;
  hideAllBanners: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [banners, setBanners] = useState<BannerNotification[]>([]);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // hideToast function (defined early for use in showToast)
  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Toast methods
  const showToast = useCallback(
    (options: Omit<ToastNotification, "id">): string => {
      const id = generateId();
      const newToast: ToastNotification = { ...options, id };

      setToasts((prev) => [...prev, newToast]);

      // Auto-hide if not persistent
      if (!options.persistent) {
        const duration = options.duration || 4000;
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }

      return id;
    },
    [generateId, hideToast]
  );

  const showInfoToast = useCallback(
    (message: string, action?: ToastProps["action"]): string => {
      return showToast({ variant: "info", message, action });
    },
    [showToast]
  );

  const showSuccessToast = useCallback(
    (message: string, action?: ToastProps["action"]): string => {
      return showToast({ variant: "success", message, action });
    },
    [showToast]
  );

  const showWarningToast = useCallback(
    (message: string, action?: ToastProps["action"]): string => {
      return showToast({ variant: "warning", message, action });
    },
    [showToast]
  );

  const showErrorToast = useCallback(
    (message: string, action?: ToastProps["action"]): string => {
      return showToast({ variant: "error", message, action });
    },
    [showToast]
  );

  // Banner methods
  const showBanner = useCallback(
    (options: Omit<BannerNotification, "id">): string => {
      const id = generateId();
      const newBanner: BannerNotification = { ...options, id };

      setBanners((prev) => [...prev, newBanner]);
      return id;
    },
    [generateId]
  );

  const hideBanner = useCallback((id: string) => {
    setBanners((prev) => prev.filter((banner) => banner.id !== id));
  }, []);

  const hideAllBanners = useCallback(() => {
    setBanners([]);
  }, []);

  // Current toast (show only the first one in queue)
  const currentToast = toasts[0] || null;

  const contextValue: NotificationContextValue = {
    showToast,
    showInfoToast,
    showSuccessToast,
    showWarningToast,
    showErrorToast,
    hideToast,
    showBanner,
    hideBanner,
    hideAllBanners,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Render banners at top of page */}
      {banners.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.snackbar - 100, // Below toasts but above most content
            padding: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pointerEvents: "none",
            "& > *": {
              pointerEvents: "auto",
            },
          }}
        >
          {banners.map((banner) => (
            <NotificationBanner
              key={banner.id}
              {...banner}
              onClose={
                banner.closable !== false
                  ? () => hideBanner(banner.id)
                  : undefined
              }
            />
          ))}
        </Box>
      )}

      {/* Render current toast */}
      {currentToast && (
        <Toast
          {...currentToast}
          open={true}
          onClose={() => hideToast(currentToast.id)}
        />
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
