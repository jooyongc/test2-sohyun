import { Link } from 'react-router-dom'

// A single gallery card. Uses the cover image (or first gallery image) as the visual.
export default function PostCard({ post }) {
  const cover = post.cover_image_url || post.images?.[0]
  const extraCount = (post.images?.length ?? 0) - 1

  return (
    <Link
      to={`/posts/${post.id}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 transition hover:shadow-md"
    >
      <div className="relative">
        {cover ? (
          <img
            src={cover}
            alt={post.title}
            loading="lazy"
            className="w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100 text-neutral-400">
            No image
          </div>
        )}
        {extraCount > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            +{extraCount}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 font-semibold text-neutral-900">{post.title}</h3>
        {post.location && (
          <p className="mt-0.5 line-clamp-1 text-sm text-brand">📍 {post.location}</p>
        )}
        {post.content && (
          <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{post.content}</p>
        )}
      </div>
    </Link>
  )
}
