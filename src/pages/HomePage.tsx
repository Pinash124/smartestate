import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-400 to-amber-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Tìm Nhà Ở Mơ Ước Của Bạn
            </h1>
            <p className="text-lg md:text-xl text-amber-50 mb-8 max-w-2xl mx-auto">
              Nền tảng hàng đầu kết nối người mua, người bán và người cho thuê bất động sản
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại giao dịch
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                  <option>Mua bán</option>
                  <option>Cho thuê</option>
                  <option>Tất cả</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại bất động sản
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                  <option>Căn hộ</option>
                  <option>Nhà riêng</option>
                  <option>Đất nền</option>
                  <option>Văn phòng</option>
                  <option>Tất cả</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khu vực
                </label>
                <input
                  type="text"
                  placeholder="TP Hồ Chí Minh"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <Link
                  to="/listings"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition text-center"
                >
                  Tìm kiếm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">50K+</div>
              <p className="text-gray-600 text-sm md:text-base">Tin đăng hoạt động</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">100K+</div>
              <p className="text-gray-600 text-sm md:text-base">Người dùng tham gia</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">500+</div>
              <p className="text-gray-600 text-sm md:text-base">Cố vấn chuyên nghiệp</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">24/7</div>
              <p className="text-gray-600 text-sm md:text-base">Hỗ trợ khách hàng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Tin đăng nổi bật
              </h2>
              <p className="text-gray-600">
                Những bất động sản được yêu thích nhất hôm nay
              </p>
            </div>
            <Link to="/listings" className="text-amber-600 hover:text-amber-700 font-bold text-lg whitespace-nowrap">
              Xem tất cả →
            </Link>
          </div>

          {/* Featured Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition transform hover:-translate-y-2"
              >
                <div className="relative">
                  <img
                    src={`https://images.unsplash.com/photo-156051${800 + i}?w=400&h=250&fit=crop`}
                    alt="Listing"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Bán
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    Căn hộ 2 phòng tại Quận 1
                  </h3>
                  <p className="text-2xl font-bold text-amber-600 mb-2">3.5 tỷ</p>
                  <p className="text-gray-600 text-sm">
                    {`📏 85m² • 🛏️ 2 • 📍 Quận 1`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
