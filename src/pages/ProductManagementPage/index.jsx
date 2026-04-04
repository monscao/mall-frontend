import { useEffect, useMemo, useState } from "react";
import { PageSkeleton } from "components/PageSkeleton";
import { SectionState } from "components/SectionState";
import { useAuth } from "context/AuthContext";
import { useI18n } from "context/I18nContext";
import { useNotification } from "context/NotificationContext";
import { deleteAdminProduct, fetchAdminProducts, fetchCategories, getReadableErrorMessage, updateAdminProduct, updateAdminProductShelf } from "services/api";
import { SafeImage } from "components/SafeImage";

function createEditForm(product) {
  return {
    categoryCode: product.categoryCode || "",
    name: product.name || "",
    subtitle: product.subtitle || "",
    slug: product.slug || "",
    brand: product.brand || "",
    priceFrom: product.priceFrom || "",
    priceTo: product.priceTo || "",
    marketPrice: product.marketPrice || "",
    stockStatus: product.stockStatus || "IN_STOCK",
    featured: Boolean(product.featured),
    onShelf: Boolean(product.onShelf)
  };
}

export function ProductManagementPage({ navigate }) {
  const { hasPermission, isAdmin, session } = useAuth();
  const { t } = useI18n();
  const { pushNotification } = useNotification();
  const [categories, setCategories] = useState([]);
  const [productsState, setProductsState] = useState({ loading: true, products: [], error: null });
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const canPublish = hasPermission("PRODUCT:PUBLISH");

  const token = session?.token;
  const fallbackErrorMessage = () => t("error.network.body");

  useEffect(() => {
    if (!isAdmin || !token) {
      return;
    }

    let active = true;
    Promise.all([fetchCategories(), fetchAdminProducts(token)])
      .then(([nextCategories, products]) => {
        if (!active) {
          return;
        }
        setCategories(nextCategories);
        setProductsState({ loading: false, products, error: null });
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setProductsState({ loading: false, products: [], error });
      });

    return () => {
      active = false;
    };
  }, [isAdmin, token]);

  const categoryOptions = useMemo(() => categories.map((category) => ({ value: category.code, label: category.name })), [categories]);

  if (!isAdmin) {
    return (
      <SectionState
        title={t("admin.access.title")}
        body={t("admin.access.body")}
      />
    );
  }

  if (productsState.loading) {
    return <PageSkeleton />;
  }

  if (productsState.error) {
    return (
      <SectionState
        title={t("admin.management.error.title")}
        body={getReadableErrorMessage(productsState.error, fallbackErrorMessage)}
        tone="error"
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
      <section className="management-head">
        <button className="primary-button" type="button" onClick={() => navigate("/admin/products/new")}>
          {t("admin.management.new")}
        </button>
      </section>

      <section className="panel management-table-shell">
        <div className="management-table">
          <div className="management-table-head">
            <span>{t("admin.management.table.product")}</span>
            <span>{t("admin.management.table.category")}</span>
            <span>{t("admin.management.table.price")}</span>
            <span>{t("admin.management.table.status")}</span>
            <span>{t("admin.management.table.actions")}</span>
          </div>

          {productsState.products.map((product) => {
            const isEditing = editingId === product.id;
            const activeForm = isEditing ? form : createEditForm(product);

            return (
              <article className="management-row" key={product.id}>
                <div className="management-product-cell" data-label={t("admin.management.table.product")}>
                  <SafeImage alt={product.name} src={product.coverImage} />
                  <div>
                    <strong>{product.name}</strong>
                    <p>{product.slug}</p>
                  </div>
                </div>

                <div className="management-form-field" data-label={t("admin.management.table.category")}>
                  {isEditing ? (
                    <select value={activeForm.categoryCode} onChange={(event) => setForm((current) => ({ ...current, categoryCode: event.target.value }))}>
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>{product.categoryName}</span>
                  )}
                </div>

                <div className="management-form-field" data-label={t("admin.management.table.price")}>
                  {isEditing ? (
                    <div className="management-price-grid">
                      <input value={activeForm.priceFrom} onChange={(event) => setForm((current) => ({ ...current, priceFrom: event.target.value }))} />
                      <input value={activeForm.marketPrice} onChange={(event) => setForm((current) => ({ ...current, marketPrice: event.target.value }))} />
                    </div>
                  ) : (
                    <span>{activeForm.priceFrom} / {activeForm.marketPrice}</span>
                  )}
                </div>

                <div className="management-form-field" data-label={t("admin.management.table.status")}>
                  {isEditing ? (
                    <div className="management-toggle-grid">
                      <label><input checked={activeForm.featured} type="checkbox" onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} /> {t("admin.management.featured")}</label>
                      <label><input checked={activeForm.onShelf} disabled={!canPublish} type="checkbox" onChange={(event) => setForm((current) => ({ ...current, onShelf: event.target.checked }))} /> {t("admin.management.onShelf")}</label>
                    </div>
                  ) : (
                    <span>{product.onShelf ? t("admin.management.live") : t("admin.management.hidden")}</span>
                  )}
                </div>

                <div className="management-actions" data-label={t("admin.management.table.actions")}>
                  {isEditing ? (
                    <>
                      <button
                        className="primary-button button-small"
                        type="button"
                        disabled={savingId === product.id}
                        onClick={async () => {
                          setSavingId(product.id);
                          try {
                            const updated = await updateAdminProduct(product.id, activeForm, token);
                            const finalProduct =
                              canPublish && updated.onShelf !== activeForm.onShelf
                                ? await updateAdminProductShelf(product.id, activeForm.onShelf, token)
                                : updated;
                            setProductsState((current) => ({
                              ...current,
                              products: current.products.map((item) => (item.id === product.id ? finalProduct : item))
                            }));
                            setEditingId(null);
                            setForm(null);
                            pushNotification({
                              tone: "success",
                              title: t("admin.management.updated.title"),
                              message: t("admin.management.updated.body")
                            });
                          } catch (error) {
                            pushNotification({
                              tone: "error",
                              title: t("admin.management.updateFailed"),
                              message: getReadableErrorMessage(error, fallbackErrorMessage)
                            });
                          } finally {
                            setSavingId(null);
                          }
                        }}
                      >
                        {t("admin.management.save")}
                      </button>
                      <button className="secondary-button button-small" type="button" onClick={() => {
                        setEditingId(null);
                        setForm(null);
                      }}>
                        {t("admin.management.cancel")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="secondary-button button-small"
                        type="button"
                        onClick={() => {
                          setEditingId(product.id);
                          setForm(createEditForm(product));
                        }}
                      >
                        {t("admin.management.edit")}
                      </button>
                      {canPublish ? (
                        <button
                          className="secondary-button button-small"
                          type="button"
                          onClick={async () => {
                            try {
                              const updated = await updateAdminProductShelf(product.id, !product.onShelf, token);
                              setProductsState((current) => ({
                                ...current,
                                products: current.products.map((item) => (item.id === product.id ? updated : item))
                              }));
                              pushNotification({
                                tone: "success",
                                title: t("admin.management.updated.title"),
                                message: t("admin.management.updated.body")
                              });
                            } catch (error) {
                              pushNotification({
                                tone: "error",
                                title: t("admin.management.updateFailed"),
                                message: getReadableErrorMessage(error, fallbackErrorMessage)
                              });
                            }
                          }}
                        >
                          {product.onShelf ? t("admin.management.takeDown") : t("admin.management.publish")}
                        </button>
                      ) : null}
                      <button
                        className="text-button management-delete"
                        disabled={deletingId === product.id}
                        type="button"
                        onClick={async () => {
                          setDeletingId(product.id);
                          try {
                            await deleteAdminProduct(product.id, token);
                            setProductsState((current) => ({
                              ...current,
                              products: current.products.filter((item) => item.id !== product.id)
                            }));
                            pushNotification({
                              tone: "success",
                              title: t("admin.management.deleted.title"),
                              message: t("admin.management.deleted.body")
                            });
                          } catch (error) {
                            pushNotification({
                              tone: "error",
                              title: t("admin.management.deleteFailed"),
                              message: getReadableErrorMessage(error, fallbackErrorMessage)
                            });
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                      >
                        {t("admin.management.delete")}
                      </button>
                    </>
                  )}
                </div>

                {isEditing ? (
                  <div className="management-row-editor">
                    <input value={activeForm.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                    <input value={activeForm.subtitle} onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))} />
                    <input value={activeForm.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))} />
                    <input value={activeForm.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
                    <select value={activeForm.stockStatus} onChange={(event) => setForm((current) => ({ ...current, stockStatus: event.target.value }))}>
                      <option value="IN_STOCK">{t("admin.management.stock.in")}</option>
                      <option value="LOW_STOCK">{t("admin.management.stock.low")}</option>
                      <option value="OUT_OF_STOCK">{t("admin.management.stock.out")}</option>
                    </select>
                    <input value={activeForm.priceTo} onChange={(event) => setForm((current) => ({ ...current, priceTo: event.target.value }))} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
