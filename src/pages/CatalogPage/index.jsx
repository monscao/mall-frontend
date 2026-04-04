import { useEffect, useMemo, useState } from "react";
import { Pagination } from "components/Pagination";
import { ProductCard } from "components/ProductCard";
import { ProductCardSkeleton } from "components/ProductCardSkeleton";
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
          <div className="catalog-filter-row">
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

          <div className="catalog-toolbar-search">
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
            <SortDropdown
              onChange={(nextSort) => navigateCatalog({ sort: nextSort, page: 1 })}
              options={sortOptions}
              value={selectedSort}
            />
          </div>
        </div>
      </section>

      {productsState.loading ? (
        <section className="panel catalog-loading-shell">
          <div className="product-grid product-grid-skeleton">
            {Array.from({ length: 10 }, (_, index) => (
              <ProductCardSkeleton key={`catalog-skeleton-${index}`} />
            ))}
          </div>
        </section>
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
            <SectionState
              title={t("catalog.empty.title")}
              body={
                selectedKeyword
                  ? t("catalog.empty.body")
                  : selectedCategory
                    ? t("catalog.empty.categoryBody")
                    : t("catalog.empty.storeBody")
              }
            />
          ) : null}

          {productsState.products.length > 0 ? (
            <div className="catalog-results-footer">
              <Pagination
                currentPage={productsState.page}
                totalItems={productsState.total}
                totalPages={productsState.totalPages}
                t={t}
                onPageChange={(page) => navigateCatalog({ page })}
              />
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
