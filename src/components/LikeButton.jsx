import { useLikes } from '../hooks/useLikes'

export default function LikeButton({ postId }) {
  const { count, liked, loading, toggle } = useLikes(postId)

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
        liked
          ? 'border-brand bg-brand/10 text-brand'
          : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 21s-7.5-4.9-10-9.5C.5 8.2 2 5 5.2 5c1.9 0 3.2 1 3.8 2C9.6 6 10.9 5 12.8 5 16 5 17.5 8.2 16 11.5 13.5 16.1 12 21 12 21z" />
      </svg>
      <span>{count}</span>
      <span className="sr-only">likes</span>
    </button>
  )
}
