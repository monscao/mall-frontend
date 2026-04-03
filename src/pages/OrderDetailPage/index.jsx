import { useEffect, useState } from "react";
import { SectionState } from "components/SectionState";
import { useAuth } from "context/AuthContext";
import { useI18n } from "context/I18nContext";
import { cancelOrder, fetchAdminOrderDetail, fetchOrderDetail, getErrorTone, getReadableErrorMessage, updateOrderStatus } from "services/api";
import { formatCurrency } from "shared/utils/format";
import { SafeImage } from "components/SafeImage";

export function OrderDetailPage({ navigate, orderId }) {
  const { hasPermission, isAuthenticated, session } = useAuth();
  const { locale, t } = useI18n();
  const [state, setState] = useState({
    loading: true,
    order: null,
    error: ""
  });

  useEffect(() => {
    if (!isAuthenticated || !session?.token) {
      setState({ loading: false, order: null, error: "" });
      return;
    }

    let active = true;
    const request = hasPermission("ORDER:MANAGE")
      ? fetchAdminOrderDetail(orderId, session.token)
      : fetchOrderDetail(orderId, session.token);

    request
      .then((order) => {
        if (active) {
          setState({ loading: false, order, error: "" });
        }
      })
      .catch((error) => {
        if (active) {
          setState({ loading: false, order: null, error });
        }
      });

    return () => {
      active = false;
    };
  }, [hasPermission, isAuthenticated, orderId, session]);

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

  if (state.loading) {
    return <SectionState title={t("order.detail.eyebrow")} body={t("product.loading.body")} tone="loading" />;
  }

  if (state.error || !state.order) {
    return (
      <SectionState
        title={t("order.detail.eyebrow")}
        body={state.error ? getReadableErrorMessage(state.error, t) : t("order.detail.notfound")}
        tone={state.error ? getErrorTone(state.error) : "info"}
        action={
          <button className="primary-button" type="button" onClick={() => navigate("/orders")}>
            {t("nav.orders")}
          </button>
        }
      />
    );
  }

  const order = state.order;

  return (
    <div className="page-stack">
      <section className="panel section-heading">
        <span>{t("order.detail.eyebrow")}</span>
        <h2>{order.orderNo}</h2>
        <p>{t(`orders.status.${order.status}`) || order.status}</p>
        <div className="management-actions">
          {order.customerActionable && !hasPermission("ORDER:MANAGE") ? (
            <button
              className="text-button"
              type="button"
              onClick={async () => {
                try {
                  const updated = await cancelOrder(order.id, session.token);
                  setState((current) => ({ ...current, order: updated }));
                } catch (error) {
                  setState((current) => ({ ...current, error }));
                }
              }}
            >
              {t("orders.cancel")}
            </button>
          ) : null}
          {hasPermission("ORDER:MANAGE")
            ? ["PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"].map((status) => (
                <button
                  className="text-button"
                  key={status}
                  type="button"
                  disabled={order.status === status}
                  onClick={async () => {
                    try {
                      const updated = await updateOrderStatus(order.id, status, session.token);
                      setState((current) => ({ ...current, order: updated }));
                    } catch (error) {
                      setState((current) => ({ ...current, error }));
                    }
                  }}
                >
                  {t(`orders.status.${status}`) || status}
                </button>
              ))
            : null}
        </div>
      </section>

      <section className="order-detail-layout">
        <div className="panel order-detail-main">
          <div className="section-heading-row">
            <h3>{t("order.detail.items")}</h3>
            <button className="text-button" type="button" onClick={() => navigate("/orders")}>
              {t("nav.orders")}
            </button>
          </div>
          <div className="order-item-list">
            {order.items.map((item) => (
              <article className="order-line-item" key={item.id}>
                <SafeImage alt={item.productName} src={item.coverImage} />
                <div>
                  <strong>{item.productName}</strong>
                  <p>{item.skuName}</p>
                  {item.productSlug ? (
                    <button className="text-button align-start" type="button" onClick={() => navigate(`/product/${item.productSlug}`)}>
                      {t("product.viewDetails")}
                    </button>
                  ) : null}
                </div>
                <div className="order-line-item-side">
                  <span>x{item.quantity}</span>
                  <strong>{formatCurrency(item.lineTotal, locale)}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="panel order-detail-side">
          <div className="detail-column">
            <h3>{t("order.detail.contact")}</h3>
            <ul className="detail-list order-detail-list">
              <li>{order.contactName}</li>
              <li>{order.contactPhone}</li>
              <li>{order.shippingAddress}</li>
              {order.note ? <li>{order.note}</li> : null}
            </ul>
          </div>

          <div className="detail-column">
            <h3>{t("order.detail.summary")}</h3>
            <div className="summary-line">
              <span>{t("cart.subtotal")}</span>
              <strong>{formatCurrency(order.subtotal, locale)}</strong>
            </div>
            <div className="summary-line">
              <span>{t("cart.shipping")}</span>
              <strong>{formatCurrency(order.shippingFee, locale)}</strong>
            </div>
            <div className="summary-line total-line">
              <span>{t("cart.total")}</span>
              <strong>{formatCurrency(order.totalAmount, locale)}</strong>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
