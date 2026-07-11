import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useProducts } from '../hooks/useProducts'

export default function ProductsAdmin() {
  const { products, loading, error, refetch } = useProducts()

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    if (error) {
      alert(`Delete failed: ${error.message}`)
      return
    }
    refetch()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Guidebooks</h1>
          <Link to="/admin" className="text-sm text-neutral-500 hover:text-ink">
            ← Dashboard
          </Link>
        </div>
        <Link
          to="/admin/products/new"
          className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + New guidebook
        </Link>
      </div>

      {loading && <p className="mt-8 text-neutral-400">Loading…</p>}
      {error && <p className="mt-8 text-red-600">{error}</p>}
      {!loading && products.length === 0 && (
        <p className="mt-8 text-neutral-400">No guidebooks yet. Add your first e-book.</p>
      )}

      <ul className="mt-6 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-3">
            <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
              {p.cover_image_url && (
                <img src={p.cover_image_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {p.title}
                {!p.published && (
                  <span className="ml-2 rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-neutral-600">
                    Draft
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-neutral-400">
                {p.price_label ? `${p.price_label} · ` : ''}
                {p.gumroad_url}
              </p>
            </div>
            <div className="flex shrink-0 gap-2 text-sm">
              <Link
                to={`/admin/products/edit/${p.id}`}
                className="rounded-md border border-neutral-300 px-2 py-1 hover:bg-neutral-100"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(p)}
                className="rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
