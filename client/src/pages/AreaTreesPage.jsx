import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import TreeCard from '../components/impact/TreeCard'
import { fetchAreaTrees } from '../api/impact'
import { emojiFor, deriveStatus, treeCode, formatDate } from '../components/impact/impactData'

export default function AreaTreesPage() {
  const { id } = useParams()
  const [area, setArea] = useState(null)
  const [trees, setTrees] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | notfound | error

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus('loading') // reset when navigating between areas
    fetchAreaTrees(id)
      .then((data) => {
        if (cancelled) return
        setArea(data.area)
        // Decorate each tree with the display fields TreeCard expects.
        setTrees(
          (data.trees || []).map((t, i) => ({
            id: t.id,
            species: t.species,
            emoji: emojiFor(t.species),
            photoUrl: t.photoUrl,
            planter: t.planter,
            date: t.date,
            status: deriveStatus(t.date),
            code: treeCode(id, i),
          })),
        )
        setStatus('ready')
      })
      .catch((err) => {
        if (!cancelled) setStatus(err.status === 404 ? 'notfound' : 'error')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1a10] text-white/50">
        Loading area…
      </main>
    )
  }

  if (status === 'notfound' || status === 'error') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0b1a10] px-6 text-center">
        <p className="text-6xl">🌵</p>
        <h1 className="font-serif-display text-3xl font-semibold text-white">
          {status === 'notfound' ? 'Area not found' : 'Something went wrong'}
        </h1>
        <Link to="/" className="text-sm font-bold text-green-400 hover:text-green-300">
          ← Back to the map
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0b1a10]">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden px-6 pt-28 pb-12 md:px-12">
        <div className="pointer-events-none absolute -top-20 left-1/3 h-80 w-80 rounded-full bg-green-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/50 transition-colors hover:text-green-300"
          >
            ← Back to impact map
          </Link>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              {area.state && (
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-green-500/15 px-4 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-300">
                    {area.state}
                  </span>
                </div>
              )}
              <h1 className="font-serif-display text-5xl font-semibold tracking-tight text-white md:text-6xl">
                {area.name}
              </h1>
              <p className="mt-3 text-sm text-white/50">
                Started by <span className="text-white/80">{area.planter}</span> ·{' '}
                {formatDate(area.date)}
              </p>
            </div>

            <div className="flex gap-8">
              <div>
                <p className="font-serif-display text-4xl font-semibold text-green-400">
                  {area.treeCount}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Trees planted
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tree grid */}
      <section className="px-6 pb-28 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-3 sm:grid-cols-2">
            {trees.map((tree) => (
              <TreeCard key={tree.id} tree={tree} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
