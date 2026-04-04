import { useEffect, useState } from "react";
import { usePagination } from "hooks/usePagination";

export function Pagination({ currentPage, totalPages, totalItems, onPageChange, t }) {
  const pages = usePagination(currentPage, totalPages);
  const [pageJumpInput, setPageJumpInput] = useState(String(currentPage || 1));
  const safeTotalPages = Math.max(totalPages || 1, 1);

  useEffect(() => {
    setPageJumpInput(String(currentPage || 1));
  }, [currentPage]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextPage = Math.min(Math.max(Number(pageJumpInput) || 1, 1), safeTotalPages);
    setPageJumpInput(String(nextPage));
    onPageChange(nextPage);
  };

  return (
    <div className="pagination-shell">
      <div className="pagination-meta">
        <span className="pagination-total">{t("catalog.results.count").replace("{{count}}", String(totalItems || 0))}</span>
        <span className="pagination-summary">
          {t("catalog.results.page")
            .replace("{{page}}", String(currentPage || 1))
            .replace("{{totalPages}}", String(safeTotalPages))}
        </span>
      </div>

      <div className="pagination-control">
        <button
          className="pagination-nav"
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {t("catalog.pagination.previous")}
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

        <form className="pagination-jump" onSubmit={handleSubmit}>
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

        <button
          className="pagination-nav"
          type="button"
          disabled={currentPage >= safeTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {t("catalog.pagination.next")}
        </button>
      </div>
    </div>
  );
}
