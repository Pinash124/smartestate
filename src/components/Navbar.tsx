import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth'

interface NavbarProps {
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
}

export default function Navbar({ isAuthenticated, setIsAuthenticated }: NavbarProps) {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const role = authService.getCurrentRole()

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    navigate('/')
  }

  const renderMenuByRole = () => {
    switch (role) {
      case 'admin':
        return (
          <>
            <Link to="/admin/moderation" className="text-gray-600 hover:text-amber-600 font-medium transition">
              Duyệt tin
            </Link>
            <Link to="/admin/revenue" className="text-gray-600 hover:text-amber-600 font-medium transition">
              Doanh thu
            </Link>
            <Link to="/admin/users" className="text-gray-600 hover:text-amber-600 font-medium transition">
              Người dùng
            </Link>
          </>
        )
      case 'broker':
        return (
          <>
            <Link to="/listings" className="text-gray-600 hover:text-amber-600 font-medium transition">
              Tin đăng
            </Link>
            <Link to="/broker/requests" className="text-gray-600 hover:text-amber-600 font-medium transition">
              Yêu cầu takeover
            </Link>
          </>
        )
      case 'seller':
        return (
          <>
            <Link to="/seller/create-listing" className="text-gray-600 hover:text-amber-600 font-medium transition">
              Đăng tin mới
            </Link>
            <Link to="/seller/my-listings" className="text-gray-600 hover:text-amber-600 font-medium transition">
              Tin của tôi
            </Link>
          </>
        )
      case 'user':
        return (
          <>
            <Link to="/listings" className="text-gray-600 hover:text-amber-600 font-medium transition">
              Tin đăng
            </Link>
            <Link to="/user/ai-recommend" className="text-gray-600 hover:text-amber-600 font-medium transition">
              AI Recommend
            </Link>
          </>
        )
      default:
        return (
          <>
            <Link to="/listings" className="text-gray-600 hover:text-amber-600 font-medium transition">
              Tin đăng
            </Link>
          </>
        )
    }
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Smart Estate</span>
          </Link>

          {/* Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-amber-600 font-medium transition">
              Trang chủ
            </Link>
            {renderMenuByRole()}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/user/profile"
                  className="text-gray-600 hover:text-amber-600 font-medium transition"
                  title="Hồ sơ cá nhân"
                >
                  👤 {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-amber-600 font-medium transition hidden sm:block"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/signup"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
