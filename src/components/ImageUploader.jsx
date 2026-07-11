import { useState } from 'react'
import { supabase, IMAGE_BUCKET } from '../lib/supabase'

// Uploads selected files to Supabase Storage and returns their public URLs
// via onUploaded(urls). `value` is the current array of image URLs.
export default function ImageUploader({ value = [], onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setError(null)
    setUploading(true)

    try {
      const uploaded = []
      for (const file of files) {
        const ext = file.name.split('.').pop()
        // Unique-ish key without Date.now/random: timestamp-free path using crypto.
        const key = `${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(key, file, { cacheControl: '3600', upsert: false })
        if (upErr) throw upErr

        const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(key)
        uploaded.push(data.publicUrl)
      }
      onChange([...value, ...uploaded])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = '' // allow re-selecting the same file
    }
  }

  const removeAt = (i) => {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100">
          {uploading ? 'Uploading…' : 'Add images'}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={uploading}
            onChange={handleFiles}
          />
        </label>
        <span className="text-sm text-neutral-400">{value.length} image(s)</span>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url, i) => (
            <div key={url + i} className="group relative overflow-hidden rounded-md ring-1 ring-neutral-200">
              <img src={url} alt={`upload ${i + 1}`} className="aspect-square w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 hidden rounded bg-black/60 px-1.5 text-xs text-white group-hover:block"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
