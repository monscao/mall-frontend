import { useEffect } from "react";
import { FloatingActions } from "components/FloatingActions";
import { Footer } from "components/Footer";
import { Header } from "components/Header";
import { NotificationCenter } from "components/NotificationCenter";

export function AppShell({ children, currentPath, currentSearch, navigate }) {
  const isAuthRoute = currentPath === "/login" || currentPath === "/register";

  useEffect(() => {
    document.documentElement.classList.toggle("auth-route-active", isAuthRoute);
    document.body.classList.toggle("auth-route-active", isAuthRoute);

    return () => {
      document.documentElement.classList.remove("auth-route-active");
      document.body.classList.remove("auth-route-active");
    };
  }, [isAuthRoute]);

  return (
    <div className={`app-shell ${isAuthRoute ? "app-shell-auth" : ""}`}>
      <Header currentPath={currentPath} currentSearch={currentSearch} navigate={navigate} />
      <NotificationCenter />
      <main className="app-main">{children}</main>
      {isAuthRoute ? null : <Footer navigate={navigate} />}
      {isAuthRoute ? null : <FloatingActions navigate={navigate} />}
    </div>
  );
}
