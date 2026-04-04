import { useCart } from "context/CartContext";
import { useI18n } from "context/I18nContext";
import { formatCurrency, stockLabelKey } from "shared/utils/format";
import { SafeImage } from "components/SafeImage";

export function ProductCard({ product, navigate, onAddToCart }) {
  const { addItem } = useCart();
  const { locale, resolveTag, resolveText, t } = useI18n();

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart();
      return;
    }

    if (!product.defaultSkuCode) {
      navigate(`/product/${product.slug}`);
      return;
    }

    addItem({
      skuCode: product.defaultSkuCode,
      productSlug: product.slug,
      productName: product.name,
      skuName: product.subtitle,
      salePrice: product.priceFrom,
      marketPrice: product.marketPrice,
      stock: 99,
      coverImage: product.coverImage,
      quantity: 1
    });
  };

  return (
    <article className="product-card">
      <button className="product-visual" type="button" onClick={() => navigate(`/product/${product.slug}`)}>
        <SafeImage alt={product.name} src={product.coverImage} />
      </button>

      <div className="product-body">
        <div className="product-topline">
          <span className="product-brand">{product.brand}</span>
          <span className="product-rating">{product.rating}</span>
        </div>

        <div className="product-copy">
          <h3>{product.name}</h3>
          <p>{resolveText(product.subtitle)}</p>
        </div>

        <div className="tag-row tag-row-compact">
          {(product.tags || []).slice(0, 2).map((tag) => (
            <span className="tag-pill muted" key={tag}>
              {resolveTag(tag)}
            </span>
          ))}
          <span className="tag-pill muted">{t(stockLabelKey(product.stockStatus))}</span>
        </div>

        <div className="product-footer">
          <div className="price-line">
            <span className="price">{formatCurrency(product.priceFrom, locale)}</span>
            {product.marketPrice ? <span className="market-price">{formatCurrency(product.marketPrice, locale)}</span> : null}
          </div>

          <div className="card-actions card-actions-compact">
            <button className="secondary-button card-action-secondary" type="button" onClick={() => navigate(`/product/${product.slug}`)}>
              {t("product.viewDetails")}
            </button>
            <button className="primary-button card-action-primary" type="button" onClick={handleAdd}>
              {t("product.addToCart")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
