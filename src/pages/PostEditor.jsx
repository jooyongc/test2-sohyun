import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ImageUploader from '../components/ImageUploader'

const EMPTY = { title: '', location: '', content: '', images: [] }

export default function PostEditor() {
  const { id } = useParams() // present when editing
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Load existing post when editing.
  useEffect(() => {
    if (!isEdit) return
    supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else if (data)
          setForm({
            title: data.title ?? '',
            location: data.location ?? '',
            content: data.content ?? '',
            images: data.images ?? [],
          })
        setLoading(false)
      })
  }, [id, isEdit])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload = {
      title: form.title.trim(),
      location: form.location.trim() || null,
      content: form.content.trim() || null,
      images: form.images,
      cover_image_url: form.images[0] ?? null,
    }

    const query = isEdit
      ? supabase.from('posts').update(payload).eq('id', id)
      : supabase.from('posts').insert(payload)

    const { error } = await query
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/admin')
  }

  if (loading) {
    return <div className="grid place-items-center py-24 text-neutral-400">Loading…</div>
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">{isEdit ? 'Edit post' : 'New post'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Title *</label>
          <input
            required
            value={form.title}
            onChange={update('title')}
            placeholder="e.g. Sunset at Hongdae Playground"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <input
            value={form.location}
            onChange={update('location')}
            placeholder="e.g. Hongik University Station Exit 9"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            rows={5}
            value={form.content}
            onChange={update('content')}
            placeholder="Tell the story behind these photos…"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Gallery images</label>
          <p className="mb-2 text-xs text-neutral-400">The first image is used as the cover.</p>
          <ImageUploader
            value={form.images}
            onChange={(images) => setForm((f) => ({ ...f, images }))}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="rounded-md border border-neutral-300 px-4 py-2 hover:bg-neutral-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
