import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth'

const MENU_ITEMS = [
    { name: 'Tổng quan', path: '/admin' },
    { name: 'Duyệt tin đăng', path: '/admin/moderation' },
    { name: 'Người dùng', path: '/admin/users' },
    { name: 'Doanh thu', path: '/admin/revenue' },
]

export default function AdminSidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const currentUser = authService.getCurrentUser()

    return (
        <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 z-20 flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold text-gray-800">Smart Admin</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {MENU_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                ? 'bg-amber-50 text-amber-600'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center font-bold text-amber-600 text-sm">
                        {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="text-sm">
                        <p className="font-bold text-gray-800 leading-none">{currentUser?.name || 'Admin'}</p>
                        <p className="text-gray-400 text-xs">Quản trị viên</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        authService.logout()
                        navigate('/login')
                    }}
                    className="flex items-center text-gray-500 hover:text-red-600 transition px-4 py-2 w-full text-sm font-medium"
                >
                    Đăng xuất
                </button>
            </div>
        </div>
    )
}
