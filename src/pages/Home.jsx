import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import GalleryGrid from '../components/GalleryGrid'
import { usePosts } from '../hooks/usePosts'
import { CATEGORY_LIST, DISTRICTS, getCategory } from '../lib/categories'

const pill = 'rounded-full px-4 py-2 text-xs font-semibold transition'
const monoLabel = 'mr-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-faint'

export default function Home() {
  const { posts, loading, error } = usePosts()
  const [district, setDistrict] = useState('all')
  const [category, setCategory] = useState('all')

  const featured = posts[0] || null

  const filtered = useMemo(
    () =>
      posts.filter(
        (p) =>
          (district === 'all' || p.district === district) &&
          (category === 'all' || p.category === category),
      ),
    [posts, district, category],
  )
  const gridPosts = filtered.filter((p) => !featured || p.id !== featured.id)
  const featuredCat = featured ? getCategory(featured.category) : null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <section className="overflow-hidden rounded-xl border-2 border-ink bg-white shadow-page">
        {/* ---- Hero ---- */}
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr]">
          <div className="border-b-2 border-ink p-8 sm:p-10 md:border-b-0 md:border-r-2">
            <div className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
              ● Hongdae · Euljiro · Seongsu · Dongdaemun &amp; more
            </div>
            <h1 className="m-0 text-[42px] font-bold leading-[0.98] tracking-[-0.03em] sm:text-[56px]">
              SEOUL,
              <br />
              the way
              <br />
              we <span className="text-brand">actually</span>
              <br />
              live it.
            </h1>
            <p className="mt-5 max-w-[440px] text-[15px] leading-[1.6] text-muted">
              Real cafés, real alleys, real late-night eats — neighbourhood by neighbourhood.
              Hand-picked by locals, never an algorithm, never an ad.
            </p>
          </div>

          {featured ? (
            <Link
              to={`/posts/${featured.id}`}
              className="relative flex min-h-[260px] flex-col justify-end p-8 text-white"
              style={{ background: 'linear-gradient(150deg,#e11d48,#9f1239)' }}
            >
              <span className="absolute right-7 top-5 font-mono text-6xl font-bold opacity-[0.35]">
                01
              </span>
              <span className="mb-3.5 self-start rounded-full bg-white px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
                Editor's pick
              </span>
              <h2 className="m-0 text-[26px] font-bold leading-[1.05]">{featured.title}</h2>
              <p className="mt-2.5 text-[13px] opacity-85">
                📍 {featured.location || featured.district || 'Seoul'}
                {featured.category ? ` · ${featuredCat.label}` : ''}
              </p>
            </Link>
          ) : (
            <div
              className="flex min-h-[260px] flex-col items-start justify-end p-8 text-white"
              style={{ background: 'linear-gradient(150deg,#e11d48,#9f1239)' }}
            >
              <span className="mb-3.5 rounded-full bg-white px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
                Editor's pick
              </span>
              <h2 className="m-0 text-[24px] font-bold leading-[1.05]">Coming soon</h2>
              <p className="mt-2.5 text-[13px] opacity-85">Sign in as admin to add the first spot.</p>
            </div>
          )}
        </div>

        {/* ---- Area filter ---- */}
        <div className="flex flex-wrap items-center gap-2 border-t-2 border-ink bg-white px-6 py-4 sm:px-10">
          <span className={monoLabel}>Areas</span>
          <AreaPill label="All Seoul" active={district === 'all'} onClick={() => setDistrict('all')} />
          {DISTRICTS.map((d) => (
            <AreaPill key={d} label={d} active={district === d} onClick={() => setDistrict(d)} />
          ))}
        </div>

        {/* ---- Category filter ---- */}
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-t border-ink border-t-hairline bg-white px-6 py-4 sm:px-10">
          <span className={monoLabel}>Type</span>
          <button
            onClick={() => setCategory('all')}
            className={`${pill} ${category === 'all' ? 'bg-ink text-white' : 'border-[1.5px] border-outline text-[#3d3730]'}`}
          >
            All
          </button>
          {CATEGORY_LIST.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={pill}
              style={
                category === c.key
                  ? { background: '#1c1917', color: '#fff' }
                  : { background: c.bg, color: c.color }
              }
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* ---- Grid ---- */}
        <div className="bg-paper px-6 py-9 sm:px-10">
          {loading && <p className="py-16 text-center text-faint">Loading gallery…</p>}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load posts: {error}
            </div>
          )}
          {!loading && !error && gridPosts.length === 0 && (
            <p className="py-16 text-center text-faint">
              {posts.length === 0 ? 'No posts yet.' : 'No spots match these filters.'}
            </p>
          )}
          {!loading && !error && gridPosts.length > 0 && (
            <GalleryGrid posts={gridPosts} startNumber={2} />
          )}
        </div>
      </section>
    </div>
  )
}

function AreaPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${pill} ${active ? 'bg-ink text-white' : 'border-[1.5px] border-outline text-[#3d3730]'}`}
    >
      {label}
    </button>
  )
}
