import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { fetchProductDetail } from "../lib/api";
import { formatCurrency, stockLabel } from "../lib/format";
import { SectionState } from "../components/SectionState";

export function ProductPage({ navigate, slug }) {
  const { addItem } = useCart();
  const [state, setState] = useState({
    loading: true,
    product: null,
    error: "",
    selectedSkuCode: ""
  });

  useEffect(() => {
    let active = true;

    setState({
      loading: true,
      product: null,
      error: "",
      selectedSkuCode: ""
    });

    fetchProductDetail(slug)
      .then((product) => {
        if (active) {
          const defaultSku = (product.skus || []).find((sku) => sku.isDefault) || product.skus?.[0];
          setState({
            loading: false,
            product,
            error: "",
            selectedSkuCode: defaultSku?.skuCode || ""
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            product: null,
            error: error.message,
            selectedSkuCode: ""
          });
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const selectedSku = useMemo(() => {
    return state.product?.skus?.find((sku) => sku.skuCode === state.selectedSkuCode) || state.product?.skus?.[0];
  }, [state.product, state.selectedSkuCode]);

  if (state.loading) {
    return <SectionState title="商品详情加载中" body="正在读取商品详情和 SKU 列表。" />;
  }

  if (state.error) {
    return (
      <SectionState
        title="商品详情不可用"
        body={state.error}
        action={
          <button className="primary-button" type="button" onClick={() => navigate("/catalog")}>
            返回商品列表
          </button>
        }
      />
    );
  }

  const product = state.product;

  return (
    <div className="page-stack">
      <section className="panel product-detail-panel">
        <div className="product-gallery">
          <img alt={product.name} src={selectedSku?.coverImage || product.coverImage} />
        </div>

        <div className="product-summary">
          <span className="eyebrow">{product.categoryName}</span>
          <h1>{product.name}</h1>
          <p className="detail-subtitle">{product.subtitle}</p>

          <div className="detail-meta">
            <span>{product.brand}</span>
            <span>{product.rating}</span>
            <span>{stockLabel(product.stockStatus)}</span>
            <span>销量 {product.salesCount}</span>
          </div>

          <div className="price-block">
            <strong>{formatCurrency(selectedSku?.salePrice || product.priceFrom)}</strong>
            {selectedSku?.marketPrice || product.marketPrice ? (
              <span>{formatCurrency(selectedSku?.marketPrice || product.marketPrice)}</span>
            ) : null}
          </div>

          <div className="sku-list">
            {(product.skus || []).map((sku) => (
              <button
                className={`sku-card ${selectedSku?.skuCode === sku.skuCode ? "is-selected" : ""}`}
                key={sku.skuCode}
                type="button"
                onClick={() => setState((current) => ({ ...current, selectedSkuCode: sku.skuCode }))}
              >
                <strong>{sku.name}</strong>
                <span>{sku.specSummary}</span>
                <span>{formatCurrency(sku.salePrice)}</span>
              </button>
            ))}
          </div>

          <div className="tag-row">
            {(product.tags || []).map((tag) => (
              <span className="tag-pill muted" key={tag}>
                {tag}
              </span>
            ))}
          </div>

          <div className="detail-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                if (!selectedSku) {
                  return;
                }

                addItem({
                  skuCode: selectedSku.skuCode,
                  productSlug: product.slug,
                  productName: product.name,
                  skuName: selectedSku.name,
                  salePrice: selectedSku.salePrice,
                  marketPrice: selectedSku.marketPrice,
                  stock: selectedSku.stock,
                  coverImage: selectedSku.coverImage || product.coverImage,
                  quantity: 1
                });
                navigate("/cart");
              }}
            >
              加入购物车
            </button>
            <button className="secondary-button" type="button" onClick={() => navigate("/catalog")}>
              返回列表
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <span>Description</span>
          <h2>商品说明</h2>
          <p>{product.description}</p>
        </div>
      </section>
    </div>
  );
}
