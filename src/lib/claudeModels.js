// Selectable Claude models with USD pricing per 1M tokens.
// Default is Opus 4.8. Keep in sync with functions/api/ai/_lib.js.
export const MODELS = [
  { id: 'claude-opus-4-8', label: 'Opus 4.8', tier: 'Most capable Opus', in: 5, out: 25 },
  { id: 'claude-fable-5', label: 'Fable 5', tier: 'Most capable overall', in: 10, out: 50 },
  { id: 'claude-opus-4-7', label: 'Opus 4.7', tier: 'Previous Opus', in: 5, out: 25 },
  { id: 'claude-opus-4-6', label: 'Opus 4.6', tier: 'Older Opus', in: 5, out: 25 },
  { id: 'claude-sonnet-5', label: 'Sonnet 5', tier: 'Fast + smart', in: 3, out: 15 },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6', tier: 'Previous Sonnet', in: 3, out: 15 },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5', tier: 'Fastest / cheapest', in: 1, out: 5 },
]

export const DEFAULT_MODEL = 'claude-opus-4-8'

const BY_ID = Object.fromEntries(MODELS.map((m) => [m.id, m]))

export function modelLabel(id) {
  return BY_ID[id]?.label || id
}

export function costOf(id, inputTokens = 0, outputTokens = 0) {
  const m = BY_ID[id]
  if (!m) return 0
  return (inputTokens / 1e6) * m.in + (outputTokens / 1e6) * m.out
}

// Format a small USD amount readably (AI drafts cost fractions of a cent).
export function formatUsd(v) {
  if (!v) return '$0.00'
  if (v < 0.01) return `$${v.toFixed(4)}`
  return `$${v.toFixed(2)}`
}
