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
  const selectedKeyword = route.searchParams.get("q") || "";
  const selectedPage = Math.max(Number(route.searchParams.get("page") || 1) || 1, 1);
  const [categories, setCategories] = useState([]);
  const [keywordInput, setKeywordInput] = useState(selectedKeyword);
  const [productsState, setProductsState] = useState({
    loading: true,
    products: [],
    error: "",
    page: 1,
    size: 12,
    total: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
    keyword: ""
  });
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
    setKeywordInput(selectedKeyword);
  }, [selectedKeyword]);

  useEffect(() => {
    let active = true;

    setProductsState((current) => ({ ...current, loading: true, error: "" }));

    fetchProducts({
      categoryCode: selectedCategory,
      sort: selectedSort,
      q: selectedKeyword,
      page: selectedPage,
      size: 12
    })
      .then((payload) => {
        if (active) {
          setProductsState({
            loading: false,
            products: payload.items || [],
            error: "",
            page: payload.page || 1,
            size: payload.size || 12,
            total: payload.total || 0,
            totalPages: payload.totalPages || 0,
            hasPrevious: Boolean(payload.hasPrevious),
            hasNext: Boolean(payload.hasNext),
            keyword: payload.keyword || ""
          });
        }
      })
      .catch((error) => {
        if (active) {
          setProductsState({
            loading: false,
            products: [],
            error,
            page: 1,
            size: 12,
            total: 0,
            totalPages: 0,
            hasPrevious: false,
            hasNext: false,
            keyword: ""
          });
        }
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, selectedKeyword, selectedPage, selectedSort]);

  const heading = useMemo(() => {
    if (!selectedCategory) {
      return t("catalog.all");
    }

    const category = categories.find((item) => item.code === selectedCategory);
    return category ? resolveText(category.name) : t("catalog.result");
  }, [categories, resolveText, selectedCategory, t]);

  const resultSummary = useMemo(() => {
    if (productsState.total === 0) {
      return selectedKeyword ? t("catalog.results.noneWithKeyword") : t("catalog.results.none");
    }

    return t("catalog.results.summary")
      .replace("{{count}}", String(productsState.total))
      .replace("{{page}}", String(productsState.page))
      .replace("{{totalPages}}", String(Math.max(productsState.totalPages, 1)));
  }, [productsState.page, productsState.total, productsState.totalPages, selectedKeyword, t]);

  const navigateCatalog = (nextOverrides = {}) => {
    navigate(
      createCatalogPath({
        categoryCode: nextOverrides.categoryCode ?? selectedCategory,
        sort: nextOverrides.sort ?? selectedSort,
        keyword: nextOverrides.keyword ?? selectedKeyword,
        page: nextOverrides.page ?? selectedPage
      })
    );
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigateCatalog({
      keyword: keywordInput.trim(),
      page: 1
    });
  };

  return (
    <div className="page-stack">
      <section className="catalog-page-toolbar-shell">
        <div className="catalog-page-toolbar">
          <div className="catalog-toolbar-main">
            <form className="catalog-search-form" onSubmit={handleSearchSubmit}>
              <input
                className="catalog-search-input"
                type="search"
                value={keywordInput}
                placeholder={t("catalog.search.placeholder")}
                onChange={(event) => setKeywordInput(event.target.value)}
              />
              <button className="primary-button catalog-search-button" type="submit">
                {t("catalog.search.submit")}
              </button>
            </form>

            <div className="chip-row">
              <button
                className={`filter-chip ${selectedCategory === "" ? "is-selected" : ""}`}
                type="button"
                onClick={() => navigateCatalog({ categoryCode: "", page: 1 })}
              >
                {t("catalog.all")}
              </button>
              {categories.map((category) => (
                <button
                  className={`filter-chip ${selectedCategory === category.code ? "is-selected" : ""}`}
                  key={category.code}
                  type="button"
                  onClick={() => navigateCatalog({ categoryCode: category.code, page: 1 })}
                >
                  {resolveText(category.name)}
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-toolbar-side">
            <div className="catalog-results-meta">
              <strong>{heading}</strong>
              <span>{resultSummary}</span>
            </div>

            <SortDropdown
              onChange={(nextSort) => navigateCatalog({ sort: nextSort, page: 1 })}
              options={sortOptions}
              value={selectedSort}
            />
          </div>
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

          {productsState.products.length > 0 && productsState.totalPages > 1 ? (
            <div className="catalog-pagination">
              <button
                className="secondary-button"
                type="button"
                disabled={!productsState.hasPrevious}
                onClick={() => navigateCatalog({ page: productsState.page - 1 })}
              >
                {t("catalog.pagination.previous")}
              </button>
              <div className="catalog-pagination-summary">
                {t("catalog.pagination.summary")
                  .replace("{{page}}", String(productsState.page))
                  .replace("{{totalPages}}", String(productsState.totalPages))}
              </div>
              <button
                className="secondary-button"
                type="button"
                disabled={!productsState.hasNext}
                onClick={() => navigateCatalog({ page: productsState.page + 1 })}
              >
                {t("catalog.pagination.next")}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
