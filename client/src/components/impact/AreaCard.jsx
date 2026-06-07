import { Link } from 'react-router-dom'
import { formatDate } from './impactData'

// One planting site in the impact list. Hovering syncs with its map marker;
// "View" opens the dedicated page listing every tree at the site.
export default function AreaCard({ area, active, onHover, onLeave }) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-300 ${
        active
          ? 'border-green-400/40 bg-green-500/10 shadow-[0_10px_30px_-16px_rgba(74,222,128,0.6)]'
          : 'border-white/10 bg-white/5 hover:border-white/20'
      }`}
    >
      {/* Tree count badge */}
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-green-500/15 leading-none">
        <span className="text-sm font-bold text-green-300">{area.treeCount}</span>
        <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-green-300/60">
          trees
        </span>
      </div>

      {/* Who + where + when */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-white">{area.name}</p>
        <p className="truncate text-xs text-white/50">
          {area.planter}{area.state ? ` · ${area.state}` : ''}
        </p>
        <p className="mt-0.5 text-[11px] text-green-300/70">📅 {formatDate(area.date)}</p>
      </div>

      {/* View action */}
      <Link
        to={`/area/${area.id}`}
        className="shrink-0 rounded-full bg-green-500 px-4 py-2 text-xs font-bold text-[#0b1a10] transition-all duration-200 hover:bg-green-400 active:scale-95"
      >
        View →
      </Link>
    </div>
  )
}
