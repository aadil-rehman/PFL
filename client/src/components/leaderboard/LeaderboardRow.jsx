import { RANK_STYLES, DEFAULT_STYLE } from './leaderboardData'

export default function LeaderboardRow({ entry }) {
  const style = RANK_STYLES[entry.rank] ?? DEFAULT_STYLE

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl px-5 py-4 ring-1 shadow-[0_2px_16px_-10px_rgba(20,53,36,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-14px_rgba(20,53,36,0.3)] ${style.row}`}
    >
      {/* Rank */}
      <span className={`font-serif-display w-7 shrink-0 text-center text-2xl font-semibold ${style.rank}`}>
        {entry.rank}
      </span>

      {/* Avatar — profile photo when available, else a deterministic plant emoji */}
      {entry.profilePhoto ? (
        <img
          src={entry.profilePhoto}
          alt={entry.name}
          className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-green-200/60"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-green-100 to-emerald-50 text-xl ring-1 ring-green-200/60">
          {entry.avatar}
        </div>
      )}

      {/* Name + location */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-[#143524]">{entry.name}</p>
        <p className="truncate text-sm text-[#7b8a7f]">{entry.location}</p>
      </div>

      {/* Plant count */}
      <div className="text-right">
        <p className="font-serif-display text-xl font-semibold text-[#143524] leading-none">
          {entry.plants}
        </p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-[#a3ada4]">
          Plants
        </p>
      </div>

      {/* Badge */}
      <span className="ml-1 shrink-0 text-2xl">{style.badge}</span>
    </div>
  )
}
