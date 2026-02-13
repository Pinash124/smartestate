import { useState, useEffect, useRef, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listingService } from '../services/listing'
import { Listing } from '../types'
import { BuildingIcon, HouseIcon, TreeIcon, OfficeIcon, SparkleIcon, CheckCircleIcon, ChatIcon, MapPinIcon, AreaIcon, BedIcon, SearchIcon } from '../components/Icons'

// Animated counter hook
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const counted = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const start = performance.now()
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

// Stat item component
function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="text-center px-6 py-4">
      <p className="text-3xl sm:text-4xl font-bold text-amber-500">
        {count}{suffix}
      </p>
      <p className="text-gray-500 text-sm mt-1 font-medium">{label}</p>
    </div>
  )
}

// Property type card
const PROPERTY_TYPES: { type: string; label: string; icon: ReactNode; desc: string }[] = [
  { type: 'apartment', label: 'Chung cư', icon: <BuildingIcon className="w-8 h-8" />, desc: 'Căn hộ hiện đại, tiện nghi' },
  { type: 'house', label: 'Nhà phố', icon: <HouseIcon className="w-8 h-8" />, desc: 'Nhà riêng, không gian rộng' },
  { type: 'land', label: 'Đất nền', icon: <TreeIcon className="w-8 h-8" />, desc: 'Đất nền đầu tư sinh lời' },
  { type: 'office', label: 'Văn phòng', icon: <OfficeIcon className="w-8 h-8" />, desc: 'Văn phòng cho thuê, mặt bằng' },
]

// Why choose us items
const WHY_CHOOSE: { icon: ReactNode; title: string; desc: string }[] = [
  {
    icon: <SparkleIcon className="w-7 h-7" />,
    title: 'AI Gợi Ý Thông Minh',
    desc: 'Hệ thống AI phân tích sở thích để đưa ra gợi ý bất động sản phù hợp nhất với bạn.',
  },
  {
    icon: <CheckCircleIcon className="w-7 h-7" />,
    title: 'Xác Minh Tin Đăng',
    desc: 'Mọi tin đăng được kiểm duyệt kỹ lưỡng bởi AI & đội ngũ chuyên gia trước khi hiển thị.',
  },
  {
    icon: <ChatIcon className="w-7 h-7" />,
    title: 'Hỗ Trợ Trực Tuyến',
    desc: 'Chat trực tiếp với người bán hoặc môi giới. Kết nối nhanh chóng, an toàn.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([])
  const [searchCity, setSearchCity] = useState('')
  const [searchType, setSearchType] = useState('')

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const allListings = await listingService.fetchListings()
        const approved = allListings.filter(
          (l) => l.status === 'active' && l.moderation.decision === 'APPROVED'
        )
        setFeaturedListings(approved.slice(0, 4))
      } catch (err) {
        console.error('Failed to load featured listings:', err)
      }
    }
    void loadFeatured()
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchCity) params.set('city', searchCity)
    if (searchType) params.set('type', searchType)
    navigate(`/listings${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B45309' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Nền tảng BĐS số 1 Việt Nam
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Tìm kiếm{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Bất Động Sản
              </span>
              <br />
              Hoàn Hảo Cho Bạn
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Khám phá hàng nghìn tin đăng bất động sản được xác minh,
              với hệ thống AI gợi ý thông minh giúp bạn tìm được ngôi nhà mơ ước.
            </p>

            {/* Search Bar */}
            <div className="mt-10 bg-white rounded-2xl shadow-xl shadow-amber-100/50 p-3 sm:p-4 max-w-2xl mx-auto border border-amber-100/50">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                >
                  <option value="">Loại bất động sản</option>
                  <option value="apartment">Chung cư</option>
                  <option value="house">Nhà phố</option>
                  <option value="land">Đất nền</option>
                  <option value="office">Văn phòng</option>
                </select>

                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                >
                  <option value="">Thành phố</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP Hồ Chí Minh">TP Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>

                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-amber-200/50 hover:shadow-amber-300/50 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                >
                  Tìm Kiếm
                </button>
              </div>
            </div>

            {/* Quick stats under search */}
            <p className="mt-6 text-sm text-gray-400">
              Hơn <strong className="text-gray-600">1,200</strong> tin đăng mới trong tháng này
            </p>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 52C120 44 240 28 360 24C480 20 600 28 720 32C840 36 960 36 1080 32C1200 28 1320 20 1380 16L1440 12V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════ STATS SECTION ═══════════════════════ */}
      <section className="py-8 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            <StatItem value={1200} suffix="+" label="Tin Đăng" />
            <StatItem value={500} suffix="+" label="Khách Hàng" />
            <StatItem value={50} suffix="+" label="Thành Phố" />
            <StatItem value={99} suffix="%" label="Hài Lòng" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURED LISTINGS ═══════════════════════ */}
      {featuredListings.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-12">
              <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">Nổi bật</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
                Tin Đăng Mới Nhất
              </h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                Những bất động sản được đăng mới nhất trên nền tảng
              </p>
            </div>

            {/* Listing grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listing/${listing.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-amber-50 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <HouseIcon className="w-10 h-10" />
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Price badge */}
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
                      <span className="text-amber-600 font-bold text-sm">{listing.price}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 h-10 group-hover:text-amber-600 transition-colors">
                      {listing.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" /> {listing.city}</span>
                      <span className="flex items-center gap-1"><AreaIcon className="w-3.5 h-3.5" /> {listing.area}m²</span>
                    </div>
                    {listing.bedrooms && (
                      <div className="mt-1 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1"><BedIcon className="w-3.5 h-3.5" /> {listing.bedrooms} phòng ngủ</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* View all button */}
            <div className="text-center mt-10">
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-gray-900/20"
              >
                Xem Tất Cả Tin Đăng
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════ PROPERTY TYPES ═══════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">Danh mục</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
              Loại Bất Động Sản
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Duyệt qua các danh mục bất động sản phổ biến
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {PROPERTY_TYPES.map((item) => (
              <Link
                key={item.type}
                to={`/listings?type=${item.type}`}
                className="group bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="mt-4 font-bold text-gray-900 text-base sm:text-lg group-hover:text-amber-600 transition-colors">
                  {item.label}
                </h3>
                <p className="mt-1 text-gray-400 text-xs sm:text-sm">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ WHY CHOOSE US ═══════════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">Ưu điểm</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
              Tại Sao Chọn Smart Estate?
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Chúng tôi mang đến trải nghiệm tìm kiếm bất động sản tốt nhất
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {WHY_CHOOSE.map((item, i) => (
              <div
                key={i}
                className="relative bg-gradient-to-br from-white to-amber-50/30 rounded-2xl p-8 border border-gray-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-50 group transition-all duration-300"
              >
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:bg-amber-200 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA SECTION ═══════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl px-8 sm:px-16 py-16 sm:py-20 text-center">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Bạn Muốn Đăng Tin?
              </h2>
              <p className="mt-4 text-gray-300 text-lg max-w-xl mx-auto leading-relaxed">
                Đăng ký tài khoản miễn phí và bắt đầu đăng tin bất động sản của bạn
                lên nền tảng với hàng nghìn người xem mỗi ngày.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-amber-500/25 hover:-translate-y-0.5"
                >
                  Đăng Ký Ngay — Miễn Phí
                </Link>
                <Link
                  to="/listings"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 border border-white/20 hover:-translate-y-0.5"
                >
                  Khám Phá Tin Đăng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
