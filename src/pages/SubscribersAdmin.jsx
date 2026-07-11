import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function SubscribersAdmin() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setRows(data ?? [])
        setLoading(false)
      })
  }, [])

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv =
      'email,source,created_at\n' +
      rows.map((r) => [esc(r.email), esc(r.source), esc(r.created_at)].join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${rows.length}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscribers</h1>
          <Link to="/admin" className="text-sm text-neutral-500 hover:text-ink">
            ← Dashboard
          </Link>
        </div>
        <button
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="mt-6 rounded-xl border-2 border-ink bg-white p-5">
        <p className="text-sm text-muted">Total subscribers</p>
        <p className="text-3xl font-bold text-brand">{rows.length.toLocaleString()}</p>
      </div>

      {loading && <p className="mt-6 text-neutral-400">Loading…</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}
      {!loading && rows.length === 0 && (
        <p className="mt-6 text-neutral-400">No subscribers yet.</p>
      )}

      {rows.length > 0 && (
        <ul className="mt-6 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 p-3 text-sm">
              <span className="truncate font-medium">{r.email}</span>
              <span className="shrink-0 text-neutral-400">
                {r.source ? `${r.source} · ` : ''}
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
