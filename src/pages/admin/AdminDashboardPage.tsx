import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import { listingService } from '@/services/listing';
import { fetchDashboardStats, AdminDashboardStats } from '@/services/adminService';
import { Listing } from '@/types';

export default function AdminDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [dashboardStats, listings] = await Promise.all([
        fetchDashboardStats(),
        listingService.getAllListings(),
      ]);
      setStats(dashboardStats);
      // Show 5 most recent listings
      setRecentListings(
        listings
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      );
      setLoading(false);
    };
    void loadData();
  }, []);

  const menuItems = [
    { name: 'Tổng quan', path: '/admin', icon: 'T' },
    { name: 'Duyệt tin đăng', path: '/admin/moderation', icon: 'D' },
    { name: 'Người dùng', path: '/admin/users', icon: 'N' },
    { name: 'Doanh thu', path: '/admin/revenue', icon: '$' },
  ];

  const statCards = stats
    ? [
      { label: 'Tin đăng', value: stats.totalListings, letter: 'T', color: 'from-blue-500 to-blue-600' },
      { label: 'Người dùng', value: stats.totalUsers, letter: 'N', color: 'from-green-500 to-green-600' },
      { label: 'Chờ duyệt', value: stats.pendingModeration, letter: 'D', color: 'from-amber-500 to-orange-500' },
      { label: 'Doanh thu', value: `${(stats.totalRevenue / 1_000_000).toFixed(1)}M`, letter: '$', color: 'from-purple-500 to-purple-600' },
    ]
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Hoạt động', cls: 'bg-green-50 text-green-600' };
      case 'pending_moderation': return { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-600' };
      case 'rejected': return { label: 'Từ chối', cls: 'bg-red-50 text-red-600' };
      case 'approved': return { label: 'Đã duyệt', cls: 'bg-blue-50 text-blue-600' };
      default: return { label: status, cls: 'bg-gray-50 text-gray-600' };
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-bold text-lg">Bạn không có quyền truy cập.</p>
          <Link to="/" className="mt-4 inline-block text-sm text-amber-600 hover:underline">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  // Sidebar
  const Sidebar = () => (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 z-20 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <span className="text-xl font-bold text-gray-800">Smart Admin</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium group ${isActive
                ? 'bg-amber-50 text-amber-600'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold mr-4 ${isActive ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => { authService.logout(); navigate('/login'); }}
          className="flex items-center text-gray-500 hover:text-red-600 transition px-4 py-2 w-full"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );

  // Topbar
  const Topbar = () => (
    <header className="h-16 bg-white/80 backdrop-blur-sm fixed top-0 right-0 left-64 border-b border-gray-100 z-10 px-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Tổng quan</h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          API Connected
        </span>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center font-bold text-amber-600 text-sm">
            {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="text-sm hidden md:block">
            <p className="font-bold text-gray-800 leading-none">{currentUser?.name || 'Admin'}</p>
            <p className="text-gray-400 text-xs">Quản trị viên</p>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 p-8 rounded-2xl mb-8 relative overflow-hidden border border-amber-100/50">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Chào mừng, {currentUser?.name || 'Admin'}!
              </h2>
              <p className="text-gray-600 mb-6 max-w-md">
                {stats && stats.pendingModeration > 0
                  ? `Có ${stats.pendingModeration} tin đăng mới cần duyệt hôm nay.`
                  : 'Hệ thống đang hoạt động ổn định.'}
              </p>
              <Link
                to="/admin/moderation"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-amber-200/50 hover:shadow-amber-300/50 transition-all duration-300"
              >
                Duyệt tin đăng →
              </Link>
            </div>

          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-20 mb-3" />
                  <div className="h-8 bg-gray-100 rounded w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
                      <h4 className="text-3xl font-bold text-gray-900">{card.value}</h4>
                    </div>
                    <div className={`p-3 bg-gradient-to-br ${card.color} rounded-xl text-white text-sm font-black shadow-sm w-10 h-10 flex items-center justify-center`}>
                      {card.letter}
                    </div>
                  </div>
                  <div className={`absolute bottom-0 right-0 w-24 h-12 opacity-5 bg-gradient-to-br ${card.color} rounded-tl-3xl group-hover:opacity-10 transition-opacity`} />
                </div>
              ))}
            </div>
          )}

          {/* Recent Listings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Tin đăng mới nhất</h3>
              <Link to="/admin/moderation" className="text-sm text-amber-600 hover:underline font-medium">
                Xem tất cả →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-100 rounded w-48 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentListings.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Chưa có tin đăng nào.</p>
            ) : (
              <div className="space-y-2">
                {recentListings.map((listing) => {
                  const badge = getStatusBadge(listing.status);
                  return (
                    <div key={listing.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {listing.images?.[0] ? (
                            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">BĐS</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{listing.title}</p>
                          <p className="text-xs text-gray-400">
                            {listing.price} · {new Date(listing.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}