import { useState, useEffect } from 'react'
import { authService } from '../services/auth'
import { User } from '../types'

const previewUser: User = {
  id: 0,
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
    if (!user) {
      return
    }

    // Validation
    if (!formData.name || !formData.email) {
      setMessage('Tên và email là bắt buộc')
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage('Mật khẩu không khớp')
      return
    }

    // Update profile
    const updates: Partial<User> = {
      name: formData.name,
      profile: {
        ...user.profile,
        phone: formData.phone,
        address: formData.address,
      },
    }

    if (authService.updateProfile(updates)) {
      setMessage('✅ Cập nhật hồ sơ thành công!')
      setIsEditing(false)
      setTimeout(() => window.location.reload(), 1500)
    } else {
      setMessage('❌ Cập nhật thất bại')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              {/* Avatar */}
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl text-white font-bold">
                  {displayUser.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">{displayUser.name}</h2>
              <p className="text-gray-600 text-sm mb-4">{displayUser.email}</p>

              {/* Role Badge */}
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                {displayUser.role === 'guest'
                  ? 'Khách'
                  : displayUser.role === 'user'
                  ? 'Người dùng'
                  : displayUser.role === 'seller'
                  ? 'Chủ bất động sản'
                  : displayUser.role === 'broker'
                  ? 'Broker'
                  : 'Quản trị viên'}
              </div>

              <p className="text-gray-600 text-xs mb-6">
                Đã đăng ký: {new Date(displayUser.createdAt).toLocaleDateString('vi-VN')}
              </p>

              {!isEditing && !isPreview && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  ✏️ Chỉnh sửa hồ sơ
                </button>
              )}
              {isPreview && (
                <a
                  href="/login"
                  className="inline-flex items-center justify-center w-full bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Đăng nhập để chỉnh sửa
                </a>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>

              {message && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    message.includes('✅')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {message}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (không thể thay đổi)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="vd: 0912345678"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="vd: 123 Đường ABC, Quận 1, TP HCM"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Password */}
                  <div className="pt-4 border-t">
                    <h3 className="font-medium text-gray-900 mb-4">Đổi mật khẩu (nếu cần)</h3>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Để trống nếu không đổi"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xác nhận mật khẩu
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-6 border-t">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      💾 Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                    >
                      ❌ Huỷ
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tên</p>
                    <p className="text-lg font-medium text-gray-900">{displayUser.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="text-lg font-medium text-gray-900">{displayUser.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                    <p className="text-lg font-medium text-gray-900">
                      {displayUser.profile.phone || 'Chưa cập nhật'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                    <p className="text-lg font-medium text-gray-900">
                      {displayUser.profile.address || 'Chưa cập nhật'}
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Vai trò</p>
                    <p className="text-lg font-medium text-gray-900">{displayUser.role}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ngày đăng ký</p>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(displayUser.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
