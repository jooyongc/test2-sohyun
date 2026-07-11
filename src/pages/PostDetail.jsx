import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePost } from '../hooks/usePosts'
import { useRelatedPosts } from '../hooks/useRelatedPosts'
import { useAuth } from '../context/AuthContext'
import Lightbox from '../components/Lightbox'
import GalleryGrid from '../components/GalleryGrid'
import LikeButton from '../components/LikeButton'
import ShareButtons from '../components/ShareButtons'
import Comments from '../components/Comments'
import { getCategory } from '../lib/categories'

export default function PostDetail() {
  const { id } = useParams()
  const { post, loading, error } = usePost(id)
  const { related, sameDistrict } = useRelatedPosts(post)
  const { user } = useAuth()
  const [lightboxIndex, setLightboxIndex] = useState(null)

  if (loading) {
    return <div className="grid place-items-center py-24 text-faint">Loading…</div>
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted">Post not found.</p>
        <Link to="/" className="mt-4 inline-block text-brand hover:underline">
          ← Back to gallery
        </Link>
      </div>
    )
  }

  const cat = getCategory(post.category)
  const images = post.images?.length
    ? post.images
    : post.cover_image_url
      ? [post.cover_image_url]
      : []
  const hero = post.cover_image_url || images[0]

  const showAt = (i) => setLightboxIndex(i)
  const close = () => setLightboxIndex(null)
  const prev = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setLightboxIndex((i) => (i + 1) % images.length)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <article className="overflow-hidden rounded-xl border-2 border-ink bg-white shadow-page">
        {/* back bar */}
        <div className="flex items-center justify-between border-b-2 border-ink bg-white px-6 py-4 sm:px-9">
          <Link to="/" className="text-xs font-semibold hover:text-brand">
            ← Back to gallery
          </Link>
          {user && (
            <Link
              to={`/admin/edit/${post.id}`}
              className="rounded-full border-[1.5px] border-ink px-3.5 py-[6px] font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-ink hover:text-white"
            >
              Edit
            </Link>
          )}
        </div>

        {/* colored header band */}
        <header
          className="px-6 py-10 text-white sm:px-10"
          style={{ background: `linear-gradient(150deg, ${cat.color}, #1c1917)` }}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <span
              className="rounded-full bg-white px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{ color: cat.color }}
            >
              {cat.emoji} {cat.label}
            </span>
            {post.district && (
              <span className="rounded-full border-[1.5px] border-white/60 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
                📍 {post.district}
              </span>
            )}
          </div>
          <h1 className="m-0 max-w-[760px] text-[32px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-[44px]">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[13.5px] opacity-90">
            {post.location && <span>📍 {post.location}</span>}
            {post.location && <span className="opacity-50">·</span>}
            <span className="font-mono text-[11.5px]">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          {post.map_url && (
            <a
              href={post.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-[12px] font-semibold text-ink hover:bg-white"
            >
              🗺️ View on Google Maps ↗
            </a>
          )}
        </header>

        {/* hero photo */}
        {hero && (
          <div className="px-6 pt-8 sm:px-10">
            <button
              onClick={() => showAt(0)}
              className="block h-[300px] w-full overflow-hidden rounded-2xl border-[1.5px] border-ink sm:h-[420px]"
            >
              <img src={hero} alt={post.title} className="h-full w-full object-cover" />
            </button>
          </div>
        )}

        {/* body */}
        {post.content && (
          <div className="mx-auto max-w-[680px] px-6 pt-8 sm:px-10">
            <p className="m-0 whitespace-pre-wrap text-[16.5px] leading-[1.75] text-body">
              {post.content}
            </p>
          </div>
        )}

        {/* engagement */}
        <div className="mx-auto mt-7 flex max-w-[680px] flex-wrap items-center gap-3 px-6 sm:px-10">
          <LikeButton postId={post.id} />
          <ShareButtons title={post.title} />
        </div>

        {/* more posts — keep exploring the same area */}
        {related.length > 0 && (
          <div className="border-t border-hairline px-6 pb-4 pt-9 sm:px-10">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-ink">
                {sameDistrict ? `More in ${post.district}` : 'More stories'}
              </span>
              <Link to="/" className="text-xs text-neutral-500 hover:text-brand">
                All spots →
              </Link>
            </div>
            <div className="mt-4">
              <GalleryGrid posts={related} />
            </div>
          </div>
        )}

        {/* comments */}
        <div className="border-t-2 border-ink bg-paper px-6 py-8 sm:px-10">
          <Comments postId={post.id} />
        </div>
      </article>

      <Lightbox images={images} index={lightboxIndex} onClose={close} onPrev={prev} onNext={next} />
    </div>
  )
}
