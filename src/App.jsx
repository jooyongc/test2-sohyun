import { Routes, Route } from 'react-router-dom'
import TopBanner from './components/TopBanner'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import PostEditor from './pages/PostEditor'
import AiConsole from './pages/AiConsole'
import Guidebook from './pages/Guidebook'
import ProductsAdmin from './pages/ProductsAdmin'
import ProductEditor from './pages/ProductEditor'
import SubscribersAdmin from './pages/SubscribersAdmin'

export default function App() {
  return (
    <div className="min-h-screen">
      <TopBanner />
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/guidebook" element={<Guidebook />} />
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
          <Route
            path="/admin/ai"
            element={
              <ProtectedRoute>
                <AiConsole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <ProductsAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <ProtectedRoute>
                <ProductEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <ProtectedRoute>
                <ProductEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscribers"
            element={
              <ProtectedRoute>
                <SubscribersAdmin />
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
