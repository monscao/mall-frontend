import { BrandMark } from "components/BrandMark";

export function GlobalLoadingOverlay() {
  return (
    <div className="global-loading-overlay" aria-live="polite" aria-busy="true">
      <div className="global-loading-shell">
        <span className="global-loading-brand" aria-hidden="true">
          <BrandMark />
        </span>
        <div className="global-loading-copy">
          <strong>MONSCAO</strong>
          <span>Loading your account experience…</span>
        </div>
      </div>
    </div>
  );
}
