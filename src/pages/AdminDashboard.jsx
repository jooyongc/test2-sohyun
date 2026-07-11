import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { usePosts } from '../hooks/usePosts'

export default function AdminDashboard() {
  const { posts, loading, error, refetch } = usePosts()

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) {
      alert(`Delete failed: ${error.message}`)
      return
    }
    refetch()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/products"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            📕 Guidebooks
          </Link>
          <Link
            to="/admin/ai"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            ✨ AI
          </Link>
          <Link
            to="/admin/new"
            className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            + New Post
          </Link>
        </div>
      </div>

      {loading && <p className="mt-8 text-neutral-400">Loading…</p>}
      {error && <p className="mt-8 text-red-600">{error}</p>}

      {!loading && posts.length === 0 && (
        <p className="mt-8 text-neutral-400">No posts yet. Create your first one.</p>
      )}

      <ul className="mt-6 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {posts.map((post) => (
          <li key={post.id} className="flex items-center gap-4 p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
              {(post.cover_image_url || post.images?.[0]) && (
                <img
                  src={post.cover_image_url || post.images[0]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{post.title}</p>
              <p className="truncate text-sm text-neutral-400">
                {post.location ? `${post.location} · ` : ''}
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex shrink-0 gap-2 text-sm">
              <Link
                to={`/posts/${post.id}`}
                className="rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100"
              >
                View
              </Link>
              <Link
                to={`/admin/edit/${post.id}`}
                className="rounded-md border border-neutral-300 px-2 py-1 hover:bg-neutral-100"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(post)}
                className="rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
