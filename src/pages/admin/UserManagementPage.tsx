import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '@/services/auth' // Sử dụng @/ để tránh lỗi đường dẫn
import { User } from '@/types' // Sử dụng @/ để tránh lỗi đường dẫn

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'guest' | 'user' | 'seller' | 'broker' | 'admin'>('all')
  const [loading, setLoading] = useState(true)

  // ĐÃ BỎ XÁC THỰC ĐỂ XEM NHANH GIAO DIỆN
  /*
  const role = authService.getCurrentRole()
  if (role !== 'admin') {
    return <div className="p-20 text-center text-red-500 font-bold">Bạn không có quyền truy cập trang này.</div>
  }
  */

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('users')
      if (storedUsers) {
        const allUsers = JSON.parse(storedUsers)
        // Kiểm tra nếu allUsers là mảng để tránh lỗi map()
        setUsers(Array.isArray(allUsers) ? allUsers : [])
      }
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu người dùng:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
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

  const roleLabels: Record<string, string> = {
    guest: 'Khách',
    user: 'Người dùng',
    seller: 'Chủ bất động sản',
    broker: 'Broker',
    admin: 'Quản trị viên',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400">
        Đang tải dữ liệu...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Smart Admin</span>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/admin" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition font-medium">
            <span className="mr-3 text-xl">🏠</span> Tổng quan
          </Link>
          <Link to="/admin/moderation" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition font-medium">
            <span className="mr-3 text-xl">📋</span> Duyệt tin đăng
          </Link>
          <Link to="/admin/users" className="flex items-center px-4 py-3 bg-blue-50 text-blue-600 rounded-xl transition font-bold">
            <span className="mr-3 text-xl text-blue-500">👥</span> Người dùng
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800">Quản lý thành viên</h2>
          <div className="bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            <span className="text-[10px] font-black text-amber-600 tracking-widest uppercase">Preview Mode</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Danh sách người dùng</h1>
            <p className="text-gray-500">Quản lý và phân quyền cho {users.length} thành viên.</p>
          </div>

          {/* Filters Area */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tìm kiếm</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên hoặc email..."
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vai trò</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="user">Người dùng</option>
                <option value="seller">Người bán</option>
                <option value="broker">Broker</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Kết quả</p>
              <p className="text-2xl font-black text-gray-900">{filteredUsers.length}</p>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
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
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-600">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-bold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${getRoleColor(u.role)}`}>
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-500">
                      {/* Thêm check u.profile để tránh lỗi trang trắng nếu profile bị null */}
                      {u.profile?.phone || 'N/A'}
                    </td>
                    <td className="px-8 py-4 text-right space-x-2">
                      <button className="text-gray-400 hover:text-blue-600 transition p-2">👤</button>
                      <button className="text-gray-400 hover:text-red-600 transition p-2">🗑️</button>
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