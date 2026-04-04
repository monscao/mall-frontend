import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { APP_VERSION, fetchSystemHealth } from "services/api";

const VersionContext = createContext(null);

export function VersionProvider({ children }) {
  const [versionInfo, setVersionInfo] = useState({
    backendVersion: null,
    frontendVersion: APP_VERSION,
    service: null,
    status: "idle"
  });

  useEffect(() => {
    let active = true;

    fetchSystemHealth()
      .then((data) => {
        if (!active) {
          return;
        }

        setVersionInfo({
          backendVersion: data?.backendVersion || null,
          frontendVersion: data?.frontendVersion || APP_VERSION,
          service: data?.service || null,
          status: data?.status || "ok"
        });
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setVersionInfo((current) => ({
          ...current,
          status: "unavailable"
        }));
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => versionInfo, [versionInfo]);

  return <VersionContext.Provider value={value}>{children}</VersionContext.Provider>;
}

export function useVersion() {
  const context = useContext(VersionContext);

  if (!context) {
    throw new Error("useVersion must be used within VersionProvider");
  }

  return context;
}
