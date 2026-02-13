import { useState, useEffect } from 'react'
import { authService } from '../services/auth'
import { User } from '../types'

const previewUser: User = {
  id: 'guest',
  name: 'Khách dùng thử',
  email: 'guest@smartestate.vn',
  password: '',
  role: 'guest',
  profile: {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
}

const ROLE_LABELS: Record<string, string> = {
  guest: 'Khách',
  user: 'Người dùng',
  seller: 'Chủ bất động sản',
  broker: 'Môi giới',
  admin: 'Quản trị viên',
}

export default function UserProfilePage() {
  const user = authService.getCurrentUser()
  const isPreview = !user
  const displayUser = user || previewUser
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    setFormData({
      name: displayUser.name,
      email: displayUser.email,
      phone: displayUser.profile.phone || '',
      address: displayUser.profile.address || '',
      password: '',
      confirmPassword: '',
    })
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (!user) return

    if (!formData.name || !formData.email) {
      setMessage('error:Tên và email là bắt buộc')
      return
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage('error:Mật khẩu không khớp')
      return
    }

    const updates: Partial<User> = {
      name: formData.name,
      profile: {
        ...user.profile,
        phone: formData.phone,
        address: formData.address,
      },
    }

    if (formData.password) {
      updates.password = formData.password
    }

    const load = async () => {
      const success = await authService.updateProfile(updates)
      if (success) {
        setMessage('success:Cập nhật hồ sơ thành công!')
        setIsEditing(false)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage('error:Cập nhật thất bại, vui lòng thử lại')
      }
    }
    void load()
  }

  const isSuccess = message.startsWith('success:')
  const messageText = message.replace(/^(success|error):/, '')

  /* ─── Field icon helper ─── */
  const fieldIcon = (d: string) => (
    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header Banner ── */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Left Column: Profile Card ─── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
              {/* Avatar Area */}
              <div className="pt-8 pb-6 px-6 text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200/50 mb-5 rotate-3 hover:rotate-0 transition-transform duration-300">
                  <span className="text-4xl text-white font-bold -rotate-3 hover:rotate-0 transition-transform duration-300">
                    {displayUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-1">{displayUser.name}</h2>
                <p className="text-sm text-gray-500 mb-4">{displayUser.email}</p>

                {/* Role Badge */}
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  {ROLE_LABELS[displayUser.role] || displayUser.role}
                </span>
              </div>

              {/* Meta Info */}
              <div className="border-t border-gray-100 px-6 py-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-gray-500">Tham gia: </span>
                  <span className="text-gray-800 font-medium ml-auto">
                    {new Date(displayUser.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {displayUser.profile.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    <span className="text-gray-500">SĐT: </span>
                    <span className="text-gray-800 font-medium ml-auto">{displayUser.profile.phone}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-100 p-4">
                {!isEditing && !isPreview && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-md shadow-amber-200/40 hover:shadow-amber-300/50 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Chỉnh sửa hồ sơ
                  </button>
                )}
                {isPreview && (
                  <a
                    href="/login"
                    className="block text-center w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl font-medium text-sm transition-colors"
                  >
                    Đăng nhập để chỉnh sửa
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ─── Right Column: Info / Edit Form ─── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
              {/* Section Header */}
              <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Cập nhật hồ sơ' : 'Thông tin cá nhân'}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {isEditing ? 'Chỉnh sửa thông tin bên dưới rồi nhấn Lưu' : 'Thông tin tài khoản của bạn'}
                </p>
              </div>

              {/* Message */}
              {message && (
                <div className={`mx-6 sm:mx-8 mt-5 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${isSuccess
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isSuccess ? '✓' : '!'}
                  </span>
                  {messageText}
                </div>
              )}

              <div className="px-6 sm:px-8 py-6">
                {isEditing ? (
                  /* ─── Edit Form ─── */
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Họ và tên
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          {fieldIcon('M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z')}
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Email — disabled */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Email <span className="text-gray-300 normal-case font-normal">(không thể thay đổi)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          {fieldIcon('M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6')}
                        </div>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Phone + Address row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Số điện thoại
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            {fieldIcon('M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.8.33 1.86.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.95.37 2.01.57 2.81.7A2 2 0 0122 16.92z')}
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="0912 345 678"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Địa chỉ
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            {fieldIcon('M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 10a3 3 0 100-6 3 3 0 000 6z')}
                          </div>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="123 Đường ABC, Quận 1"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Section */}
                    <div className="pt-5 mt-5 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Đổi mật khẩu <span className="text-gray-300 normal-case font-normal">(bỏ trống nếu không đổi)</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            {fieldIcon('M3 11h18v11H3zM7 11V7a5 5 0 0110 0v4')}
                          </div>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mật khẩu mới"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 focus:bg-white transition-all"
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            {fieldIcon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z')}
                          </div>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Xác nhận mật khẩu"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-6">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-amber-200/40 hover:shadow-amber-300/50 hover:-translate-y-0.5 active:translate-y-0"
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-medium text-sm transition-colors"
                      >
                        Huỷ bỏ
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ─── Read-only View ─── */
                  <div className="space-y-1">
                    {/* Info Rows */}
                    {[
                      { label: 'Họ và tên', value: displayUser.name, icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z' },
                      { label: 'Email', value: displayUser.email, icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6' },
                      { label: 'Số điện thoại', value: displayUser.profile.phone || 'Chưa cập nhật', icon: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.8.33 1.86.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.95.37 2.01.57 2.81.7A2 2 0 0122 16.92z' },
                      { label: 'Địa chỉ', value: displayUser.profile.address || 'Chưa cập nhật', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 10a3 3 0 100-6 3 3 0 000 6z' },
                      { label: 'Vai trò', value: ROLE_LABELS[displayUser.role] || displayUser.role, icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
                      { label: 'Ngày tham gia', value: new Date(displayUser.createdAt).toLocaleDateString('vi-VN'), icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-amber-50 group-hover:bg-amber-100 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                          <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d={item.icon} />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{item.label}</p>
                          <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
