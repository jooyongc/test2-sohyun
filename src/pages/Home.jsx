import GalleryGrid from '../components/GalleryGrid'
import { usePosts } from '../hooks/usePosts'

export default function Home() {
  const { posts, loading, error } = usePosts()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Hongdae <span className="text-brand">Travel</span>
        </h1>
        <p className="mt-2 max-w-2xl text-neutral-500">
          A gallery of places, food, and moments around Hongdae, Seoul.
        </p>
      </section>

      {loading && (
        <div className="grid place-items-center py-24 text-neutral-400">Loading gallery…</div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load posts: {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="grid place-items-center rounded-xl border border-dashed border-neutral-300 py-24 text-center text-neutral-400">
          <p>No posts yet.</p>
          <p className="text-sm">Sign in as admin to add the first gallery post.</p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && <GalleryGrid posts={posts} />}
    </div>
  )
}
