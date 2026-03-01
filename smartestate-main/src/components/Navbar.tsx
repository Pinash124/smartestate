import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@/services/auth'

interface NavbarProps {
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
}

export default function Navbar({ isAuthenticated, setIsAuthenticated }: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = authService.getCurrentUser()
  const role = authService.getCurrentRole()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setMobileOpen(false)
    setUserMenuOpen(false)
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path

  const linkClass = (path: string) =>
    `relative text-sm font-medium transition-colors duration-200 py-1 ${isActive(path)
      ? 'text-amber-600'
      : 'text-gray-600 hover:text-amber-600'
    }`

  const activeDot = (path: string) =>
    isActive(path)
      ? 'after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-amber-500 after:rounded-full'
      : ''

  /* ─── Main Menu Items (Desktop) ─── */
  const renderMenuItems = () => {
    // Only show general public links here. User-specific links are in the user dropdown.
    const items: { to: string; label: string; highlight?: boolean }[] = [
      { to: '/', label: 'Trang chủ' },
      { to: '/listings', label: 'Tin đăng' }, // Keep this public
    ]

    // Admin still gets a direct link as it's a separate dashboard
    if (role === 'admin') {
      items.push({ to: '/admin', label: 'Bảng điều khiển', highlight: true })
    }

    if (role === 'broker') {
      items.push({ to: '/broker/requests', label: 'Yêu cầu takeover' })
    }

    return items.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        className={`${linkClass(item.to)} ${activeDot(item.to)} ${item.highlight ? 'text-amber-600 font-bold' : ''}`}
      >
        {item.label}
      </Link>
    ))
  }

  /* ─── Mobile Menu Items ─── */
  const renderMobileMenuItems = () => {
    const items: { to: string; label: string }[] = [
      { to: '/', label: 'Trang chủ' },
      { to: '/listings', label: 'Tin đăng' },
    ]

    if (role === 'admin') items.push({ to: '/admin', label: 'Bảng điều khiển' })
    if (role === 'broker') items.push({ to: '/broker/requests', label: 'Yêu cầu takeover' })

    // In mobile, we just list everything since there is no dropdown hover
    if (isAuthenticated) {
      items.push(
        { to: '/create-listing', label: 'Đăng tin mới' },
        { to: '/my-listings', label: 'Tin của tôi' },
        { to: '/favorites', label: 'Đã lưu' },
      )
    }

    return items.map(item => (
      <Link
        key={item.to}
        to={item.to}
        onClick={() => setMobileOpen(false)}
        className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.to)
          ? 'bg-amber-50 text-amber-600'
          : 'text-gray-700 hover:bg-gray-50 hover:text-amber-600'
          }`}
      >
        {item.label}
      </Link>
    ))
  }

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-200/50 group-hover:shadow-amber-300/60 group-hover:scale-105 transition-all duration-300">
                  <span className="text-white font-bold text-base">S</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-gray-900 leading-tight tracking-tight">
                  Smart<span className="text-amber-500">Estate</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium -mt-0.5 hidden sm:block tracking-wider uppercase">
                  Bất động sản
                </span>
              </div>
            </Link>

            {/* ── Desktop Main Menu ── */}
            <div className="hidden md:flex items-center gap-7">
              {renderMenuItems()}
            </div>

            {/* ── Right side ── */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="hidden sm:flex items-center gap-3" ref={userMenuRef}>
                  {/* User Dropdown Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={`flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full transition-all duration-200 group border ${userMenuOpen ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-100' : 'bg-gray-50 border-gray-100 hover:border-amber-200 hover:bg-amber-50'
                        }`}
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                    </button>

                    {/* User Dropdown Menu */}
                    <div className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 origin-top-right ${userMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                      }`}>
                      <div className="p-2 border-b border-gray-50">
                        <div className="px-3 py-2">
                          <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-xl hover:bg-gray-50 hover:text-amber-600 transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          Hồ sơ cá nhân
                        </Link>
                        <Link to="/my-listings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-xl hover:bg-gray-50 hover:text-amber-600 transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                          Tin của tôi
                        </Link>
                        <Link to="/favorites" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-xl hover:bg-gray-50 hover:text-amber-600 transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                          Đã lưu
                        </Link>
                        <Link to="/create-listing" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-xl hover:bg-gray-50 hover:text-amber-600 transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          Đăng tin mới
                        </Link>
                      </div>
                      <div className="p-1.5 border-t border-gray-50">
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2.5">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-600 hover:text-amber-600 px-4 py-2 rounded-xl transition-colors duration-200"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-5 py-2 rounded-xl shadow-md shadow-amber-200/40 hover:shadow-amber-300/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* ── Mobile Hamburger ── */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors"
                aria-label="Toggle menu"
              >
                <div className="w-5 flex flex-col gap-1.5">
                  <span
                    className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center ${mobileOpen ? 'rotate-45 translate-y-2' : ''
                      }`}
                  />
                  <span
                    className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-0' : ''
                      }`}
                  />
                  <span
                    className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center ${mobileOpen ? '-rotate-45 -translate-y-2' : ''
                      }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 md:hidden ${mobileOpen ? 'visible' : 'invisible'
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-[65px] left-3 right-3 bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 overflow-hidden transition-all duration-300 ${mobileOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
        >
          <div className="p-3 space-y-1">
            {renderMobileMenuItems()}
          </div>

          {/* Mobile auth section */}
          <div className="border-t border-gray-100 p-3">
            {isAuthenticated && user ? (
              <div className="space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400">Hồ sơ cá nhân</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:border-amber-300 hover:text-amber-600 transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-200/40 transition-all"
                >
                  Đăng ký miễn phí
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
