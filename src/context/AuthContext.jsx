import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, loginUser, registerUser } from "services/api";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "mall-frontend-auth";

function readStoredAuth() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredAuth());
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrateUser() {
      if (!session?.token) {
        setAuthReady(true);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser(session.token);
        if (active) {
          const nextSession = {
            ...session,
            currentUser
          };
          setSession(nextSession);
          window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
        }
      } catch (_error) {
        if (active) {
          setSession(null);
          window.localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    }

    hydrateUser();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      authReady,
      isAuthenticated: Boolean(session?.token),
      isAdmin: Boolean(session?.currentUser?.roleCodes?.includes("ADMIN") || session?.roleCodes?.includes("ADMIN")),
      session,
      async login(payload) {
        const response = await loginUser(payload);
        const currentUser = await fetchCurrentUser(response.token);
        const nextSession = {
          ...response,
          currentUser
        };
        setSession(nextSession);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
        return nextSession;
      },
      async register(payload) {
        const response = await registerUser(payload);
        const currentUser = await fetchCurrentUser(response.token);
        const nextSession = {
          ...response,
          currentUser
        };
        setSession(nextSession);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
        return nextSession;
      },
      logout() {
        setSession(null);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }),
    [authReady, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
