// Static placeholder rankings — swap for live API data later.
export const TOP_PLANTERS = [
  { rank: 1, name: 'Priya Verma', location: 'Lucknow, UP', plants: 142, avatar: '🌳' },
  { rank: 2, name: 'Arjun Singh', location: 'Delhi', plants: 118, avatar: '🌿' },
  { rank: 3, name: 'Sunita Patel', location: 'Ahmedabad, GJ', plants: 97, avatar: '🍃' },
  { rank: 4, name: 'Ravi Kumar', location: 'Patna, Bihar', plants: 84, avatar: '🌱' },
  { rank: 5, name: 'Meera Nair', location: 'Kochi, Kerala', plants: 71, avatar: '🌵' },
]

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
