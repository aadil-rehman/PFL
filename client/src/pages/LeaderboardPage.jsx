import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LeaderboardRow from '../components/leaderboard/LeaderboardRow'
import Pagination from '../components/leaderboard/Pagination'
import { fetchLeaderboard } from '../api/leaderboard'
import { normalizeEntry } from '../components/leaderboard/leaderboardData'

const PER_PAGE = 50

export default function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1)

  const [entries, setEntries] = useState([])
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [status, setStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus('loading')
    fetchLeaderboard({ page, limit: PER_PAGE })
      .then((data) => {
        if (cancelled) return
        setEntries((data.leaderboard || []).map(normalizeEntry))
        setPagination(data.pagination || { total: 0, totalPages: 1 })
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [page])

  const goToPage = (next) => {
    setSearchParams({ page: String(next) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-[#0b1a10]">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden px-6 pt-28 pb-12 md:px-12">
        <div className="pointer-events-none absolute -top-20 left-1/3 h-80 w-80 rounded-full bg-green-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/50 transition-colors hover:text-green-300"
          >
            ← Back home
          </Link>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-green-500/15 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-300">
                  Live Rankings
                </span>
              </div>
              <h1 className="font-serif-display flex items-center gap-3 text-5xl font-semibold tracking-tight text-white md:text-6xl">
                Leaderboard <span>🏆</span>
              </h1>
            </div>

            <div className="text-right">
              <p className="font-serif-display text-4xl font-semibold text-green-400">
                {pagination.total.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                {pagination.total === 1 ? 'Planter' : 'Planters'} ranked
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* List card */}
      <section className="px-6 pb-28 md:px-12">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#f7f3e9] px-5 py-8 shadow-2xl shadow-black/30 md:px-10 md:py-10">
          {status === 'error' ? (
            <div className="px-6 py-20 text-center text-sm text-[#7b8a7f]">
              Couldn't load the leaderboard right now. Please try again later.
            </div>
          ) : status === 'ready' && entries.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-4xl">🌱</p>
              <p className="mt-3 font-bold text-[#143524]">No planters ranked yet</p>
              <p className="mt-1 text-sm text-[#7b8a7f]">
                Plant your first tree to claim the top spot.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3.5">
                {status === 'loading'
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-19 animate-pulse rounded-2xl bg-white/60 ring-1 ring-green-900/5"
                      />
                    ))
                  : entries.map((entry) => (
                      <LeaderboardRow key={entry.userId ?? entry.rank} entry={entry} />
                    ))}
              </div>

              {status === 'ready' && (
                <Pagination
                  page={page}
                  totalPages={pagination.totalPages}
                  onChange={goToPage}
                />
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
