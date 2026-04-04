import { useMemo } from "react";

export function usePagination(currentPage, totalPages, siblingCount = 1) {
  return useMemo(() => {
    const safeTotalPages = Math.max(totalPages || 1, 1);
    const safeCurrentPage = Math.min(Math.max(currentPage || 1, 1), safeTotalPages);
    const totalPageNumbers = siblingCount * 2 + 5;

    if (safeTotalPages <= totalPageNumbers) {
      return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
    }

    const leftSiblingIndex = Math.max(safeCurrentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(safeCurrentPage + siblingCount, safeTotalPages);
    const shouldShowLeftEllipsis = leftSiblingIndex > 2;
    const shouldShowRightEllipsis = rightSiblingIndex < safeTotalPages - 1;

    if (!shouldShowLeftEllipsis) {
      const leftRange = Array.from({ length: 3 + siblingCount * 2 }, (_, index) => index + 1);
      return [...leftRange, "...", safeTotalPages];
    }

    if (!shouldShowRightEllipsis) {
      const rightRangeStart = safeTotalPages - (2 + siblingCount * 2);
      const rightRange = Array.from({ length: 3 + siblingCount * 2 }, (_, index) => rightRangeStart + index);
      return [1, "...", ...rightRange];
    }

    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, index) => leftSiblingIndex + index
    );

    return [1, "...", ...middleRange, "...", safeTotalPages];
  }, [currentPage, siblingCount, totalPages]);
}
