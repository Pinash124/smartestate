import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, UserRole } from '@/types'
import { authService } from '@/services/auth'
import { fetchAllUsers, updateUserRole, deleteUser } from '@/services/adminService'

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Auth check
  const currentUser = authService.getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      const data = await fetchAllUsers()
      setUsers(data)
      setLoading(false)
    }
    void loadUsers()
  }, [])

  useEffect(() => {
    let result = users
    if (searchTerm) {
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter)
    }
    setFilteredUsers(result)
  }, [users, searchTerm, roleFilter])

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setActionLoading(userId)
    const success = await updateUserRole(userId, newRole)
    if (success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    }
    setActionLoading(null)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return
    setActionLoading(userId)
    const success = await deleteUser(userId)
    if (success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    }
    setActionLoading(null)
  }

  const roleLabels: Record<string, string> = {
    guest: 'Khách',
    user: 'Người dùng',
    seller: 'Chủ BĐS',
    broker: 'Môi giới',
    admin: 'Admin',
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'broker': return 'bg-blue-100 text-blue-700'
      case 'seller': return 'bg-green-100 text-green-700'
      case 'user': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-bold text-lg">Bạn không có quyền truy cập trang này.</p>
          <Link to="/" className="mt-4 inline-block text-sm text-amber-600 hover:underline">Về trang chủ</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="font-bold">Đang tải dữ liệu...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Smart Admin</span>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/admin" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition font-medium">
            Tổng quan
          </Link>
          <Link to="/admin/moderation" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition font-medium">
            Duyệt tin đăng
          </Link>
          <Link to="/admin/users" className="flex items-center px-4 py-3 bg-amber-50 text-amber-600 rounded-xl transition font-bold">
            Người dùng
          </Link>
          <Link to="/admin/revenue" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition font-medium">
            Doanh thu
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800">Quản lý thành viên</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            API Connected
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Danh sách người dùng</h1>
            <p className="text-gray-500">Quản lý và phân quyền cho {users.length} thành viên.</p>
          </div>

          {/* Filters Area */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tìm kiếm</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên hoặc email..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vai trò</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none transition"
              >
                <option value="all">Tất cả</option>
                <option value="user">Người dùng</option>
                <option value="seller">Người bán</option>
                <option value="broker">Môi giới</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Kết quả</p>
              <p className="text-2xl font-black text-gray-900">{filteredUsers.length}</p>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Thành viên</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Vai trò</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Liên hệ</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center font-bold text-amber-600">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-bold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        disabled={actionLoading === u.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border-0 cursor-pointer ${getRoleColor(u.role)} disabled:opacity-50`}
                      >
                        {Object.entries(roleLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-500">
                      {u.profile?.phone || '—'}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={actionLoading === u.id || u.id === currentUser?.id}
                        className="text-gray-400 hover:text-red-500 transition p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Xóa người dùng"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-20 text-center text-gray-400">Không tìm thấy thành viên nào.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
