import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'

// Load Gumroad's overlay script once (progressive enhancement — the Buy links
// still work as normal links to the product page if it fails to load).
function useGumroad() {
  useEffect(() => {
    if (document.querySelector('script[data-gumroad]')) return
    const s = document.createElement('script')
    s.src = 'https://gumroad.com/js/gumroad.js'
    s.async = true
    s.setAttribute('data-gumroad', 'true')
    document.body.appendChild(s)
  }, [])
}

export default function Guidebook() {
  useGumroad()
  const { products, loading, error } = useProducts()
  const { user } = useAuth()
  const published = products.filter((p) => p.published)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            ● Guidebooks
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Seoul, in your <span className="text-brand">pocket</span>.
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Field-tested local guides as instant-download e-books. Secure checkout via Gumroad.
          </p>
        </div>
        {user && (
          <Link
            to="/admin/products"
            className="rounded-full border-[1.5px] border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-white"
          >
            Manage guidebooks
          </Link>
        )}
      </section>

      {loading && <p className="py-16 text-center text-faint">Loading guidebooks…</p>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load: {error}
        </div>
      )}
      {!loading && !error && published.length === 0 && (
        <div className="grid place-items-center rounded-xl border border-dashed border-neutral-300 py-24 text-center text-faint">
          <p>No guidebooks yet.</p>
          <p className="text-sm">
            {user ? 'Add your first e-book from “Manage guidebooks”.' : 'Check back soon.'}
          </p>
        </div>
      )}
      {published.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {published.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
