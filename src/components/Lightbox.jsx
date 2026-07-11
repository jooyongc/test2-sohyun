import { useEffect } from 'react'

// Fullscreen image viewer with prev/next. `index` is the active image;
// pass null-ish index to hide. Navigation is handled by the parent.
export default function Lightbox({ images, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  if (index === null || index === undefined) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        className="absolute right-4 top-4 text-3xl leading-none text-white/80 hover:text-white"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>

      {images.length > 1 && (
        <button
          className="absolute left-4 text-4xl text-white/70 hover:text-white"
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          aria-label="Previous"
        >
          ‹
        </button>
      )}

      <img
        src={images[index]}
        alt={`Image ${index + 1}`}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <button
          className="absolute right-4 text-4xl text-white/70 hover:text-white"
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          aria-label="Next"
        >
          ›
        </button>
      )}

      <span className="absolute bottom-4 text-sm text-white/70">
        {index + 1} / {images.length}
      </span>
    </div>
  )
}
