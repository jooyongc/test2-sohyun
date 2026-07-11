import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ImageUploader from '../components/ImageUploader'

const EMPTY = {
  title: '',
  subtitle: '',
  description: '',
  price_label: '',
  gumroad_url: '',
  cover: [],
  published: true,
}

export default function ProductEditor() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else if (data)
          setForm({
            title: data.title ?? '',
            subtitle: data.subtitle ?? '',
            description: data.description ?? '',
            price_label: data.price_label ?? '',
            gumroad_url: data.gumroad_url ?? '',
            cover: data.cover_image_url ? [data.cover_image_url] : [],
            published: data.published ?? true,
          })
        setLoading(false)
      })
  }, [id, isEdit])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.gumroad_url.trim()) {
      setError('A Gumroad product URL is required.')
      return
    }
    setSaving(true)

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      description: form.description.trim() || null,
      price_label: form.price_label.trim() || null,
      gumroad_url: form.gumroad_url.trim(),
      cover_image_url: form.cover[0] ?? null,
      published: form.published,
    }

    const query = isEdit
      ? supabase.from('products').update(payload).eq('id', id)
      : supabase.from('products').insert(payload)

    const { error } = await query
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/admin/products')
  }

  if (loading) {
    return <div className="grid place-items-center py-24 text-neutral-400">Loading…</div>
  }

  const input =
    'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">{isEdit ? 'Edit guidebook' : 'New guidebook'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Title *</label>
          <input required value={form.title} onChange={update('title')} className={input} placeholder="e.g. The Hongdae Cafe Handbook" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Subtitle</label>
          <input value={form.subtitle} onChange={update('subtitle')} className={input} placeholder="e.g. 40 spots, 6 walking routes" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea rows={4} value={form.description} onChange={update('description')} className={input} placeholder="What's inside the e-book…" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Price label</label>
            <input value={form.price_label} onChange={update('price_label')} className={input} placeholder="e.g. $12 (display only)" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="h-4 w-4 accent-brand"
              />
              Published (visible on the Guidebook page)
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Gumroad product URL *</label>
          <input
            type="url"
            required
            value={form.gumroad_url}
            onChange={update('gumroad_url')}
            className={input}
            placeholder="https://yourname.gumroad.com/l/your-product"
          />
          <p className="mt-1 text-xs text-neutral-400">
            The “Buy on Gumroad” button links here (opens the Gumroad overlay checkout).
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Cover image</label>
          <p className="mb-2 text-xs text-neutral-400">The first image is used as the cover.</p>
          <ImageUploader value={form.cover} onChange={(cover) => setForm((f) => ({ ...f, cover }))} />
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
            onClick={() => navigate('/admin/products')}
            className="rounded-md border border-neutral-300 px-4 py-2 hover:bg-neutral-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
