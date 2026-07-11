import { supabase } from './supabase'

// Calls the same-origin AI proxy Functions with the current Supabase session
// token so the server can verify the caller is the logged-in admin.
async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Checks whether the Anthropic key is configured + valid on this deployment.
export async function testApiKey() {
  const res = await fetch('/api/ai/test', { headers: await authHeaders() })
  if (res.status === 404) {
    return {
      ok: false,
      configured: false,
      message:
        'AI endpoint not found. It only runs on the deployed Cloudflare site (or `wrangler pages dev`), not `npm run dev`.',
    }
  }
  return res.json()
}

// Generates a draft. Returns { draft, model, usage, cost_usd } or throws.
export async function generateDraft(payload) {
  const res = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(payload),
  })
  if (res.status === 404) {
    throw new Error(
      'AI endpoint not found. Deploy to Cloudflare (or run `wrangler pages dev`) — it is not available under `npm run dev`.',
    )
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}
