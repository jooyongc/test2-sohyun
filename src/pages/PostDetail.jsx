import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePost } from '../hooks/usePosts'
import { useAuth } from '../context/AuthContext'
import Lightbox from '../components/Lightbox'
import LikeButton from '../components/LikeButton'
import ShareButtons from '../components/ShareButtons'
import Comments from '../components/Comments'

export default function PostDetail() {
  const { id } = useParams()
  const { post, loading, error } = usePost(id)
  const { user } = useAuth()
  const [lightboxIndex, setLightboxIndex] = useState(null)

  if (loading) {
    return <div className="grid place-items-center py-24 text-neutral-400">Loading…</div>
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-neutral-500">Post not found.</p>
        <Link to="/" className="mt-4 inline-block text-brand hover:underline">
          ← Back to gallery
        </Link>
      </div>
    )
  }

  const images = post.images?.length
    ? post.images
    : post.cover_image_url
      ? [post.cover_image_url]
      : []

  const showAt = (i) => setLightboxIndex(i)
  const close = () => setLightboxIndex(null)
  const prev = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setLightboxIndex((i) => (i + 1) % images.length)

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to gallery
      </Link>

      <header className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          {post.location && <p className="mt-1 text-brand">📍 {post.location}</p>}
          <p className="mt-1 text-sm text-neutral-400">
            {new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        {user && (
          <Link
            to={`/admin/edit/${post.id}`}
            className="shrink-0 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            Edit
          </Link>
        )}
      </header>

      {post.content && (
        <p className="mt-4 whitespace-pre-wrap leading-relaxed text-neutral-700">
          {post.content}
        </p>
      )}

      {/* Engagement: like + SNS share */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-neutral-200 py-4">
        <LikeButton postId={post.id} />
        <ShareButtons title={post.title} />
      </div>

      {images.length > 0 && (
        <div className="masonry mt-6 columns-1 sm:columns-2">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => showAt(i)}
              className="block w-full overflow-hidden rounded-lg ring-1 ring-neutral-200"
            >
              <img
                src={src}
                alt={`${post.title} ${i + 1}`}
                loading="lazy"
                className="w-full object-cover transition hover:opacity-90"
              />
            </button>
          ))}
        </div>
      )}

      <Lightbox
        images={images}
        index={lightboxIndex}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />

      <Comments postId={post.id} />
    </article>
  )
}
