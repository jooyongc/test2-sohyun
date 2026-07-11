import { useLikes } from '../hooks/useLikes'

export default function LikeButton({ postId }) {
  const { count, liked, loading, toggle } = useLikes(postId)

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-[11px] text-[13px] font-bold transition disabled:opacity-50 ${
        liked ? 'bg-brand text-white' : 'border-[1.5px] border-ink text-ink hover:bg-brand/5'
      }`}
    >
      <span className="text-[15px] leading-none">{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
      <span className="sr-only">likes</span>
    </button>
  )
}
