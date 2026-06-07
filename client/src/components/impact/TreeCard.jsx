import { formatDate } from './impactData'

const STATUS_STYLES = {
  Thriving: 'bg-green-500/15 text-green-300',
  Healthy: 'bg-emerald-500/15 text-emerald-300',
  'Newly planted': 'bg-amber-500/15 text-amber-300',
}

// A single tree on the dedicated area page.
export default function TreeCard({ tree }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-green-400/30 hover:bg-white/[0.07]">
      {tree.photoUrl ? (
        <img
          src={tree.photoUrl}
          alt={tree.species}
          loading="lazy"
          className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-green-400/10"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-900/20 text-2xl ring-1 ring-green-400/10">
          {tree.emoji}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-white">{tree.species}</p>
        <p className="truncate text-xs text-white/50">
          {tree.planter} · 📅 {formatDate(tree.date)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
            STATUS_STYLES[tree.status] ?? 'bg-white/10 text-white/60'
          }`}
        >
          {tree.status}
        </span>
        <span className="font-mono text-[10px] tracking-wide text-white/30">
          {tree.code}
        </span>
      </div>
    </div>
  )
}
