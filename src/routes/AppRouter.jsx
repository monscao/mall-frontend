import { lazy, Suspense, useMemo } from "react";
import { AppShell } from "app/AppShell";
import { SectionState } from "components/SectionState";
import { useRouter } from "hooks/useRouter";

function lazyPage(loader, exportName) {
  return lazy(() => loader().then((module) => ({ default: module[exportName] })));
}

const AdminProductPage = lazyPage(() => import("pages/AdminProductPage"), "AdminProductPage");
const CartPage = lazyPage(() => import("pages/CartPage"), "CartPage");
const CatalogPage = lazyPage(() => import("pages/CatalogPage"), "CatalogPage");
const CheckoutPage = lazyPage(() => import("pages/CheckoutPage"), "CheckoutPage");
const HelpCenterPage = lazyPage(() => import("pages/HelpCenterPage"), "HelpCenterPage");
const HomePage = lazyPage(() => import("pages/HomePage"), "HomePage");
const LoginPage = lazyPage(() => import("pages/LoginPage"), "LoginPage");
const NotFoundPage = lazyPage(() => import("pages/NotFoundPage"), "NotFoundPage");
const OrderDetailPage = lazyPage(() => import("pages/OrderDetailPage"), "OrderDetailPage");
const OrdersPage = lazyPage(() => import("pages/OrdersPage"), "OrdersPage");
const ProductManagementPage = lazyPage(() => import("pages/ProductManagementPage"), "ProductManagementPage");
const ProductPage = lazyPage(() => import("pages/ProductPage"), "ProductPage");
const RegisterPage = lazyPage(() => import("pages/RegisterPage"), "RegisterPage");
const UserProfilePage = lazyPage(() => import("pages/UserProfilePage"), "UserProfilePage");

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
      <Suspense
        fallback={
          <SectionState title="Loading page" body="Fetching the next view and preparing the storefront." tone="loading" />
        }
      >
        {currentPage}
      </Suspense>
    </AppShell>
  );
}
