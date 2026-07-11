// GET /api/ai/test — checks whether the Anthropic key is configured on this
// deployment and actually valid, without spending generation tokens.
// Uses the free Models API (GET /v1/models) to validate auth.
import { json, getUser, ANTHROPIC_VERSION } from './_lib.js'

export async function onRequestGet({ request, env }) {
  const user = await getUser(request, env)
  if (!user) return json({ error: 'Unauthorized. Sign in as admin.' }, 401)

  const key = env.ANTHROPIC_API_KEY
  if (!key) {
    return json({
      ok: false,
      configured: false,
      message: 'ANTHROPIC_API_KEY is not set on this deployment.',
    })
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/models?limit=3', {
      headers: { 'x-api-key': key, 'anthropic-version': ANTHROPIC_VERSION },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return json({
        ok: false,
        configured: true,
        status: res.status,
        message: body?.error?.message || `Anthropic API returned ${res.status}.`,
      })
    }
    const data = await res.json()
    return json({
      ok: true,
      configured: true,
      message: 'API key is valid and applied to this site.',
      sampleModels: (data.data || []).map((m) => m.id).slice(0, 3),
    })
  } catch (e) {
    return json({ ok: false, configured: true, message: `Request failed: ${e.message}` }, 502)
  }
}
