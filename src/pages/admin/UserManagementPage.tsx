import { useState, useEffect } from 'react'
import { authService } from '../../services/auth'
import { User } from '../../types'

export default function UserManagementPage() {
  const user = authService.getCurrentUser()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'guest' | 'user' | 'seller' | 'broker' | 'admin'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUsers = localStorage.getItem('users')
    if (storedUsers) {
      const allUsers = JSON.parse(storedUsers)
      setUsers(allUsers)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let result = users

    if (searchTerm) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter)
    }

    setFilteredUsers(result)
  }, [users, searchTerm, roleFilter])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-red-600">Bạn không có quyền truy cập trang này</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    )
  }

  const roleLabels: Record<string, string> = {
    guest: 'Khách',
    user: 'Người dùng',
    seller: 'Chủ bất động sản',
    broker: 'Broker',
    admin: 'Quản trị viên',
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'broker':
        return 'bg-blue-100 text-blue-800'
      case 'seller':
        return 'bg-green-100 text-green-800'
      case 'user':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Quản lý người dùng</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm (tên hoặc email)
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên hoặc email..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo vai trò
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="guest">Khách</option>
                <option value="user">Người dùng</option>
                <option value="seller">Chủ bất động sản</option>
                <option value="broker">Broker</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            {/* Stats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thống kê
              </label>
              <p className="text-lg font-bold text-gray-900">
                {filteredUsers.length} người dùng
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Không tìm thấy người dùng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}
                        >
                          {roleLabels[u.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {u.profile.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => {
                            const newRole = u.role === 'admin' ? 'user' : 'admin'
                            const updatedUsers = users.map((usr) =>
                              usr.id === u.id ? { ...usr, role: newRole as any } : usr
                            )
                            localStorage.setItem('users', JSON.stringify(updatedUsers))
                            setUsers(updatedUsers)
                            alert(
                              `Đã thay đổi vai trò của ${u.name} thành ${newRole}`
                            )
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          👤 Đổi vai trò
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Bạn có chắc muốn xóa người dùng ${u.name}?`
                              )
                            ) {
                              const updatedUsers = users.filter((usr) => usr.id !== u.id)
                              localStorage.setItem('users', JSON.stringify(updatedUsers))
                              setUsers(updatedUsers)
                              alert('Đã xóa người dùng')
                            }
                          }}
                          className="text-red-600 hover:underline"
                        >
                          🗑️ Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Tổng người dùng</p>
            <p className="text-3xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Người dùng thường</p>
            <p className="text-3xl font-bold text-blue-600">
              {users.filter((u) => u.role === 'user').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Chủ bất động sản</p>
            <p className="text-3xl font-bold text-green-600">
              {users.filter((u) => u.role === 'seller').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Broker</p>
            <p className="text-3xl font-bold text-purple-600">
              {users.filter((u) => u.role === 'broker').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Admin</p>
            <p className="text-3xl font-bold text-red-600">
              {users.filter((u) => u.role === 'admin').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
