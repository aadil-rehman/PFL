// Display helpers for the (live) impact map.
//
// Areas come from the API grouped by a slug, with no real coordinates — users
// only give a free-text location. So we place each area's marker by hashing its
// slug into a stable position, and decorate trees (emoji, status, code) here.

const SPECIES_EMOJI = {
  neem: '🌳',
  peepal: '🌲',
  banyan: '🌴',
  mango: '🥭',
  tulsi: '🌿',
  ashoka: '🌲',
  guava: '🍐',
  gulmohar: '🌺',
  amla: '🍃',
  jamun: '🫐',
  bamboo: '🎋',
}

export function emojiFor(species = '') {
  return SPECIES_EMOJI[species.toLowerCase()] ?? '🌱'
}

// Deterministic string hash → same area always lands in the same map spot.
function hash(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

// Position an area on the map panel (0–100%), kept inside a comfortable margin
// so markers and their tooltips don't clip the edges.
export function areaMarker(id = '') {
  const h = hash(id)
  const x = 12 + (h % 76)
  const y = 15 + ((Math.floor(h / 76)) % 70)
  return { x, y }
}

// Friendly health label derived from how long ago the tree was planted.
export function deriveStatus(iso) {
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000
  if (days < 30) return 'Newly planted'
  if (days < 180) return 'Healthy'
  return 'Thriving'
}

// Stable display code for a tree within its area, e.g. "TILA-003".
export function treeCode(areaId = '', index = 0) {
  const prefix = areaId.replace(/-/g, '').slice(0, 4).toUpperCase() || 'AREA'
  return `${prefix}-${String(index + 1).padStart(3, '0')}`
}

// Format an ISO date (YYYY-MM-DD) as "21 May 2026".
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
