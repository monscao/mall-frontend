import { useEffect, useState } from "react";
import { IconArrowLeft, IconArrowRight } from "components/Icons";
import { usePagination } from "hooks/usePagination";

function getCompactPages(currentPage, totalPages) {
  const safeTotalPages = Math.max(totalPages || 1, 1);
  const safeCurrentPage = Math.min(Math.max(currentPage || 1, 1), safeTotalPages);

  if (safeTotalPages <= 3) {
    return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
  }

  if (safeCurrentPage <= 2) {
    return [1, 2, 3, "...", safeTotalPages];
  }

  if (safeCurrentPage >= safeTotalPages - 1) {
    return [1, "...", safeTotalPages - 2, safeTotalPages - 1, safeTotalPages];
  }

  return [safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", safeTotalPages];
}

export function Pagination({ currentPage, totalPages, totalItems, onPageChange, t }) {
  const [isCompact, setIsCompact] = useState(() => (typeof window !== "undefined" ? window.innerWidth <= 640 : false));
  const desktopPages = usePagination(currentPage, totalPages, 1);
  const [pageJumpInput, setPageJumpInput] = useState(String(currentPage || 1));
  const safeTotalPages = Math.max(totalPages || 1, 1);
  const mobilePages = getCompactPages(currentPage, totalPages);
  const pages = isCompact ? mobilePages : desktopPages;

  useEffect(() => {
    setPageJumpInput(String(currentPage || 1));
  }, [currentPage]);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextPage = Math.min(Math.max(Number(pageJumpInput) || 1, 1), safeTotalPages);
    setPageJumpInput(String(nextPage));
    onPageChange(nextPage);
  };

  return (
    <div className="pagination-shell">
      <div className="pagination-control">
        <div className="pagination-toolbar">
          <button
            className="pagination-nav"
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label={t("catalog.pagination.previous")}
          >
            <IconArrowLeft className="pagination-nav-icon" />
          </button>

          <div className="pagination-pages">
            {pages.map((page, index) =>
              page === "..." ? (
                <span className="pagination-ellipsis" key={`ellipsis-${index}`}>
                  ...
                </span>
              ) : (
                <button
                  className={`pagination-page ${page === currentPage ? "is-active" : ""}`}
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            className="pagination-nav"
            type="button"
            disabled={currentPage >= safeTotalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label={t("catalog.pagination.next")}
          >
            <IconArrowRight className="pagination-nav-icon" />
          </button>
        </div>

        <form className={`pagination-jump ${isCompact ? "is-compact" : ""}`} onSubmit={handleSubmit}>
          <span className="pagination-jump-label">{t("catalog.pagination.jump")}</span>
          <input
            type="number"
            min="1"
            max={safeTotalPages}
            value={pageJumpInput}
            onChange={(event) => setPageJumpInput(event.target.value)}
          />
          <button className="pagination-go" type="submit">
            {t("catalog.pagination.go")}
          </button>
        </form>
      </div>
    </div>
  );
}
