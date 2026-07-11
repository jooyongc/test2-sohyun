import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
            H
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Hongdae <span className="text-brand">Travel</span>
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-neutral-600 hover:text-neutral-900">
            Gallery
          </Link>
          {user ? (
            <>
              <Link to="/admin" className="text-neutral-600 hover:text-neutral-900">
                Dashboard
              </Link>
              <Link
                to="/admin/new"
                className="rounded-md bg-brand px-3 py-1.5 font-medium text-white hover:bg-brand-dark"
              >
                New Post
              </Link>
              <button
                onClick={handleSignOut}
                className="text-neutral-500 hover:text-neutral-900"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="text-neutral-600 hover:text-neutral-900">
              Admin
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
