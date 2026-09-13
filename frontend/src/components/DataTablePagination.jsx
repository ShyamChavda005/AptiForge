import React from "react";

function DataTablePagination({ currentPage, totalRecords, itemsPerPage = 10, onPageChange, onItemsPerPageChange }) {
    const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
    const startIndex = totalRecords === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalRecords);

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    if (totalRecords === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-6 py-4">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 font-medium">
                <div>
                    Showing <span className="font-semibold text-slate-800">{startIndex}</span> to{" "}
                    <span className="font-semibold text-slate-800">{endIndex}</span> of{" "}
                    <span className="font-semibold text-slate-800">{totalRecords}</span> entries
                </div>

                {onItemsPerPageChange && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span>Show</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>per page</span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed"
                >
                    ‹ Previous
                </button>

                {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400 font-semibold select-none">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                currentPage === page
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed"
                >
                    Next ›
                </button>
            </div>
        </div>
    );
}

export default DataTablePagination;
