import { useEffect, useMemo, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { BackToTopButton } from "./components/BackToTopButton";
import { CartPage } from "./pages/CartPage";
import { CatalogPage } from "./pages/CatalogPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProductPage } from "./pages/ProductPage";
import { RegisterPage } from "./pages/RegisterPage";

function parseLocation() {
  const { pathname, search } = window.location;
  return {
    pathname,
    search,
    searchParams: new URLSearchParams(search)
  };
}

function matchProductRoute(pathname) {
  const match = pathname.match(/^\/product\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function AppRouter() {
  const [route, setRoute] = useState(() => parseLocation());

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseLocation());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = (to) => {
    if (to === `${route.pathname}${route.search}`) {
      return;
    }

    window.history.pushState({}, "", to);
    setRoute(parseLocation());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentPage = useMemo(() => {
    const productSlug = matchProductRoute(route.pathname);

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

    return <NotFoundPage navigate={navigate} />;
  }, [route]);

  return (
    <div className="app-shell">
      <Header currentPath={route.pathname} currentSearch={route.search} navigate={navigate} />
      <main className="app-main">{currentPage}</main>
      <Footer navigate={navigate} />
      <BackToTopButton />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
