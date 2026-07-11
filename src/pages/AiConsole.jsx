import { useState } from 'react'
import { Link } from 'react-router-dom'
import { testApiKey } from '../lib/aiClient'
import { useAiUsage } from '../hooks/useAiUsage'
import { modelLabel, formatUsd } from '../lib/claudeModels'

export default function AiConsole() {
  const { rows, loading, error } = useAiUsage()
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState(null)

  const runTest = async () => {
    setTesting(true)
    setResult(null)
    try {
      setResult(await testApiKey())
    } catch (e) {
      setResult({ ok: false, message: e.message })
    } finally {
      setTesting(false)
    }
  }

  // Aggregate usage.
  const totals = rows.reduce(
    (a, r) => {
      a.inTok += r.input_tokens
      a.outTok += r.output_tokens
      a.cost += Number(r.cost_usd)
      return a
    },
    { inTok: 0, outTok: 0, cost: 0 },
  )
  const byModel = {}
  for (const r of rows) {
    const m = (byModel[r.model] ||= { model: r.model, inTok: 0, outTok: 0, cost: 0, count: 0 })
    m.inTok += r.input_tokens
    m.outTok += r.output_tokens
    m.cost += Number(r.cost_usd)
    m.count += 1
  }
  const models = Object.values(byModel).sort((a, b) => b.cost - a.cost)
  const maxCost = Math.max(...models.map((m) => m.cost), 1e-9)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI console</h1>
        <Link to="/admin" className="text-sm text-neutral-500 hover:text-ink">
          ← Dashboard
        </Link>
      </div>

      {/* API key test */}
      <section className="mt-6 rounded-xl border-2 border-ink bg-white p-5">
        <h2 className="font-semibold">API key</h2>
        <p className="mt-1 text-sm text-muted">
          Checks whether <code className="rounded bg-neutral-100 px-1">ANTHROPIC_API_KEY</code> is
          configured and valid on this deployment.
        </p>
        <button
          onClick={runTest}
          disabled={testing}
          className="mt-3 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {testing ? 'Testing…' : 'Test API key'}
        </button>
        {result && (
          <div
            className={`mt-4 rounded-lg border p-3 text-sm ${
              result.ok
                ? 'border-green-300 bg-green-50 text-green-800'
                : 'border-red-300 bg-red-50 text-red-800'
            }`}
          >
            <p className="font-semibold">
              {result.ok ? '✓ Working' : result.configured === false ? '✗ Not configured' : '✗ Problem'}
            </p>
            <p className="mt-1">{result.message}</p>
            {result.sampleModels?.length > 0 && (
              <p className="mt-1 font-mono text-xs opacity-80">
                models: {result.sampleModels.join(', ')}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Usage / cost */}
      <section className="mt-6 rounded-xl border-2 border-ink bg-white p-5">
        <h2 className="font-semibold">Token usage &amp; cost</h2>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Generations" value={rows.length} />
          <Stat label="Input tokens" value={totals.inTok.toLocaleString()} />
          <Stat label="Output tokens" value={totals.outTok.toLocaleString()} />
          <Stat label="Total cost" value={formatUsd(totals.cost)} accent />
        </div>

        {loading && <p className="mt-4 text-sm text-neutral-400">Loading…</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {!loading && rows.length === 0 && (
          <p className="mt-4 text-sm text-neutral-400">
            No AI generations yet. Create a post and use “Generate draft”.
          </p>
        )}

        {models.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              Cost by model
            </p>
            {models.map((m) => (
              <div key={m.model}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{modelLabel(m.model)}</span>
                  <span className="text-neutral-500">
                    {formatUsd(m.cost)} · {m.count} gen · {(m.inTok + m.outTok).toLocaleString()} tok
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${Math.max(3, (m.cost / maxCost) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent ? 'text-brand' : 'text-ink'}`}>{value}</p>
    </div>
  )
}
