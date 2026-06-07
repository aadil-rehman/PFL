import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchImpactAreas } from '../../api/impact'
import { areaMarker } from './impactData'
import MapMarker from './MapMarker'
import AreaCard from './AreaCard'

export default function ImpactMap() {
  const [areas, setAreas] = useState([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [activeId, setActiveId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    fetchImpactAreas()
      .then((data) => {
        if (cancelled) return
        // Attach a stable marker position to each area (no real coords exist).
        setAreas((data.areas || []).map((a) => ({ ...a, marker: areaMarker(a.id) })))
        setTotal(data.total || 0)
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
    <section className="relative overflow-hidden bg-[#0b1a10] px-6 py-20 md:px-12 md:py-28">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-green-500/15 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-300">
                Impact Map
              </span>
            </div>
            <h2 className="font-serif-display flex items-center gap-3 text-5xl font-semibold tracking-tight text-white md:text-6xl">
              Where we planted <span>🌍</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/50">
              See every area, who planted there, and when. Explore the
              neighbourhoods our community has brought back to life.
            </p>
          </div>
          <div className="text-right">
            <p className="font-serif-display text-4xl font-semibold text-green-400">
              {total.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Trees across {areas.length} {areas.length === 1 ? 'area' : 'areas'}
            </p>
          </div>
        </div>

        {status === 'error' ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-20 text-center text-white/50">
            Couldn't load the impact map right now. Please try again later.
          </div>
        ) : status === 'ready' && areas.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-20 text-center">
            <p className="text-4xl">🌱</p>
            <p className="mt-3 font-bold text-white">No trees on the map yet</p>
            <p className="mt-1 text-sm text-white/50">
              Be the first to plant a tree and put your area on the map.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            {/* Map panel */}
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-[#0f2318] sm:aspect-[4/3] lg:aspect-auto">
              {/* Topographic backdrop */}
              <div
                className="absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(74,222,128,0.4) 1px, transparent 0)',
                  backgroundSize: '26px 26px',
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-900/20" />

              {/* Markers */}
              {areas.map((area) => (
                <MapMarker
                  key={area.id}
                  area={area}
                  active={activeId === area.id}
                  onHover={() => setActiveId(area.id)}
                  onLeave={() => setActiveId(null)}
                  onSelect={() => navigate(`/area/${area.id}`)}
                />
              ))}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#0b1a10]/70 px-3 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-[10px] font-medium text-white/60">
                  Planting area
                </span>
              </div>

              {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/50">
                  Loading map…
                </div>
              )}
            </div>

            {/* Area list */}
            <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1">
              {status === 'loading' ? (
                [0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[76px] animate-pulse rounded-2xl border border-white/10 bg-white/5"
                  />
                ))
              ) : (
                areas.map((area) => (
                  <AreaCard
                    key={area.id}
                    area={area}
                    active={activeId === area.id}
                    onHover={() => setActiveId(area.id)}
                    onLeave={() => setActiveId(null)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
