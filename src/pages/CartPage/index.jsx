import { useCart } from "context/CartContext";
import { useAuth } from "context/AuthContext";
import { useI18n } from "context/I18nContext";
import { useNotification } from "context/NotificationContext";
import { formatCurrency } from "shared/utils/format";
import { SafeImage } from "components/SafeImage";

export function CartPage({ navigate }) {
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { locale, t } = useI18n();
  const { pushNotification } = useNotification();
  const shipping = items.length > 0 ? 18 : 0;
  const total = subtotal + shipping;

  return (
    <div className="page-stack">
      <section className="panel section-heading-row">
        <div className="section-heading">
          <span>{t("cart.eyebrow")}</span>
          <h2>{t("cart.heading")}</h2>
          <p>{t("cart.subtitle")}</p>
        </div>
        {items.length > 0 ? (
          <button
            className="text-button"
            type="button"
            onClick={() => {
              clearCart();
              pushNotification({
                tone: "success",
                title: t("cart.cleared.title"),
                message: t("cart.cleared.body")
              });
            }}
          >
            {t("cart.clear")}
          </button>
        ) : null}
      </section>

      {items.length === 0 ? (
        <section className="panel empty-cart">
          <h3>{t("cart.empty.title")}</h3>
          <p>{t("cart.empty.body")}</p>
          <button className="primary-button" type="button" onClick={() => navigate("/catalog")}>
            {t("cart.empty.cta")}
          </button>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="panel cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.skuCode}>
                <SafeImage alt={item.productName} src={item.coverImage} />
                <div className="cart-item-copy">
                  <h3>{item.productName}</h3>
                  <p>{item.skuName}</p>
                  <button className="text-button align-start" type="button" onClick={() => navigate(`/product/${item.productSlug}`)}>
                    {t("cart.backDetail")}
                  </button>
                </div>
                <div className="cart-item-controls">
                  <label className="qty-control">
                    <span>{t("cart.quantity")}</span>
                    <input
                      min="1"
                      type="number"
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.skuCode, Number(event.target.value))}
                    />
                  </label>
                  <strong>{formatCurrency(Number(item.salePrice) * item.quantity, locale)}</strong>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => {
                      removeItem(item.skuCode);
                      pushNotification({
                        tone: "info",
                        title: t("cart.removed.title"),
                        message: `${item.productName} · ${item.skuName}`
                      });
                    }}
                  >
                    {t("cart.remove")}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="panel order-summary">
            <h3>{t("cart.summary")}</h3>
            <div className="summary-line">
              <span>{t("cart.subtotal")}</span>
              <strong>{formatCurrency(subtotal, locale)}</strong>
            </div>
            <div className="summary-line">
              <span>{t("cart.shipping")}</span>
              <strong>{formatCurrency(shipping, locale)}</strong>
            </div>
            <div className="summary-line total-line">
              <span>{t("cart.total")}</span>
              <strong>{formatCurrency(total, locale)}</strong>
            </div>
            {isAuthenticated ? (
              <button className="primary-button" type="button" onClick={() => navigate("/checkout")}>
                {t("cart.checkout")}
              </button>
            ) : (
              <>
                <p className="checkout-note">{t("cart.loginRequired")}</p>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => {
                    pushNotification({
                      tone: "info",
                      title: t("checkout.auth.title"),
                      message: t("checkout.auth.body")
                    });
                    navigate("/login");
                  }}
                >
                  {t("cart.loginToCheckout")}
                </button>
              </>
            )}
          </aside>
        </section>
      )}
    </div>
  );
}
