import { useEffect, useRef, useState } from "react";
import { Pagination } from "components/Pagination";
import { ProductCard } from "components/ProductCard";
import { ProductCardSkeleton } from "components/ProductCardSkeleton";
import { SectionState } from "components/SectionState";
import { SortDropdown } from "components/SortDropdown";
import { useI18n } from "context/I18nContext";
import { fetchCategories, fetchProducts, getErrorTone, getReadableErrorMessage } from "services/api";
import { createCatalogPath } from "shared/utils/navigation";

function getCatalogLayout(width) {
  const safeWidth = width || (typeof window !== "undefined" ? window.innerWidth : 0);
  let columns = 5;

  if (safeWidth <= 640) {
    columns = 2;
  } else if (safeWidth <= 900) {
    columns = 3;
  } else if (safeWidth <= 1040) {
    columns = 4;
  }

  const pageSizeByColumns = {
    2: 10,
    3: 12,
    4: 16,
    5: 20
  };

  return {
    columns,
    pageSize: pageSizeByColumns[columns] || 12
  };
}

function getRemappedPage(page, previousPageSize, nextPageSize) {
  const safePage = Math.max(page || 1, 1);
  const safePreviousPageSize = Math.max(previousPageSize || nextPageSize || 1, 1);
  const safeNextPageSize = Math.max(nextPageSize || 1, 1);
  const startIndex = (safePage - 1) * safePreviousPageSize;

  return Math.max(Math.floor(startIndex / safeNextPageSize) + 1, 1);
}

export function CatalogPage({ navigate, route }) {
  const { resolveText, t } = useI18n();
  const selectedCategory = route.searchParams.get("category") || "";
  const selectedSort = route.searchParams.get("sort") || "featured";
  const selectedKeyword = route.searchParams.get("q") || "";
  const selectedPage = Math.max(Number(route.searchParams.get("page") || 1) || 1, 1);
  const catalogPanelRef = useRef(null);
  const previousPageSizeRef = useRef(getCatalogLayout(typeof window !== "undefined" ? window.innerWidth : 1440).pageSize);
  const [categories, setCategories] = useState([]);
  const [keywordInput, setKeywordInput] = useState(selectedKeyword);
  const [catalogLayout, setCatalogLayout] = useState(() => getCatalogLayout(typeof window !== "undefined" ? window.innerWidth : 1440));
  const [productsState, setProductsState] = useState({
    loading: true,
    products: [],
    error: "",
    page: 1,
    size: previousPageSizeRef.current,
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
    const updateCatalogLayout = () => {
      setCatalogLayout((current) => {
        const nextLayout = getCatalogLayout(typeof window !== "undefined" ? window.innerWidth : 1440);

        if (
          current.columns === nextLayout.columns &&
          current.pageSize === nextLayout.pageSize
        ) {
          return current;
        }

        return nextLayout;
      });
    };

    const handleWindowResize = () => updateCatalogLayout();

    updateCatalogLayout();
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {
    const previousPageSize = previousPageSizeRef.current;

    if (previousPageSize === catalogLayout.pageSize) {
      return;
    }

    const nextPage = getRemappedPage(selectedPage, previousPageSize, catalogLayout.pageSize);

    if (nextPage !== selectedPage) {
      navigate(
        createCatalogPath({
          categoryCode: selectedCategory,
          sort: selectedSort,
          keyword: selectedKeyword,
          page: nextPage
        })
      );
      return;
    }

    previousPageSizeRef.current = catalogLayout.pageSize;
  }, [catalogLayout.pageSize, navigate, selectedCategory, selectedKeyword, selectedPage, selectedSort]);

  useEffect(() => {
    let active = true;
    const effectivePage = getRemappedPage(selectedPage, previousPageSizeRef.current, catalogLayout.pageSize);

    if (effectivePage !== selectedPage) {
      return () => {
        active = false;
      };
    }

    setProductsState((current) => ({ ...current, loading: true, error: "" }));

    fetchProducts({
      categoryCode: selectedCategory,
      sort: selectedSort,
      q: selectedKeyword,
      page: effectivePage,
      size: catalogLayout.pageSize
    })
      .then((payload) => {
        if (active) {
          previousPageSizeRef.current = payload.size || catalogLayout.pageSize;
          setProductsState({
            loading: false,
            products: payload.items || [],
            error: "",
            page: payload.page || 1,
            size: payload.size || catalogLayout.pageSize,
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
            size: catalogLayout.pageSize,
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
  }, [catalogLayout.pageSize, selectedCategory, selectedKeyword, selectedPage, selectedSort]);

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
    <div className="page-stack catalog-page-stack">
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
        <section className="panel catalog-loading-shell" ref={catalogPanelRef}>
          <div
            className="product-grid product-grid-skeleton catalog-product-grid"
            style={{ gridTemplateColumns: `repeat(${catalogLayout.columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: catalogLayout.pageSize }, (_, index) => (
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
        <section className="panel" ref={catalogPanelRef}>
          <div
            className="product-grid catalog-product-grid"
            style={{ gridTemplateColumns: `repeat(${catalogLayout.columns}, minmax(0, 1fr))` }}
          >
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
