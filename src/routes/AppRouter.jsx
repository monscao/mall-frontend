import { useMemo } from "react";
import { AppShell } from "app/AppShell";
import { useRouter } from "hooks/useRouter";
import { AdminProductPage } from "pages/AdminProductPage";
import { CartPage } from "pages/CartPage";
import { CatalogPage } from "pages/CatalogPage";
import { CheckoutPage } from "pages/CheckoutPage";
import { HelpCenterPage } from "pages/HelpCenterPage";
import { HomePage } from "pages/HomePage";
import { LoginPage } from "pages/LoginPage";
import { NotFoundPage } from "pages/NotFoundPage";
import { OrderDetailPage } from "pages/OrderDetailPage";
import { OrdersPage } from "pages/OrdersPage";
import { ProductManagementPage } from "pages/ProductManagementPage";
import { ProductPage } from "pages/ProductPage";
import { RegisterPage } from "pages/RegisterPage";
import { UserProfilePage } from "pages/UserProfilePage";

export function AppRouter() {
  const { route, navigate, orderId, productSlug } = useRouter();

  const currentPage = useMemo(() => {
    if (route.pathname === "/") {
      return <HomePage navigate={navigate} />;
    }

    if (route.pathname === "/catalog") {
      return <CatalogPage navigate={navigate} route={route} />;
    }

    if (productSlug) {
      return <ProductPage navigate={navigate} slug={productSlug} />;
    }

    if (route.pathname === "/login") {
      return <LoginPage navigate={navigate} />;
    }

    if (route.pathname === "/register") {
      return <RegisterPage navigate={navigate} />;
    }

    if (route.pathname === "/cart") {
      return <CartPage navigate={navigate} />;
    }

    if (route.pathname === "/checkout") {
      return <CheckoutPage navigate={navigate} />;
    }

    if (route.pathname === "/orders") {
      return <OrdersPage navigate={navigate} />;
    }

    if (route.pathname === "/account") {
      return <UserProfilePage navigate={navigate} />;
    }

    if (orderId) {
      return <OrderDetailPage navigate={navigate} orderId={orderId} />;
    }

    if (route.pathname === "/help") {
      return <HelpCenterPage route={route} />;
    }

    if (route.pathname === "/admin/products/new") {
      return <AdminProductPage navigate={navigate} />;
    }

    if (route.pathname === "/admin/products") {
      return <ProductManagementPage navigate={navigate} />;
    }

    return <NotFoundPage navigate={navigate} />;
  }, [navigate, orderId, productSlug, route]);

  return (
    <AppShell currentPath={route.pathname} currentSearch={route.search} navigate={navigate}>
      {currentPage}
    </AppShell>
  );
}
