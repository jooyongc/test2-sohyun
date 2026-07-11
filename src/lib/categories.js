// Category + district design tokens from the LoveandSeoul handoff.
// Colors are applied via inline styles (per-category values can't be
// Tailwind-generated at runtime).

export const CATEGORIES = {
  eats: { key: 'eats', label: 'Eats', emoji: '🍜', color: '#e11d48', bg: '#fdeef1', grad: ['#fdeef1', '#f6ccd6'] },
  cafes: { key: 'cafes', label: 'Cafés', emoji: '☕', color: '#b06f1f', bg: '#f6ecdd', grad: ['#f6ecdd', '#ecdcc3'] },
  streets: { key: 'streets', label: 'Streets', emoji: '🎨', color: '#2a7d6e', bg: '#e3f0ec', grad: ['#e3f0ec', '#c7e2d8'] },
  music: { key: 'music', label: 'Music', emoji: '🎸', color: '#6b4fc0', bg: '#ece7f7', grad: ['#ece7f7', '#d8ccf0'] },
  shops: { key: 'shops', label: 'Shops', emoji: '🛍', color: '#2f66c0', bg: '#e6eefa', grad: ['#e6eefa', '#c9dcf5'] },
  outdoors: { key: 'outdoors', label: 'Outdoors', emoji: '🌿', color: '#3f8a38', bg: '#e9f2e6', grad: ['#e9f2e6', '#cbe4c5'] },
}

// Used when a post has no category yet (neutral stone look).
export const FALLBACK_CATEGORY = {
  key: '',
  label: 'Spot',
  emoji: '📍',
  color: '#8b8178',
  bg: '#efe9e0',
  grad: ['#f2ede4', '#e4dccf'],
}

export const CATEGORY_LIST = Object.values(CATEGORIES)

export function getCategory(key) {
  return CATEGORIES[key] || FALLBACK_CATEGORY
}

export function gradient(cat) {
  return `linear-gradient(160deg, ${cat.grad[0]}, ${cat.grad[1]})`
}

// Areas shown in the Home "Areas" filter row (in addition to "All Seoul").
export const DISTRICTS = ['Hongdae', 'Euljiro', 'Seongsu', 'Dongdaemun', 'Jongno', 'Itaewon']
