import { Link, useLocation } from 'react-router-dom';

export default function AdminDashboardPage() {
  const location = useLocation();

  // --- DỮ LIỆU MẪU ---
  const stats = [
    { label: 'Lượt xem', value: '24.5k', change: '+15%', trend: 'up', icon: '👁️', chartColor: 'bg-blue-500' },
    { label: 'Doanh thu', value: '$45.2k', change: '+2.4%', trend: 'up', icon: '💰', chartColor: 'bg-green-500' },
    // Thêm các thẻ khác nếu cần để lấp đầy chỗ trống
  ];

  const menuItems = [
    { name: 'Tổng quan', path: '/admin', icon: '🏠' },
    { name: 'Duyệt tin đăng', path: '/admin/moderation', icon: '📋' },
    { name: 'Người dùng', path: '/admin/users', icon: '👥' },
    { name: 'Báo cáo & Doanh thu', path: '/admin/revenue', icon: '📊' },
    { name: 'Cài đặt', path: '/admin/settings', icon: '⚙️' },
  ];

  // --- CÁC COMPONENT CON BÊN TRONG (Để dễ quản lý code) ---

  // 1. Sidebar (Thanh bên trái)
  const Sidebar = () => (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 z-10 flex flex-col">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <span className="text-xl font-bold text-gray-800">Smart Admin</span>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
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
          );
        })}
      </nav>

      {/* Sidebar Footer (Optional) */}
      <div className="p-4 border-t border-gray-100">
          <button className="flex items-center text-gray-500 hover:text-red-600 transition px-4 py-2">
              <span className="mr-3">🚪</span> Đăng xuất
          </button>
      </div>
    </div>
  );

  // 2. Topbar (Thanh trên cùng)
  const Topbar = () => (
    <header className="h-16 bg-white/80 backdrop-blur-sm fixed top-0 right-0 left-64 border-b border-gray-100 z-10 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 w-96">
        <span className="text-gray-400 mr-2">🔍</span>
        <input 
          type="text" 
          placeholder="Tìm kiếm..." 
          className="bg-transparent border-none outline-none text-sm flex-1 text-gray-600 placeholder-gray-400"
        />
        <span className="text-gray-400 text-xs ml-2">⌘K</span>
      </div>

      {/* Right Icons */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition">🔔<span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span></button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 cursor-pointer">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-8 h-8 rounded-full bg-gray-200" />
             <div className="text-sm hidden md:block">
                 <p className="font-bold text-gray-800 leading-none">Admin System</p>
                 <p className="text-gray-400 text-xs">Quản trị viên</p>
             </div>
        </div>
      </div>
    </header>
  );

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Render Sidebar & Topbar */}
      <Sidebar />
      <Topbar />

      {/* Main Content Area (Đẩy sang phải 64 đơn vị và xuống dưới 16 đơn vị) */}
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          
          {/* Grid Layout mô phỏng theo hình mẫu */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cột Lớn (Bên trái - Chiếm 2 phần) */}
            <div className="lg:col-span-2 space-y-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl flex justify-between items-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chào mừng trở lại, Admin! 👋</h2>
                        <p className="text-gray-600 mb-6 max-w-md">Hệ thống đang hoạt động ổn định. Bạn có 12 tin đăng mới cần duyệt hôm nay.</p>
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
                            Kiểm tra ngay
                        </button>
                    </div>
                    {/* Placeholder illustration */}
                    <div className="hidden md:block text-9xl opacity-20 absolute right-4 bottom-[-20px] select-none">🚀</div>
                </div>

                 {/* Recent Sections Placeholder (Giống hình mẫu có phần Best Selling...) */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Tin đăng mới nhất</h3>
                        <button className="text-sm text-blue-600 hover:underline">Xem tất cả</button>
                    </div>
                    <div className="space-y-4">
                        {/* Mock Items */}
                        {[1,2,3].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                    <div>
                                        <p className="font-medium text-gray-800">Căn hộ Vinhomes Central Park</p>
                                        <p className="text-sm text-gray-500">5 phút trước</p>
                                    </div>
                                </div>
                                <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-xs font-medium">Chờ duyệt</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cột Nhỏ (Bên phải - Chiếm 1 phần - Chứa Stats) */}
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
                    {/* Mini Chart Decoration */}
                    <div className={`absolute bottom-0 right-0 w-24 h-12 opacity-10 ${stat.chartColor} rounded-tl-3xl`}></div>
                </div>
                ))}
                
                {/* Placeholder cho 1 card dài bên dưới (Giống hình mẫu) */}
                 <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 relative overflow-hidden h-full min-h-[200px] flex flex-col justify-between">
                     <div>
                        <h3 className="text-xl font-bold mb-2">Gói Pro Admin</h3>
                        <p className="text-blue-100 text-sm mb-4">Nâng cấp để mở khóa các tính năng báo cáo nâng cao.</p>
                     </div>
                     <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm self-start hover:bg-blue-50 transition">
                        Tìm hiểu thêm
                     </button>
                     <div className="text-8xl opacity-20 absolute -right-4 -bottom-4">💎</div>
                 </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}