import { useEffect, useState } from "react";
import { useCart } from "context/CartContext";
import { useI18n } from "context/I18nContext";
import { IconArrowUp, IconCart } from "components/Icons";

export function FloatingActions({ navigate }) {
  const { totalItems } = useCart();
  const { t } = useI18n();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 280);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="floating-actions">
      {showTop ? (
        <button
          aria-label={t("floating.backToTop")}
          className="floating-mini-button"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <IconArrowUp className="button-icon-svg" />
        </button>
      ) : null}

      <button
        aria-label={t("floating.cart")}
        className="floating-cart-button"
        type="button"
        onClick={() => navigate("/cart")}
      >
        <IconCart className="button-icon-svg" />
        <span>{totalItems}</span>
      </button>
    </div>
  );
}
