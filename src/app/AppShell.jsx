import { FloatingActions } from "components/FloatingActions";
import { Footer } from "components/Footer";
import { Header } from "components/Header";
import { NotificationCenter } from "components/NotificationCenter";

export function AppShell({ children, currentPath, currentSearch, navigate }) {
  return (
    <div className="app-shell">
      <Header currentPath={currentPath} currentSearch={currentSearch} navigate={navigate} />
      <NotificationCenter />
      <main className="app-main">{children}</main>
      <Footer navigate={navigate} />
      <FloatingActions navigate={navigate} />
    </div>
  );
}
