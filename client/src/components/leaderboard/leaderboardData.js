// Per-rank styling for the podium (top 3) vs. the rest.
export const RANK_STYLES = {
  1: { row: 'bg-linear-to-r from-amber-100/80 to-amber-50/40 ring-amber-200/60', rank: 'text-amber-500', badge: '🥇' },
  2: { row: 'bg-linear-to-r from-slate-100/90 to-slate-50/40 ring-slate-200/70', rank: 'text-slate-400', badge: '🥈' },
  3: { row: 'bg-linear-to-r from-orange-100/70 to-rose-50/40 ring-orange-200/60', rank: 'text-orange-400', badge: '🥉' },
}

export const DEFAULT_STYLE = {
  row: 'bg-white ring-green-900/5',
  rank: 'text-[#c2cabe]',
  badge: '⭐',
}

// Emoji avatars used when a user has no profile photo. Picked deterministically
// per user so the same person always shows the same plant.
const AVATARS = ['🌳', '🌿', '🍃', '🌱', '🌵', '🌲', '🌴', '🪴']

function hash(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function avatarFor(seed = '') {
  return AVATARS[hash(String(seed)) % AVATARS.length]
}

// "District, State" — drop blanks, fall back to a generic label.
export function formatLocation(state, district) {
  return [district, state].filter(Boolean).join(', ') || 'India'
}

// Shape an API leaderboard entry into the fields LeaderboardRow renders.
export function normalizeEntry(entry) {
  return {
    rank: entry.rank,
    userId: entry.userId,
    name: entry.name || 'Anonymous Planter',
    location: formatLocation(entry.state, entry.district),
    plants: entry.totalPlants || 0,
    profilePhoto: entry.profilePhoto || null,
    avatar: avatarFor(entry.userId || entry.name || entry.rank),
  }
}
