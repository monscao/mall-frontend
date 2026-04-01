import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { SectionState } from "../components/SectionState";
import { SortDropdown } from "../components/SortDropdown";
import { fetchCategories, fetchProducts } from "../lib/api";
import { createCatalogPath } from "../lib/navigation";

const sortOptions = [
  { value: "featured", label: "推荐优先" },
  { value: "sales", label: "销量优先" },
  { value: "latest", label: "最新上架" },
  { value: "priceAsc", label: "价格从低到高" },
  { value: "priceDesc", label: "价格从高到低" }
];

export function CatalogPage({ navigate, route }) {
  const selectedCategory = route.searchParams.get("category") || "";
  const selectedSort = route.searchParams.get("sort") || "featured";
  const [categories, setCategories] = useState([]);
  const [productsState, setProductsState] = useState({ loading: true, products: [], error: "" });

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
            error: error.message
          });
        }
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, selectedSort]);

  const heading = useMemo(() => {
    if (!selectedCategory) {
      return "全部商品";
    }

    const category = categories.find((item) => item.code === selectedCategory);
    return category ? category.name : "筛选结果";
  }, [categories, selectedCategory]);

  return (
    <div className="page-stack">
      <section className="panel catalog-hero">
        <div className="section-heading">
          <span>Catalog</span>
          <h2>{heading}</h2>
          <p>接入本地数据库中的分类、商品、图片与价格数据，支持分类与排序浏览。</p>
        </div>

        <div className="toolbar">
          <div className="chip-row">
            <button
              className={`filter-chip ${selectedCategory === "" ? "is-selected" : ""}`}
              type="button"
              onClick={() => navigate(createCatalogPath("", selectedSort))}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                className={`filter-chip ${selectedCategory === category.code ? "is-selected" : ""}`}
                key={category.code}
                type="button"
                onClick={() => navigate(createCatalogPath(category.code, selectedSort))}
              >
                {category.name}
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
        <SectionState title="商品加载中" body="正在读取商品列表与筛选结果。" />
      ) : null}

      {productsState.error ? <SectionState title="商品列表加载失败" body={productsState.error} /> : null}

      {!productsState.loading && !productsState.error ? (
        <section className="panel">
          <div className="product-grid">
            {productsState.products.map((product) => (
              <ProductCard key={product.slug} navigate={navigate} product={product} />
            ))}
          </div>

          {productsState.products.length === 0 ? (
            <SectionState title="当前筛选暂无商品" body="可以切换分类或排序查看其他内容。" />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
