import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import PostEditor from './pages/PostEditor'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />

          {/* Admin (protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/new"
            element={
              <ProtectedRoute>
                <PostEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              <ProtectedRoute>
                <PostEditor />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="mx-auto max-w-3xl px-4 py-24 text-center text-neutral-500">
                Page not found.
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="mt-12 border-t border-neutral-200 py-8 text-center text-sm text-neutral-400">
        LoveandSeoul · Built with React, Vite & Supabase
      </footer>
    </div>
  )
}
