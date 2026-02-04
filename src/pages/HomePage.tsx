import { Link, useLocation } from 'react-router-dom'
import { authService } from '@/services/auth'

export default function HomePage() {
  const location = useLocation()
  const user = authService.getCurrentUser()

  const menuItems = [
    { name: 'Trang chủ', path: '/', icon: '🏠' },
    { name: 'Tìm kiếm', path: '/listings', icon: '🔎' },
    { name: 'Gợi ý AI', path: '/recommend', icon: '✨' },
    { name: 'Tin đã lưu', path: '/favorite', icon: '⭐' },
    { name: 'Hồ sơ', path: '/profile', icon: '👤' },
  ]

  const stats = [
    { label: 'Tin phù hợp', value: '128', change: '+12%', trend: 'up', icon: '🏡', chartColor: 'bg-blue-500' },
    { label: 'Đã lưu', value: '24', change: '+4%', trend: 'up', icon: '⭐', chartColor: 'bg-amber-500' },
    { label: 'So sánh', value: '8', change: '-2%', trend: 'down', icon: '📊', chartColor: 'bg-emerald-500' },
  ]

  const quickActions = [
    { label: 'Khám phá tin mới', path: '/listings', color: 'bg-blue-600 text-white hover:bg-blue-700' },
    { label: 'Gợi ý phù hợp', path: '/recommend', color: 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-100' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 z-10 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Smart Buyer</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium group ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`text-xl mr-4 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link to="/profile" className="flex items-center text-gray-500 hover:text-blue-600 transition px-4 py-2">
            <span className="mr-3">⚙️</span> Cài đặt tài khoản
          </Link>
        </div>
      </div>

      <header className="h-16 bg-white/80 backdrop-blur-sm fixed top-0 right-0 left-64 border-b border-gray-100 z-10 px-6 flex items-center justify-between">
        <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 w-96">
          <span className="text-gray-400 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Tìm khu vực, dự án, giá..."
            className="bg-transparent border-none outline-none text-sm flex-1 text-gray-600 placeholder-gray-400"
          />
          <span className="text-gray-400 text-xs ml-2">⌘K</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition">🔔</button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-100 cursor-pointer">
            <img
              src={user?.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buyer'}
              alt="Buyer"
              className="w-8 h-8 rounded-full bg-gray-200"
            />
            <div className="text-sm hidden md:block">
              <p className="font-bold text-gray-800 leading-none">{user?.name || 'Buyer'}</p>
              <p className="text-gray-400 text-xs">Người mua</p>
            </div>
          </div>
        </div>
      </header>

      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Chào {user?.name || 'bạn'}, sẵn sàng tìm nhà mới? 👋
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Hệ thống đã cá nhân hóa 128 tin phù hợp với nhu cầu của bạn.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {quickActions.map((action) => (
                      <Link
                        key={action.path}
                        to={action.path}
                        className={`${action.color} px-6 py-3 rounded-xl font-medium shadow-sm transition`}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="hidden md:block text-9xl opacity-20 absolute right-4 bottom-[-20px] select-none">🏙️</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Bộ lọc nhanh</h3>
                  <Link to="/listings" className="text-sm text-blue-600 hover:underline">
                    Xem tất cả
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none">
                    <option>Mua bán</option>
                    <option>Cho thuê</option>
                    <option>Tất cả</option>
                  </select>
                  <select className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none">
                    <option>Căn hộ</option>
                    <option>Nhà riêng</option>
                    <option>Đất nền</option>
                    <option>Văn phòng</option>
                    <option>Tất cả</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Khu vực"
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <Link
                    to="/listings"
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-2xl font-medium text-center hover:bg-blue-700 transition"
                  >
                    Tìm kiếm
                  </Link>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[280px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Gợi ý nổi bật</h3>
                  <Link to="/listings" className="text-sm text-blue-600 hover:underline">
                    Xem thêm
                  </Link>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                        <div>
                          <p className="font-medium text-gray-800">Căn hộ premium tại Quận 2</p>
                          <p className="text-sm text-gray-500">Giá từ 3.2 tỷ • 2 phòng ngủ</p>
                        </div>
                      </div>
                      <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-xs font-medium">Phù hợp</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                      <h4 className="text-3xl font-bold text-gray-900">{stat.value}</h4>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl text-2xl">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center text-sm font-bold mr-2 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                    </span>
                    <span className="text-gray-400 text-sm">so với tuần trước</span>
                  </div>
                  <div className={`absolute bottom-0 right-0 w-24 h-12 opacity-10 ${stat.chartColor} rounded-tl-3xl`} />
                </div>
              ))}

              <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 relative overflow-hidden h-full min-h-[200px] flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Danh sách quan tâm</h3>
                  <p className="text-blue-100 text-sm mb-4">Lưu tin để so sánh nhanh và nhận thông báo giảm giá.</p>
                </div>
                <Link
                  to="/listings"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm self-start hover:bg-blue-50 transition"
                >
                  Khám phá ngay
                </Link>
                <div className="text-8xl opacity-20 absolute -right-4 -bottom-4">💎</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
