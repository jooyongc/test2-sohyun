import { useState } from 'react'

// SNS sharing. On mobile the native share sheet (navigator.share) exposes all
// installed apps — KakaoTalk, Instagram, etc. Explicit X / Facebook / Copy-link
// buttons are the desktop fallback.
export default function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '')
  const text = title ? `${title} — Hongdae Travel` : 'Hongdae Travel'

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  const nativeShare = async () => {
    try {
      await navigator.share({ title: text, url: shareUrl })
    } catch {
      /* user cancelled — ignore */
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text,
  )}&url=${encodeURIComponent(shareUrl)}`
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`

  const btn =
    'inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canNativeShare && (
        <button onClick={nativeShare} className={btn} aria-label="Share">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
          </svg>
          Share
        </button>
      )}

      <a href={xUrl} target="_blank" rel="noopener noreferrer" className={btn}>
        <span className="font-bold">X</span>
      </a>

      <a href={fbUrl} target="_blank" rel="noopener noreferrer" className={btn}>
        Facebook
      </a>

      <button onClick={copyLink} className={btn}>
        {copied ? '✓ Copied' : 'Copy link'}
      </button>
    </div>
  )
}
