import { formatDate } from './impactData'

// A glowing pin on the impact map. Highlights when its row is hovered and
// surfaces a small tooltip with who planted there and when.
export default function MapMarker({ area, active, onHover, onLeave, onSelect }) {
  const { marker, name, planter, date, treeCount } = area

  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      onClick={onSelect}
      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
      className="group absolute -translate-x-1/2 -translate-y-1/2 outline-none"
      aria-label={`${name}, ${treeCount} trees`}
    >
      {/* Pulse ring */}
      <span
        className={`absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400/30 transition-transform duration-300 ${
          active ? 'scale-150 animate-pulse' : 'scale-100'
        }`}
      />
      {/* Dot */}
      <span
        className={`relative block h-3.5 w-3.5 rounded-full ring-2 ring-[#0b1a10] transition-all duration-300 ${
          active
            ? 'scale-125 bg-green-300 shadow-[0_0_18px_4px_rgba(74,222,128,0.7)]'
            : 'bg-green-400 group-hover:bg-green-300'
        }`}
      />

      {/* Tooltip */}
      <span
        className={`pointer-events-none absolute bottom-full left-1/2 mb-3 w-44 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0f2318]/95 px-3 py-2 text-left shadow-2xl backdrop-blur-sm transition-all duration-200 ${
          active ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <span className="block truncate text-xs font-bold text-white">{name}</span>
        <span className="mt-0.5 block truncate text-[11px] text-green-300">
          {treeCount} trees · {planter}
        </span>
        <span className="block text-[10px] text-white/40">{formatDate(date)}</span>
      </span>
    </button>
  )
}
