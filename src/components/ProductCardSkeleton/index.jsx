export function ProductCardSkeleton() {
  return (
    <article className="product-card product-card-skeleton" aria-hidden="true">
      <div className="skeleton-block skeleton-product-image" />

      <div className="product-body">
        <div className="product-topline">
          <span className="skeleton-block skeleton-line skeleton-line-short" />
          <span className="skeleton-block skeleton-line skeleton-line-tiny" />
        </div>

        <div className="product-copy">
          <span className="skeleton-block skeleton-line skeleton-line-medium" />
          <span className="skeleton-block skeleton-line skeleton-line-wide" />
          <span className="skeleton-block skeleton-line skeleton-line-mid" />
        </div>

        <div className="tag-row tag-row-compact">
          <span className="skeleton-block skeleton-pill" />
          <span className="skeleton-block skeleton-pill" />
          <span className="skeleton-block skeleton-pill skeleton-pill-short" />
        </div>

        <div className="product-footer">
          <div className="price-line">
            <span className="skeleton-block skeleton-line skeleton-line-medium" />
            <span className="skeleton-block skeleton-line skeleton-line-short" />
          </div>

          <div className="card-actions card-actions-compact">
            <span className="skeleton-block skeleton-button" />
            <span className="skeleton-block skeleton-button" />
          </div>
        </div>
      </div>
    </article>
  );
}
