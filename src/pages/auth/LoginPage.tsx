import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '@/services/auth'

interface LoginPageProps {
  setIsAuthenticated: (value: boolean) => void
}

export default function LoginPage({ setIsAuthenticated }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Vui lòng điền tất cả các trường')
      return
    }

    setLoading(true)
    try {
      const result = await authService.login(email, password)
      if (result.success) {
        setIsAuthenticated(true)
        navigate('/')
      } else {
        setError(result.error?.message || 'Đăng nhập thất bại')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left side — decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 items-center justify-center p-12">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/5 rounded-full blur-2xl" />

        <div className="relative text-center max-w-md">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20 mb-8">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Chào mừng trở lại!
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Đăng nhập để truy cập hàng nghìn tin đăng bất động sản,
            nhận gợi ý AI thông minh và quản lý tài khoản của bạn.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            {['AI Gợi ý', 'Tin xác minh', 'Chat trực tiếp'].map((text) => (
              <span
                key={text}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-200/50">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <span className="text-lg font-extrabold text-gray-900">
              Smart<span className="text-amber-500">Estate</span>
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Đăng nhập
            </h1>
            <p className="mt-2 text-gray-500 text-sm">
              Nhập thông tin tài khoản của bạn để tiếp tục
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-500 text-sm">✕</span>
              </div>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="m2 7 10 6 10-6" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 focus:bg-white transition-all duration-200"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 focus:bg-white transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="#" className="text-xs text-amber-500 hover:text-amber-600 font-medium transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-amber-200/50 hover:shadow-amber-300/50 hover:-translate-y-0.5 active:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">HOẶC</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link to="/signup" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
