import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createCatalogPath } from "../lib/navigation";
import { AppLink } from "./AppLink";

const navItems = [
  { label: "首页", to: "/" },
  { label: "全部商品", to: "/catalog" },
  { label: "热销", to: createCatalogPath("", "sales") }
];

export function Header({ currentPath, currentSearch, navigate }) {
  const { isAuthenticated, logout, session } = useAuth();
  const { totalItems } = useCart();
  const currentUrl = `${currentPath}${currentSearch || ""}`;

  return (
    <header className="site-header">
      <div className="header-inner">
        <AppLink className="brand-lockup" navigate={navigate} to="/">
          <span className="brand-mark">AL</span>
          <div>
            <strong>Apple Lite</strong>
            <small>Local Mall Frontend</small>
          </div>
        </AppLink>

        <nav className="header-nav">
          {navItems.map((item) => (
            <AppLink
              className={`nav-link ${currentUrl === item.to || (item.to === "/catalog" && currentPath === "/catalog" && !currentSearch) ? "is-active" : ""}`}
              key={item.to}
              navigate={navigate}
              to={item.to}
            >
              {item.label}
            </AppLink>
          ))}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="account-chip">
              <span>{session?.currentUser?.username || session?.username}</span>
              <button className="text-button" type="button" onClick={logout}>
                退出
              </button>
            </div>
          ) : (
            <div className="auth-actions">
              <AppLink className="text-link" navigate={navigate} to="/login">
                登录
              </AppLink>
              <AppLink className="primary-button button-small" navigate={navigate} to="/register">
                注册
              </AppLink>
            </div>
          )}

          <button className="cart-button" type="button" onClick={() => navigate("/cart")}>
            购物车
            <span>{totalItems}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
