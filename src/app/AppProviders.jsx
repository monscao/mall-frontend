import { AuthProvider } from "context/AuthContext";
import { CartProvider } from "context/CartContext";
import { I18nProvider } from "context/I18nContext";
import { NotificationProvider } from "context/NotificationContext";
import { ThemeProvider } from "context/ThemeContext";
import { VersionProvider } from "context/VersionContext";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <VersionProvider>
          <NotificationProvider>
            <AuthProvider>
              <CartProvider>{children}</CartProvider>
            </AuthProvider>
          </NotificationProvider>
        </VersionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
