import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef(new Map());

  const removeNotification = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const pushNotification = useCallback(
    ({ title, message = "", tone = "info", duration = 3200 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const item = { id, title, message, tone };

      setNotifications((current) => [...current, item]);

      const timer = window.setTimeout(() => {
        removeNotification(id);
      }, duration);

      timersRef.current.set(id, timer);
      return id;
    },
    [removeNotification]
  );

  const value = useMemo(
    () => ({
      notifications,
      pushNotification,
      removeNotification
    }),
    [notifications, pushNotification, removeNotification]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }

  return context;
}
