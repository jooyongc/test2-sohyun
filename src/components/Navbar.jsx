import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wordmark: "LOVE and SEOUL" with SEOUL in rose (per design handoff).
function Wordmark({ size = 18 }) {
  return (
    <span className="font-bold tracking-[-0.02em]" style={{ fontSize: size }}>
      LOVE and <span className="text-brand">SEOUL</span>
    </span>
  )
}

const pillBase = 'rounded-full px-3.5 py-[7px] text-xs font-semibold transition'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-20 border-b-2 border-ink bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-brand text-[15px] font-bold text-white">
            ♥
          </span>
          <Wordmark />
        </Link>

        {/* Pill nav */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${pillBase} ${isActive ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`
            }
          >
            Gallery
          </NavLink>

          <NavLink
            to="/guidebook"
            className={({ isActive }) =>
              `${pillBase} ${isActive ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`
            }
          >
            Guidebook
          </NavLink>

          {/* Design nav placeholders (no pages yet) */}
          <span className={`${pillBase} text-faint cursor-default`}>About</span>

          {user ? (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `${pillBase} ${isActive ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`
                }
              >
                Dashboard
              </NavLink>
              <Link
                to="/admin/new"
                className={`${pillBase} bg-brand text-white hover:bg-brand-dark`}
              >
                New Post
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-full border-[1.5px] border-ink px-3.5 py-[6px] font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-ink hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full border-[1.5px] border-ink px-3.5 py-[6px] font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-ink hover:text-white"
            >
              Admin
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
