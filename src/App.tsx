import React, { useState, useEffect, ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AIFloatingWidget from '@/components/AIFloatingWidget'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ListingsPage from '@/pages/ListingsPage'
import ListingDetailPage from '@/pages/ListingDetailPage'
import ChatPage from '@/pages/ChatPage'
import UserProfilePage from '@/pages/UserProfilePage'
import SellerCreateListingPage from '@/pages/seller/CreateListingPage'
import SellerMyListingsPage from '@/pages/seller/MyListingsPage'
import SellerEditListingPage from '@/pages/seller/EditListingPage'
import BrokerRequestsPage from '@/pages/broker/RequestsPage'
import AdminModerationPage from '@/pages/admin/ModerationPage'
import AdminRevenuePage from '@/pages/admin/RevenuePage'
import AdminUserManagementPage from '@/pages/admin/UserManagementPage'

import UserFavoritesPage from '@/pages/user/FavoritesPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import TestPage from './TestPage'

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('React Error Boundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Đã xảy ra lỗi</h1>
            <p className="text-gray-700 mb-4">{this.state.error?.message}</p>
            <details className="text-sm text-gray-500 mb-4">
              <summary className="cursor-pointer font-bold mb-2">Chi tiết lỗi</summary>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-48">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function AppContent({ isAuthenticated, setIsAuthenticated }: { isAuthenticated: boolean; setIsAuthenticated: (v: boolean) => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const user = authService.getCurrentUser()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin' && !isAdminRoute) {
        // Admin trying to access non-admin page -> redirect to dashboard
        navigate('/admin')
      } else if (user.role !== 'admin' && isAdminRoute) {
        // Non-admin trying to access admin page -> redirect home
        navigate('/')
      }
    }
  }, [isAuthenticated, user, isAdminRoute, navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminRoute && <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}
      <Routes>
        {/* Test Route */}
        <Route path="/test-css" element={<TestPage />} />

        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<SignupPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />

        {/* Chat Route */}
        <Route path="/messages/:id" element={<ChatPage />} />

        {/* User Routes */}
        <Route path="/user/profile" element={<UserProfilePage />} />
        <Route path="/profile" element={<UserProfilePage />} />

        <Route path="/user/favorites" element={<UserFavoritesPage />} />
        <Route path="/favorite" element={<UserFavoritesPage />} />
        <Route path="/favorites" element={<UserFavoritesPage />} />

        {/* Seller Routes (kept for backward compatibility) */}
        <Route path="/seller/create-listing" element={<SellerCreateListingPage />} />
        <Route path="/seller/my-listings" element={<SellerMyListingsPage />} />
        <Route path="/seller/:id/edit" element={<SellerEditListingPage />} />

        {/* User Listing Routes (new unified paths) */}
        <Route path="/create-listing" element={<SellerCreateListingPage />} />
        <Route path="/my-listings" element={<SellerMyListingsPage />} />
        <Route path="/edit-listing/:id" element={<SellerEditListingPage />} />

        {/* Broker Routes */}
        <Route path="/broker/requests" element={<BrokerRequestsPage />} />

        {/* Admin Routes — standalone layout, no Navbar/Footer */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/moderation" element={<AdminModerationPage />} />
        <Route path="/admin/revenue" element={<AdminRevenuePage />} />
        <Route path="/admin/users" element={<AdminUserManagementPage />} />
      </Routes>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <AIFloatingWidget />}
    </div>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return authService.isAuthenticated()
    } catch (e) {
      console.error('Error in authService.isAuthenticated():', e)
      return false
    }
  })

  useEffect(() => {
    try {
      console.log('App mounted')
      setIsAuthenticated(authService.isAuthenticated())
    } catch (e) {
      console.error('Error in useEffect:', e)
    }
  }, [])

  return (
    <ErrorBoundary>
      <Router>
        <AppContent isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      </Router>
    </ErrorBoundary>
  )
}

export default App
