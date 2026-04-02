import { useState } from "react";
import { SectionState } from "components/SectionState";
import { useAuth } from "context/AuthContext";
import { useCart } from "context/CartContext";
import { useI18n } from "context/I18nContext";
import { useNotification } from "context/NotificationContext";
import { createOrder, getReadableErrorMessage } from "services/api";
import { formatCurrency } from "shared/utils/format";

export function CheckoutPage({ navigate }) {
  const { items, subtotal, clearCart } = useCart();
  const { isAuthenticated, session } = useAuth();
  const { locale, t } = useI18n();
  const { pushNotification } = useNotification();
  const [placed, setPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState("card");
  const shipping = items.length > 0 ? 18 : 0;
  const total = subtotal + shipping;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: ""
  });

  if (placed) {
    return (
      <section className="panel checkout-success">
        <span className="eyebrow">{t("checkout.eyebrow")}</span>
        <h1>{t("checkout.success.title")}</h1>
        <p>{t("checkout.success.body")}</p>
        <button className="primary-button" type="button" onClick={() => navigate("/")}>
          {t("checkout.success.cta")}
        </button>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <SectionState
        title={t("checkout.empty.title")}
        body={t("checkout.empty.body")}
        action={
          <button className="primary-button" type="button" onClick={() => navigate("/catalog")}>
            {t("cart.empty.cta")}
          </button>
        }
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <SectionState
        title={t("checkout.auth.title")}
        body={t("checkout.auth.body")}
        action={
          <button className="primary-button" type="button" onClick={() => navigate("/login")}>
            {t("checkout.auth.cta")}
          </button>
        }
      />
    );
  }

  return (
    <div className="page-stack">
      <section className="panel section-heading">
        <span>{t("checkout.eyebrow")}</span>
        <h2>{t("checkout.heading")}</h2>
        <p>{t("checkout.subtitle")}</p>
      </section>

      <section className="checkout-layout">
        <form
          className="panel checkout-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setError("");
            try {
              const order = await createOrder(
                {
                  contactName: form.name,
                  contactPhone: form.phone,
                  shippingAddress: form.address,
                  note: form.note,
                  paymentMethod: payment,
                  shippingFee: String(shipping),
                  items: items.map((item) => ({
                    productSlug: item.productSlug,
                    skuCode: item.skuCode,
                    productName: item.productName,
                    skuName: item.skuName,
                    coverImage: item.coverImage,
                    salePrice: String(item.salePrice),
                    quantity: item.quantity
                  }))
                },
                session.token
              );
              clearCart();
              pushNotification({
                tone: "success",
                title: t("checkout.success.title"),
                message: `${t("checkout.success.body")} · ${order.orderNo}`
              });
              setPlaced(true);
            } catch (submitError) {
              const message = getReadableErrorMessage(submitError, t);
              setError(message);
              pushNotification({
                tone: "error",
                title: t("checkout.heading"),
                message
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="checkout-section">
            <h3>{t("checkout.contact")}</h3>
            <div className="checkout-contact-grid">
              <label>
                <span>{t("checkout.name")}</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label>
                <span>{t("checkout.phone")}</span>
                <input
                  required
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </label>
            </div>
            <label>
              <span>{t("checkout.address")}</span>
              <textarea
                required
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              />
            </label>
            <label>
              <span>{t("checkout.note")}</span>
              <textarea
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              />
            </label>
          </div>

          <div className="checkout-section">
            <h3>{t("checkout.payment")}</h3>
            <div className="payment-row">
              {["card", "wallet", "cod"].map((method) => (
                <button
                  className={`payment-option ${payment === method ? "is-selected" : ""}`}
                  key={method}
                  type="button"
                  onClick={() => setPayment(method)}
                >
                  {t(`checkout.payment.${method}`)}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? t("auth.submitting") : t("checkout.placeOrder")}
          </button>
        </form>

        <aside className="panel checkout-summary">
          <h3>{t("checkout.summary")}</h3>
          {items.map((item) => (
            <div className="checkout-line" key={item.skuCode}>
              <div>
                <strong>{item.productName}</strong>
                <p>{item.skuName}</p>
              </div>
              <span>{formatCurrency(Number(item.salePrice) * item.quantity, locale)}</span>
            </div>
          ))}
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
          <p className="checkout-note">{t("checkout.freeShippingNote")}</p>
        </aside>
      </section>
    </div>
  );
}
