import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "components/ProductCard";
import { SectionState } from "components/SectionState";
import { SortDropdown } from "components/SortDropdown";
import { useI18n } from "context/I18nContext";
import { fetchCategories, fetchProducts, getErrorTone, getReadableErrorMessage } from "services/api";
import { createCatalogPath } from "shared/utils/navigation";

export function CatalogPage({ navigate, route }) {
  const { resolveText, t } = useI18n();
  const selectedCategory = route.searchParams.get("category") || "";
  const selectedSort = route.searchParams.get("sort") || "featured";
  const [categories, setCategories] = useState([]);
  const [productsState, setProductsState] = useState({ loading: true, products: [], error: "" });
  const sortOptions = [
    { value: "featured", label: t("sort.featured") },
    { value: "sales", label: t("sort.sales") },
    { value: "latest", label: t("sort.latest") },
    { value: "priceAsc", label: t("sort.priceAsc") },
    { value: "priceDesc", label: t("sort.priceDesc") }
  ];

  useEffect(() => {
    let active = true;

    fetchCategories()
      .then((data) => {
        if (active) {
          setCategories(data);
        }
      })
      .catch(() => {
        if (active) {
          setCategories([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    setProductsState((current) => ({ ...current, loading: true, error: "" }));

    fetchProducts({
      categoryCode: selectedCategory,
      sort: selectedSort
    })
      .then((products) => {
        if (active) {
          setProductsState({
            loading: false,
            products,
            error: ""
          });
        }
      })
      .catch((error) => {
        if (active) {
          setProductsState({
            loading: false,
            products: [],
            error
          });
        }
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, selectedSort]);

  const heading = useMemo(() => {
    if (!selectedCategory) {
      return t("catalog.all");
    }

    const category = categories.find((item) => item.code === selectedCategory);
    return category ? resolveText(category.name) : t("catalog.result");
  }, [categories, resolveText, selectedCategory, t]);

  return (
    <div className="page-stack">
      <section className="catalog-page-toolbar-shell">
        <div className="catalog-page-toolbar">
          <div className="chip-row">
            <button
              className={`filter-chip ${selectedCategory === "" ? "is-selected" : ""}`}
              type="button"
              onClick={() => navigate(createCatalogPath("", selectedSort))}
            >
              {t("catalog.all")}
            </button>
            {categories.map((category) => (
              <button
                className={`filter-chip ${selectedCategory === category.code ? "is-selected" : ""}`}
                key={category.code}
                type="button"
                onClick={() => navigate(createCatalogPath(category.code, selectedSort))}
              >
                {resolveText(category.name)}
              </button>
            ))}
          </div>

          <SortDropdown
            onChange={(nextSort) => navigate(createCatalogPath(selectedCategory, nextSort))}
            options={sortOptions}
            value={selectedSort}
          />
        </div>
      </section>

      {productsState.loading ? (
        <SectionState title={t("catalog.loading.title")} body={t("catalog.loading.body")} tone="loading" />
      ) : null}

      {productsState.error ? (
        <SectionState
          title={t("catalog.error.title")}
          body={getReadableErrorMessage(productsState.error, t)}
          tone={getErrorTone(productsState.error)}
          action={
            <button className="primary-button" type="button" onClick={() => window.location.reload()}>
              {t("common.retry")}
            </button>
          }
        />
      ) : null}

      {!productsState.loading && !productsState.error ? (
        <section className="panel">
          <div className="product-grid">
            {productsState.products.map((product) => (
              <ProductCard key={product.slug} navigate={navigate} product={product} />
            ))}
          </div>

          {productsState.products.length === 0 ? (
            <SectionState title={t("catalog.empty.title")} body={t("catalog.empty.body")} />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
