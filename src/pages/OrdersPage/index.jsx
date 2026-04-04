import { EmptyState } from "components/EmptyState";
import { useEffect, useState } from "react";
import { PageSkeleton } from "components/PageSkeleton";
import { SectionState } from "components/SectionState";
import { useAuth } from "context/AuthContext";
import { useI18n } from "context/I18nContext";
import { cancelOrder, fetchAdminOrders, fetchOrders, getErrorTone, getReadableErrorMessage, updateOrderStatus } from "services/api";
import { formatCurrency } from "shared/utils/format";

export function OrdersPage({ navigate }) {
  const { hasPermission, isAdmin, isAuthenticated, session } = useAuth();
  const { locale, t } = useI18n();
  const [state, setState] = useState({
    loading: true,
    orders: [],
    error: ""
  });

  useEffect(() => {
    if (!isAuthenticated || !session?.token) {
      setState({ loading: false, orders: [], error: "" });
      return;
    }

    let active = true;
    const request = hasPermission("ORDER:MANAGE") || isAdmin ? fetchAdminOrders(session.token) : fetchOrders(session.token);
    request
      .then((orders) => {
        if (active) {
          setState({ loading: false, orders, error: "" });
        }
      })
      .catch((error) => {
        if (active) {
          setState({ loading: false, orders: [], error });
        }
      });

    return () => {
      active = false;
    };
  }, [hasPermission, isAdmin, isAuthenticated, session]);

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
    return <PageSkeleton />;
  }

  if (state.error) {
    return (
      <SectionState
        title={t("orders.heading")}
        body={getReadableErrorMessage(state.error, t)}
        tone={getErrorTone(state.error)}
        action={
          <button className="primary-button" type="button" onClick={() => window.location.reload()}>
            {t("common.retry")}
          </button>
        }
      />
    );
  }

  return (
    <div className="page-stack">
      {state.orders.length === 0 ? (
        <section className="orders-empty-shell">
          <EmptyState
            className="empty-state-compact"
            framed={false}
            title={t("orders.empty.title")}
            body={t("orders.empty.body")}
            action={
              <button className="primary-button" type="button" onClick={() => navigate("/catalog")}>
                {t("orders.empty.cta")}
              </button>
            }
          />
        </section>
      ) : (
        <section className="orders-list">
          {state.orders.map((order) => (
            <article className="panel order-card" key={order.id}>
              <div className="order-card-head">
                <div>
                  <span className="eyebrow">{order.orderNo}</span>
                  <h3>{t(`orders.status.${order.status}`) || order.status}</h3>
                </div>
                <button className="secondary-button" type="button" onClick={() => navigate(`/orders/${order.id}`)}>
                  {t("orders.detail")}
                </button>
              </div>
              <div className="order-meta-grid">
                <div>
                  <span>{t("checkout.payment")}</span>
                  <strong>{t(`orders.payment.${order.paymentMethod}`) || order.paymentMethod}</strong>
                </div>
                <div>
                  <span>{t("cart.quantity")}</span>
                  <strong>{order.totalQuantity}</strong>
                </div>
                <div>
                  <span>{t("cart.total")}</span>
                  <strong>{formatCurrency(order.totalAmount, locale)}</strong>
                </div>
                <div>
                  <span>{t("sort.latest")}</span>
                  <strong>{order.createdAt}</strong>
                </div>
              </div>
              <div className="management-actions">
                {order.customerActionable && !hasPermission("ORDER:MANAGE") ? (
                  <button
                    className="text-button"
                    type="button"
                    onClick={async () => {
                      try {
                        const updated = await cancelOrder(order.id, session.token);
                        setState((current) => ({
                          ...current,
                          orders: current.orders.map((item) =>
                            item.id === order.id
                              ? { ...item, status: updated.status, customerActionable: updated.customerActionable }
                              : item
                          )
                        }));
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
                        key={`${order.id}-${status}`}
                        type="button"
                        disabled={order.status === status}
                        onClick={async () => {
                          try {
                            const updated = await updateOrderStatus(order.id, status, session.token);
                            setState((current) => ({
                              ...current,
                              orders: current.orders.map((item) =>
                                item.id === order.id
                                  ? { ...item, status: updated.status, customerActionable: updated.customerActionable }
                                  : item
                              )
                            }));
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
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
