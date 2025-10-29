import React from "react";
import type { PaginationInfo } from "../types";

interface FieldPaginationProps {
  paginationInfo: PaginationInfo;
  onPageChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const FieldPagination: React.FC<FieldPaginationProps> = ({
  paginationInfo,
  onPageChange,
  onPrevPage,
  onNextPage,
}) => {
  const {
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
  } = paginationInfo;

  const renderPaginationNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    if (start > 1) {
      pages.push(
        <button
          key={1}
          className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50"
          onClick={() => onPageChange(1)}
        >
          1
        </button>
      );
      if (start > 2) {
        pages.push(
          <span
            key="start-ellipsis"
            className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-700"
          >
            ...
          </span>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`px-4 py-2 border ${
            i === currentPage
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
          onClick={() => onPageChange(i)}
          disabled={i === currentPage}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(
          <span
            key="end-ellipsis"
            className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-700"
          >
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (totalPages === 0) return null;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      {/* Mobile pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          className={`px-4 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
            !hasPrevPage ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={onPrevPage}
          disabled={!hasPrevPage}
        >
          ⬅️ Trước
        </button>
        <span className="text-sm text-gray-700 py-2">
          {currentPage} / {totalPages}
        </span>
        <button
          className={`px-4 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
            !hasNextPage ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={onNextPage}
          disabled={!hasNextPage}
        >
          Sau ➡️
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          Hiển thị {startIndex + 1} đến {endIndex} của {totalItems}
        </p>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
              !hasPrevPage ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={onPrevPage}
            disabled={!hasPrevPage}
          >
            ⬅️
          </button>
          <div className="flex">{renderPaginationNumbers()}</div>
          <button
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
              !hasNextPage ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={onNextPage}
            disabled={!hasNextPage}
          >
            ➡️
          </button>
        </nav>
      </div>
    </div>
  );
};

export default FieldPagination;
