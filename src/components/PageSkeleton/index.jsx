export function PageSkeleton({ variant = "default" }) {
  if (variant === "detail") {
    return (
      <section className="page-skeleton page-skeleton-detail" aria-hidden="true">
        <div className="skeleton-block page-skeleton-media" />
        <div className="page-skeleton-copy">
          <span className="skeleton-block skeleton-line skeleton-line-short" />
          <span className="skeleton-block skeleton-line skeleton-line-wide" />
          <span className="skeleton-block skeleton-line skeleton-line-mid" />
          <span className="skeleton-block skeleton-line skeleton-line-wide" />
          <div className="page-skeleton-chip-row">
            <span className="skeleton-block skeleton-pill" />
            <span className="skeleton-block skeleton-pill" />
            <span className="skeleton-block skeleton-pill" />
          </div>
          <span className="skeleton-block skeleton-button skeleton-button-wide" />
        </div>
      </section>
    );
  }

  return (
    <section className="page-skeleton" aria-hidden="true">
      <div className="skeleton-block page-skeleton-hero" />
      <div className="skeleton-block page-skeleton-panel" />
      <div className="skeleton-block page-skeleton-panel page-skeleton-panel-small" />
    </section>
  );
}
