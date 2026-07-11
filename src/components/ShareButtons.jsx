import { useState } from 'react'

// SNS sharing. On mobile the native share sheet (navigator.share) exposes all
// installed apps — KakaoTalk, Instagram, etc. Explicit X / Facebook / Copy-link
// buttons are the desktop fallback. Styled as outline pills per design.
export default function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '')
  const text = title ? `${title} — LoveandSeoul` : 'LoveandSeoul'

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

  const pill =
    'inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink px-5 py-[11px] text-[13px] font-semibold text-ink transition hover:bg-ink hover:text-white'

  return (
    <div className="flex flex-wrap items-center gap-3">
      {canNativeShare && (
        <button onClick={nativeShare} className={pill} aria-label="Share">
          Share ↗
        </button>
      )}
      <a href={xUrl} target="_blank" rel="noopener noreferrer" className={pill}>
        <span className="font-bold">X</span>
      </a>
      <a href={fbUrl} target="_blank" rel="noopener noreferrer" className={pill}>
        Facebook
      </a>
      <button onClick={copyLink} className={pill}>
        {copied ? '✓ Copied' : 'Copy link'}
      </button>
    </div>
  )
}
