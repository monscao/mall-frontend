import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "context/AuthContext";
import { useI18n } from "context/I18nContext";
import { useNotification } from "context/NotificationContext";
import { useTheme } from "context/ThemeContext";
import { createCatalogPath } from "shared/utils/navigation";
import { AppLink } from "components/AppLink";
import { BrandMark } from "components/BrandMark";
import { IconArrowRight, IconClose, IconGlobe, IconMenu, IconMoon, IconSun } from "components/Icons";

export function Header({ currentPath, currentSearch, navigate }) {
  const { isAuthenticated, isAdmin, logout, session } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const { pushNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const languageRef = useRef(null);
  const userMenuRef = useRef(null);

  const searchParams = useMemo(() => new URLSearchParams(currentSearch || ""), [currentSearch]);
  const currentSort = searchParams.get("sort") || "featured";
  const isCatalogRoute = currentPath === "/catalog";
  const isHotRoute = isCatalogRoute && currentSort === "sales";

  const navItems = [
    { label: t("nav.home"), to: "/", isActive: currentPath === "/" },
    { label: t("nav.catalog"), to: "/catalog", isActive: isCatalogRoute && !isHotRoute },
    { label: t("nav.hot"), to: createCatalogPath("", "sales"), isActive: isHotRoute }
  ];

  useEffect(() => {
    function handleClick(event) {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setLanguageOpen(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setLanguageOpen(false);
    setUserMenuOpen(false);
  }, [currentPath, currentSearch]);

  return (
    <header className="site-header">
      <div className={`header-inner header-inner-minimal ${mobileMenuOpen ? "is-mobile-open" : ""}`}>
        <AppLink className="brand-lockup" navigate={navigate} to="/">
          <span className="brand-mark" aria-hidden="true">
            <BrandMark />
          </span>
          <div>
            <strong>MONSCAO</strong>
          </div>
        </AppLink>

        <button
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? t("header.mobile.close") : t("header.mobile.open")}
          className="header-mobile-toggle"
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
        >
          {mobileMenuOpen ? <IconClose className="button-icon-svg" /> : <IconMenu className="button-icon-svg" />}
        </button>

        <div className={`header-mobile-panel ${mobileMenuOpen ? "is-open" : ""}`}>
          <div className="mobile-menu-section">
            <span className="mobile-menu-label">Navigation</span>
            <nav className="header-nav header-nav-minimal">
              {navItems.map((item) => (
                <AppLink
                  className={`nav-link ${item.isActive ? "is-active" : ""}`}
                  key={item.to}
                  navigate={navigate}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{item.label}</span>
                  <IconArrowRight className="button-icon-svg" />
                </AppLink>
              ))}
            </nav>
          </div>

          <div className="header-actions header-actions-minimal">
            {isAuthenticated ? (
              <div className="mobile-menu-section">
                <span className="mobile-menu-label">Account</span>
                <div
                  className="user-menu"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                  ref={userMenuRef}
                >
                  <button
                    className="user-menu-trigger"
                    type="button"
                    onClick={() => setUserMenuOpen((current) => !current)}
                  >
                    {session?.currentUser?.username || session?.username}
                  </button>
                  <div className={`user-menu-panel ${userMenuOpen ? "is-open" : ""}`}>
                    <button className="user-menu-item" type="button" onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/account");
                    }}>
                      {t("header.menu.profile")}
                    </button>
                    <button className="user-menu-item" type="button" onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/orders");
                    }}>
                      {t("nav.orders")}
                    </button>
                    {isAdmin ? (
                      <>
                        <button className="user-menu-item" type="button" onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/admin/products");
                        }}>
                          {t("header.menu.productManagement")}
                        </button>
                        <button className="user-menu-item" type="button" onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/admin/products/new");
                        }}>
                          {t("header.menu.addProduct")}
                        </button>
                      </>
                    ) : null}
                    <button
                      className="user-menu-item user-menu-item-danger"
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setMobileMenuOpen(false);
                        logout();
                        navigate("/");
                        pushNotification({
                          tone: "success",
                          title: t("header.logout.title"),
                          message: t("header.logout.body")
                        });
                      }}
                    >
                      {t("auth.logout")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mobile-menu-section">
                <span className="mobile-menu-label">Account</span>
                <div className="auth-actions auth-actions-minimal">
                  <AppLink className="secondary-button" navigate={navigate} to="/login" onClick={() => setMobileMenuOpen(false)}>
                    {t("auth.login")}
                  </AppLink>
                  <AppLink className="primary-button button-small" navigate={navigate} to="/register" onClick={() => setMobileMenuOpen(false)}>
                    {t("auth.register")}
                  </AppLink>
                </div>
              </div>
            )}

            <div className="mobile-menu-section">
              <span className="mobile-menu-label">Preferences</span>
              <div className="mobile-menu-utility-grid">
                <button
                  aria-label={theme === "dark" ? t("theme.dark") : t("theme.light")}
                  className="theme-toggle"
                  type="button"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? <IconMoon className="button-icon-svg" /> : <IconSun className="button-icon-svg" />}
                </button>

                <div className="language-menu" ref={languageRef}>
                  <button
                    className="language-menu-trigger"
                    type="button"
                    onClick={() => setLanguageOpen((current) => !current)}
                  >
                    <IconGlobe className="button-icon-svg" />
                    {language.toUpperCase()}
                  </button>
                  <div className={`language-menu-panel ${languageOpen ? "is-open" : ""}`}>
                    <button className={`language-menu-item ${language === "zh" ? "is-active" : ""}`} type="button" onClick={() => {
                      setLanguage("zh");
                      setLanguageOpen(false);
                    }}>
                      ZH
                    </button>
                    <button className={`language-menu-item ${language === "en" ? "is-active" : ""}`} type="button" onClick={() => {
                      setLanguage("en");
                      setLanguageOpen(false);
                    }}>
                      EN
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
