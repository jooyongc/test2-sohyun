// A guidebook e-book card. The Buy link carries the `gumroad-button` class so
// gumroad.js turns it into an in-page overlay checkout; if the script isn't
// loaded it stays a normal link to the Gumroad product page (graceful fallback).
export default function ProductCard({ product }) {
  const cover = product.cover_image_url

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border-[1.5px] border-ink bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.4)]">
      <div
        className="relative aspect-[3/4] w-full"
        style={{ background: 'linear-gradient(160deg,#f6ecdd,#ecdcc3)' }}
      >
        {cover ? (
          <img src={cover} alt={product.title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[11px] uppercase tracking-[0.14em] text-[#b06f1f]">
            📕 E-book
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[17px] font-bold leading-tight tracking-[-0.01em]">{product.title}</h3>
        {product.subtitle && <p className="mt-1 text-sm text-muted">{product.subtitle}</p>}
        {product.description && (
          <p className="mt-2 line-clamp-3 text-[13px] text-neutral-500">{product.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="font-mono text-sm font-bold text-ink">{product.price_label || ''}</span>
          <a
            className="gumroad-button inline-flex items-center gap-1 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            href={product.gumroad_url}
            target="_blank"
            rel="noopener noreferrer"
            data-gumroad-single-product="true"
          >
            Buy on Gumroad ↗
          </a>
        </div>
      </div>
    </div>
  )
}
