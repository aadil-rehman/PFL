import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchLeaderboard } from '../../api/leaderboard'
import { normalizeEntry } from './leaderboardData'
import LeaderboardRow from './LeaderboardRow'

const TOP_COUNT = 5

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    let cancelled = false
    fetchLeaderboard({ page: 1, limit: TOP_COUNT })
      .then((data) => {
        if (cancelled) return
        setEntries((data.leaderboard || []).map(normalizeEntry))
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="leaderboard" className="relative overflow-hidden bg-[#f7f3e9] px-8 py-20 md:px-16 md:py-28 scroll-mt-24">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-green-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-green-200/70 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800">
                Live Rankings
              </span>
            </div>
            <h2 className="font-serif-display flex items-center gap-3 text-5xl font-semibold tracking-tight text-[#143524] md:text-6xl">
              Leaderboard <span>🏆</span>
            </h2>
          </div>
          <p className="text-sm text-[#a3ada4]">Updated in real-time</p>
        </div>

        {/* Rows */}
        {status === 'error' ? (
          <div className="rounded-2xl bg-white/70 px-6 py-16 text-center text-sm text-[#7b8a7f] ring-1 ring-green-900/5">
            Couldn't load the leaderboard right now. Please try again later.
          </div>
        ) : status === 'ready' && entries.length === 0 ? (
          <div className="rounded-2xl bg-white/70 px-6 py-16 text-center ring-1 ring-green-900/5">
            <p className="text-4xl">🌱</p>
            <p className="mt-3 font-bold text-[#143524]">No planters ranked yet</p>
            <p className="mt-1 text-sm text-[#7b8a7f]">
              Plant your first tree to claim the top spot.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {status === 'loading'
              ? Array.from({ length: TOP_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    className="h-19 animate-pulse rounded-2xl bg-white/60 ring-1 ring-green-900/5"
                  />
                ))
              : entries.map((entry) => (
                  <LeaderboardRow key={entry.userId ?? entry.rank} entry={entry} />
                ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <Link
            to="/leaderboard"
            className="flex items-center gap-2 rounded-full bg-[#1f5135] px-8 py-4 text-sm font-bold text-white transition-all duration-200 hover:bg-[#27663f] hover:shadow-xl hover:shadow-green-900/20 active:scale-[0.98]"
          >
            View Full Leaderboard →
          </Link>
        </div>
      </div>
    </section>
  )
}
