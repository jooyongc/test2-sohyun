import { Link } from 'react-router-dom'
import { getCategory, gradient } from '../lib/categories'

// Editorial color-block card. `number` is the 1-based index shown as 02, 03…
export default function PostCard({ post, number }) {
  const cat = getCategory(post.category)
  const cover = post.cover_image_url || post.images?.[0]
  const num = String(number ?? 1).padStart(2, '0')

  return (
    <Link
      to={`/posts/${post.id}`}
      className="group block overflow-hidden rounded-xl border-[1.5px] border-ink bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.4)]"
    >
      <div className="relative" style={{ background: gradient(cat) }}>
        {cover ? (
          <img src={cover} alt={post.title} loading="lazy" className="block w-full object-cover" />
        ) : (
          <div className="h-52 w-full" />
        )}

        {/* category badge */}
        <span
          className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: cat.color }}
        >
          {cat.emoji} {cat.label}
        </span>

        {/* big number */}
        <span
          className="absolute bottom-2 right-3.5 font-mono text-[30px] font-bold leading-none"
          style={{ color: cat.color, opacity: 0.5 }}
        >
          {num}
        </span>
      </div>

      <div className="px-4 pb-[18px] pt-4">
        <h3 className="text-[18px] font-bold leading-[1.15] tracking-[-0.01em] text-ink">
          {post.title}
        </h3>
        {(post.location || post.district) && (
          <p className="mt-2 text-[12.5px] text-[#8b8178]">
            📍 {post.location || post.district}
          </p>
        )}
      </div>
    </Link>
  )
}
