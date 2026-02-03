import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { authService } from '@/services/auth'
import Navbar from '@/components/Navbar'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ListingsPage from '@/pages/ListingsPage'
import ListingDetailPage from '@/pages/ListingDetailPage'
import ChatPage from '@/pages/ChatPage'
import SellerCreateListingPage from '@/pages/seller/CreateListingPage'
import SellerMyListingsPage from '@/pages/seller/MyListingsPage'
import AdminModerationPage from '@/pages/admin/ModerationPage'
import AdminRevenuePage from '@/pages/admin/RevenuePage'
import UserAIRecommendPage from '@/pages/user/AIRecommendPage'
import TestDataPage from '@/pages/TestDataPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())

  useEffect(() => {
    // Kiểm tra xem người dùng có đăng nhập không khi tải lại trang
    setIsAuthenticated(authService.isAuthenticated())
  }, [])

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<SignupPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />

        {/* Chat Route */}
        <Route path="/messages/:id" element={<ChatPage />} />

        {/* Seller Routes */}
        <Route path="/seller/create-listing" element={<SellerCreateListingPage />} />
        <Route path="/seller/my-listings" element={<SellerMyListingsPage />} />

        {/* User Routes */}
        <Route path="/user/ai-recommend" element={<UserAIRecommendPage />} />

        {/* Admin Routes */}
        <Route path="/admin/moderation" element={<AdminModerationPage />} />
        <Route path="/admin/revenue" element={<AdminRevenuePage />} />

        {/* Test Route */}
        <Route path="/test-data" element={<TestDataPage />} />
      </Routes>
    </Router>
  )
}

export default App

