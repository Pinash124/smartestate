import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '@/services/auth'
import { UserRole } from '@/types'

interface SignupPageProps {
  setIsAuthenticated: (value: boolean) => void
}

const ROLES: { value: UserRole; label: string; icon: string; desc: string }[] = [
  { value: 'user', label: 'Người dùng', icon: 'U', desc: 'Tìm kiếm & mua bất động sản' },
  { value: 'seller', label: 'Người bán', icon: 'S', desc: 'Đăng tin bán bất động sản' },
  { value: 'broker', label: 'Môi giới', icon: 'B', desc: 'Quản lý & môi giới BĐS' },
]

export default function SignupPage({ setIsAuthenticated }: SignupPageProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Vui lòng điền tất cả các trường')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)
    try {
      const result = await authService.register(name, email, password, role)
      if (result.success) {
        setIsAuthenticated(true)
        navigate('/')
      } else {
        setError(result.error?.message || 'Đăng ký thất bại')
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
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 items-center justify-center p-12">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-orange-500/8 rounded-full blur-3xl" />

        <div className="relative text-center max-w-md">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20 mb-8">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Bắt đầu ngay hôm nay!
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Tạo tài khoản miễn phí để truy cập đầy đủ tính năng:
            đăng tin, AI gợi ý, chat trực tiếp và nhiều hơn nữa.
          </p>

          {/* Steps */}
          <div className="mt-10 space-y-4 text-left">
            {[
              { step: '01', text: 'Tạo tài khoản miễn phí' },
              { step: '02', text: 'Chọn vai trò phù hợp' },
              { step: '03', text: 'Bắt đầu khám phá BĐS' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold flex-shrink-0">
                  {item.step}
                </span>
                <span className="text-gray-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — register form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center px-4 sm:px-8 py-10 bg-white">
        <div className="w-full max-w-lg">
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
              Tạo tài khoản
            </h1>
            <p className="mt-2 text-gray-500 text-sm">
              Điền thông tin bên dưới để đăng ký tài khoản mới
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
            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 focus:bg-white transition-all duration-200"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

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
            </div>

            {/* Password row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="Tối thiểu 6 ký tự"
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

              {/* Confirm password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 focus:bg-white transition-all duration-200"
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">
                Bạn muốn đăng ký với vai trò gì?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`relative p-3 sm:p-4 rounded-xl border-2 text-center transition-all duration-200 ${role === r.value
                      ? 'border-amber-400 bg-amber-50 shadow-md shadow-amber-100/50'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'
                      }`}
                  >
                    {role === r.value && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div className="text-2xl mb-1.5">{r.icon}</div>
                    <p className={`text-xs sm:text-sm font-semibold ${role === r.value ? 'text-amber-700' : 'text-gray-700'}`}>
                      {r.label}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 hidden sm:block">{r.desc}</p>
                  </button>
                ))}
              </div>
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
                  Đang tạo tài khoản...
                </span>
              ) : (
                'Tạo tài khoản'
              )}
            </button>

            {/* Terms notice */}
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <span className="text-amber-500 cursor-pointer hover:underline">Điều khoản dịch vụ</span> và{' '}
              <span className="text-amber-500 cursor-pointer hover:underline">Chính sách bảo mật</span>
            </p>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">ĐÃ CÓ TÀI KHOẢN?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login link */}
          <Link
            to="/login"
            className="block w-full text-center py-3 border-2 border-gray-200 hover:border-amber-300 rounded-xl text-sm font-semibold text-gray-700 hover:text-amber-600 transition-all duration-200"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
