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
import UserProfilePage from '@/pages/UserProfilePage'
import SellerCreateListingPage from '@/pages/seller/CreateListingPage'
import SellerMyListingsPage from '@/pages/seller/MyListingsPage'
import SellerEditListingPage from '@/pages/seller/EditListingPage'
import BrokerRequestsPage from '@/pages/broker/RequestsPage'
import AdminModerationPage from '@/pages/admin/ModerationPage'
import AdminRevenuePage from '@/pages/admin/RevenuePage'
import AdminUserManagementPage from '@/pages/admin/UserManagementPage'
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

        {/* User Routes */}
        <Route path="/user/profile" element={<UserProfilePage />} />
        <Route path="/user/ai-recommend" element={<UserAIRecommendPage />} />

        {/* Seller Routes */}
        <Route path="/seller/create-listing" element={<SellerCreateListingPage />} />
        <Route path="/seller/my-listings" element={<SellerMyListingsPage />} />
        <Route path="/seller/:id/edit" element={<SellerEditListingPage />} />

        {/* Broker Routes */}
        <Route path="/broker/requests" element={<BrokerRequestsPage />} />

        {/* Admin Routes */}
        <Route path="/admin/moderation" element={<AdminModerationPage />} />
        <Route path="/admin/revenue" element={<AdminRevenuePage />} />
        <Route path="/admin/users" element={<AdminUserManagementPage />} />

        {/* Test Route */}
        <Route path="/test-data" element={<TestDataPage />} />
      </Routes>
    </Router>
  )
}

export default App

