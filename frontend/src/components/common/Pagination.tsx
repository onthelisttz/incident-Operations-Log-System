type PaginationProps = {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
  from: number
  to: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  from,
  to,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: PaginationProps) => {
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    pages.push(1)
    if (currentPage > 3) pages.push('ellipsis')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i += 1) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-ink-muted">
      <span>
        Showing {from}-{to} of {totalItems} items
      </span>
      <div className="flex items-center gap-2">
        <button
          className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink-muted disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          Prev
        </button>
        {getPageNumbers().map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                page === currentPage
                  ? 'border-primary-200 bg-primary-50 text-primary-600'
                  : 'border-line text-ink-muted hover:text-primary-600'
              }`}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          ),
        )}
        <button
          className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink-muted disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Pagination
