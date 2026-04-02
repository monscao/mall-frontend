import { AuthProvider } from "context/AuthContext";
import { CartProvider } from "context/CartContext";
import { I18nProvider } from "context/I18nContext";
import { NotificationProvider } from "context/NotificationContext";
import { ThemeProvider } from "context/ThemeContext";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <NotificationProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </NotificationProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
