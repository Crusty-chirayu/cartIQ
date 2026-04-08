import React, { useState, useEffect } from "react";
import clsx from "clsx";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [pages, setPages] = useState<(number | string)[]>([]);

  useEffect(() => {
    const calculatePages = () => {
      const newPages: (number | string)[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      newPages.push(1);

      if (currentPage > 3) {
        newPages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        newPages.push(i);
      }

      if (currentPage < totalPages - 2) {
        newPages.push("...");
      }

      newPages.push(totalPages);

      return newPages;
    };

    setPages(calculatePages());
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ← Previous
      </button>

      {pages.map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          className={clsx(
            "px-3 py-2 rounded-lg transition-colors",
            page === currentPage
              ? "bg-blue-600 text-white"
              : page === "..."
              ? "cursor-not-allowed opacity-50"
              : "border border-gray-300 hover:bg-gray-50"
          )}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
