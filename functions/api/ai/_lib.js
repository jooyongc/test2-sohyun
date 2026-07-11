// Shared helpers for the AI proxy Functions (Cloudflare Pages Functions / Workers runtime).
// Underscore-prefixed files are NOT routed — safe to import from route handlers.
// NOTE: raw fetch is used deliberately (edge runtime, zero deps, no nodejs_compat).

// Selectable Claude models + USD pricing per 1M tokens. Default is claude-opus-4-8.
// Keep in sync with src/lib/claudeModels.js on the frontend.
export const MODELS = {
  'claude-opus-4-8': { label: 'Opus 4.8', in: 5, out: 25 },
  'claude-fable-5': { label: 'Fable 5', in: 10, out: 50 },
  'claude-opus-4-7': { label: 'Opus 4.7', in: 5, out: 25 },
  'claude-opus-4-6': { label: 'Opus 4.6', in: 5, out: 25 },
  'claude-sonnet-5': { label: 'Sonnet 5', in: 3, out: 15 },
  'claude-sonnet-4-6': { label: 'Sonnet 4.6', in: 3, out: 15 },
  'claude-haiku-4-5': { label: 'Haiku 4.5', in: 1, out: 5 },
}

export const ANTHROPIC_VERSION = '2023-06-01'

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export function costUsd(model, inputTokens, outputTokens) {
  const p = MODELS[model]
  if (!p) return 0
  return (inputTokens / 1e6) * p.in + (outputTokens / 1e6) * p.out
}

// Validate the caller's Supabase session so only the logged-in admin can spend
// the API key. Returns the user object, or null if unauthenticated.
export async function getUser(request, env) {
  const authz = request.headers.get('Authorization') || ''
  const token = authz.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  const base = env.VITE_SUPABASE_URL
  const anon = env.VITE_SUPABASE_ANON_KEY
  if (!base || !anon) return null
  try {
    const res = await fetch(`${base}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anon },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
