// POST /api/ai/generate — generates a blog-post draft with Claude.
// Body: { model, title, location, district, category, notes, language }
// Returns: { draft, model, usage:{input_tokens,output_tokens}, cost_usd }
import { json, getUser, costUsd, MODELS, ANTHROPIC_VERSION } from './_lib.js'

const CATEGORY_LABELS = {
  eats: 'food / restaurants',
  cafes: 'cafés',
  streets: 'street art / walking',
  music: 'live music',
  shops: 'shops',
  outdoors: 'parks / outdoors',
}

export async function onRequestPost({ request, env }) {
  const user = await getUser(request, env)
  if (!user) return json({ error: 'Unauthorized. Sign in as admin.' }, 401)

  const key = env.ANTHROPIC_API_KEY
  if (!key) return json({ error: 'ANTHROPIC_API_KEY is not set on this deployment.' }, 400)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }

  const model = body.model || 'claude-opus-4-8'
  if (!MODELS[model]) return json({ error: `Unknown model: ${model}` }, 400)

  const title = (body.title || '').trim()
  if (!title) return json({ error: 'A title is required to generate a draft.' }, 400)

  const language = body.language === 'korean' ? 'Korean' : 'English'
  const place = [body.location, body.district].filter(Boolean).join(', ')
  const category = CATEGORY_LABELS[body.category] || body.category || ''

  const system =
    'You are a writer for LoveandSeoul, a curated local guide to Seoul told ' +
    "neighbourhood by neighbourhood (Hongdae, Euljiro, Seongsu, and more). Your voice is " +
    'warm, specific, and insider — real cafés, real alleys, real late-night eats, never an ad. ' +
    `Write the body of a short blog post in ${language} (2 to 4 short paragraphs, first person). ` +
    'Do NOT repeat the title as a heading, do not use markdown headings, and do not invent ' +
    'exact prices, phone numbers, or opening hours. Return only the post body.'

  const details = [
    `Title: ${title}`,
    place && `Location: ${place}`,
    category && `Category: ${category}`,
    body.notes && `Notes from the author: ${body.notes}`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 3000,
        system,
        messages: [{ role: 'user', content: `Write the draft.\n\n${details}` }],
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return json({ error: data?.error?.message || `Anthropic API error ${res.status}` }, res.status)
    }
    if (data.stop_reason === 'refusal') {
      return json({ error: 'The model declined this request. Try different notes or a model like Opus.' }, 422)
    }

    const draft = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()

    const usage = {
      input_tokens: data.usage?.input_tokens ?? 0,
      output_tokens: data.usage?.output_tokens ?? 0,
    }

    return json({
      draft,
      model: data.model || model,
      usage,
      cost_usd: costUsd(model, usage.input_tokens, usage.output_tokens),
    })
  } catch (e) {
    return json({ error: `Request failed: ${e.message}` }, 502)
  }
}
