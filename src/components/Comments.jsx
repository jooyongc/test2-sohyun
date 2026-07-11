import { useState } from 'react'
import { useComments } from '../hooks/useComments'
import { useAuth } from '../context/AuthContext'

export default function Comments({ postId }) {
  const { comments, loading, error, addComment, deleteComment } = useComments(postId)
  const { user } = useAuth() // admin can delete comments
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !body.trim()) return
    setSubmitting(true)
    setFormError(null)
    const { error } = await addComment({ author_name: name.trim(), body: body.trim() })
    setSubmitting(false)
    if (error) {
      setFormError(error.message)
      return
    }
    setBody('')
  }

  return (
    <section className="mt-12 border-t border-neutral-200 pt-8">
      <h2 className="text-lg font-semibold">
        Comments {comments.length > 0 && <span className="text-neutral-400">({comments.length})</span>}
      </h2>

      {/* Comment form (open to any visitor) */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={40}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:w-64"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a comment…"
          rows={3}
          maxLength={2000}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? 'Posting…' : 'Post comment'}
        </button>
      </form>

      {/* List */}
      <div className="mt-8 space-y-5">
        {loading && <p className="text-sm text-neutral-400">Loading comments…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-neutral-400">No comments yet. Be the first!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm">
                <span className="font-semibold">{c.author_name}</span>{' '}
                <span className="text-neutral-400">
                  · {new Date(c.created_at).toLocaleDateString()}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">{c.body}</p>
            </div>
            {user && (
              <button
                onClick={() => deleteComment(c.id)}
                className="shrink-0 text-xs text-neutral-400 hover:text-red-600"
                aria-label="Delete comment"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
