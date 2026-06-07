// Compact, reusable pager. Renders first/last + a window around the current
// page with ellipses, e.g. 1 … 4 [5] 6 … 20. Styled for the cream leaderboard.

// Build the list of page tokens to render: numbers and 'gap' separators.
function pageItems(page, totalPages) {
  const SIBLINGS = 1 // pages shown on each side of the current page
  const pages = new Set([1, totalPages, page])
  for (let i = 1; i <= SIBLINGS; i++) {
    pages.add(page - i)
    pages.add(page + i)
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  const items = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) items.push({ type: 'gap', key: `gap-${p}` })
    items.push({ type: 'page', value: p, key: `page-${p}` })
    prev = p
  }
  return items
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const go = (p) => {
    const next = Math.min(Math.max(p, 1), totalPages)
    if (next !== page) onChange(next)
  }

  const arrow =
    'flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Leaderboard pages">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={`${arrow} bg-white text-[#1f5135] ring-1 ring-green-900/10 hover:bg-green-50`}
        aria-label="Previous page"
      >
        ←
      </button>

      {pageItems(page, totalPages).map((item) =>
        item.type === 'gap' ? (
          <span key={item.key} className="px-1 text-[#a3ada4]">
            …
          </span>
        ) : (
          <button
            key={item.key}
            type="button"
            onClick={() => go(item.value)}
            aria-current={item.value === page ? 'page' : undefined}
            className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-bold transition-colors ${
              item.value === page
                ? 'bg-[#1f5135] text-white shadow-md shadow-green-900/20'
                : 'bg-white text-[#143524] ring-1 ring-green-900/10 hover:bg-green-50'
            }`}
          >
            {item.value}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className={`${arrow} bg-white text-[#1f5135] ring-1 ring-green-900/10 hover:bg-green-50`}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  )
}
