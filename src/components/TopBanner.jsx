import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { subscribeEmail } from '../lib/subscribe'

const KEY = 'checklist_banner'

// Full-width top strip: "First time in Seoul? Get the free checklist by email."
// Captures the email into Supabase. Hides after subscribe/dismiss (localStorage).
export default function TopBanner() {
  const { pathname } = useLocation()
  const [hidden, setHidden] = useState(() => {
    try {
      return !!localStorage.getItem(KEY)
    } catch {
      return false
    }
  })
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | dup | error

  if (pathname !== '/') return null // home page only
  if (hidden) return null

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, 'dismissed')
    } catch {
      /* ignore */
    }
    setHidden(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return
    setStatus('loading')
    const r = await subscribeEmail(email, 'top-banner')
    if (r.ok || r.duplicate) {
      try {
        localStorage.setItem(KEY, 'subscribed')
      } catch {
        /* ignore */
      }
      setStatus(r.ok ? 'done' : 'dup')
    } else {
      setStatus('error')
    }
  }

  const subscribed = status === 'done' || status === 'dup'

  return (
    <div className="relative w-full bg-brand text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-10 py-2.5 text-center text-[13px]">
        {subscribed ? (
          <span className="font-semibold">
            {status === 'done'
              ? "✅ You're in! We'll email your free Seoul travel checklist shortly."
              : "You're already on the list — thank you! 🙌"}
          </span>
        ) : (
          <>
            <span className="font-semibold">
              First time in Seoul?{' '}
              <span className="font-normal opacity-90">
                Get our free Seoul travel checklist by email.
              </span>
            </span>
            <form onSubmit={submit} className="flex items-center gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-44 rounded-full border-0 px-3 py-1.5 text-[13px] text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white sm:w-52"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                {status === 'loading' ? '…' : 'Get it free'}
              </button>
            </form>
            {status === 'error' && (
              <span className="text-white/90">Something went wrong. Please try again.</span>
            )}
          </>
        )}
      </div>
      <button
        onClick={dismiss}
        aria-label="Close"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none text-white/80 hover:text-white"
      >
        ×
      </button>
    </div>
  )
}
