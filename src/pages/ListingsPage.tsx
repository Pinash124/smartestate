import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listingService } from '../services/listing'
import { authService } from '../services/auth'
import { Listing } from '../types'

/* ─── Label maps ─── */
const TYPE_LABELS: Record<string, string> = {
  apartment: 'Chung cư',
  house: 'Nhà',
  land: 'Đất',
  office: 'Văn phòng',
}
const TX_LABELS: Record<string, string> = { buy: 'Mua', rent: 'Thuê' }

/* ─── SVG icon helpers ─── */
const Icon = ({ d, cls = 'w-4 h-4' }: { d: string; cls?: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const SearchIcon = () => <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" cls="w-5 h-5 text-gray-400" />
const AreaIcon = () => <Icon d="M4 4h16v16H4z" cls="w-3.5 h-3.5" />
const BedIcon = () => <Icon d="M3 7v11m0-4h18M3 18h18M5 7h14a2 2 0 012 2v2H3V9a2 2 0 012-2z" cls="w-3.5 h-3.5" />
const BathIcon = () => <Icon d="M4 12h16M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M6 12V5a2 2 0 012-2h1" cls="w-3.5 h-3.5" />
const HeartIcon = ({ filled }: { filled: boolean }) =>
  filled ? (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
  ) : (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
  )
const FilterIcon = () => <Icon d="M3 4h18M7 9h10M10 14h4" cls="w-4 h-4" />
const XIcon = () => <Icon d="M18 6L6 18M6 6l12 12" cls="w-3.5 h-3.5" />
const MapPinIcon = () => <Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" cls="w-3.5 h-3.5" />

/* ─── Skeleton card ─── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="h-52 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-200 rounded-full w-1/3" />
      <div className="h-4 bg-gray-200 rounded-full w-full" />
      <div className="h-4 bg-gray-200 rounded-full w-2/3" />
      <div className="h-6 bg-gray-200 rounded-full w-1/2 mt-2" />
      <div className="flex gap-2 mt-3">
        <div className="h-7 bg-gray-200 rounded-lg w-16" />
        <div className="h-7 bg-gray-200 rounded-lg w-16" />
        <div className="h-7 bg-gray-200 rounded-lg w-16" />
      </div>
    </div>
  </div>
)

export default function ListingsPage() {
  const navigate = useNavigate()
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [type, setType] = useState('')
  const [transaction, setTransaction] = useState('')
  const [city, setCity] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minArea, setMinArea] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const isAuthenticated = authService.isAuthenticated()
  const user = authService.getCurrentUser()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  useEffect(() => {
    const loadListings = async () => {
      setLoading(true)
      try {
        const allListings = await listingService.fetchListings()
        const approvedListings = allListings.filter(l => l.status === 'active')
        setListings(approvedListings)
        setFilteredListings(approvedListings)
      } catch (error) {
        console.error('Failed to load listings:', error)
        setListings([])
        setFilteredListings([])
      } finally {
        setLoading(false)
      }
    }
    void loadListings()
  }, [isAuthenticated])

  useEffect(() => {
    if (user) {
      setFavoriteIds(listingService.getFavoriteIds())
    } else {
      setFavoriteIds([])
    }
  }, [user])

  useEffect(() => {
    let result = listings

    if (searchTerm) {
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (type) result = result.filter((l) => l.type === type)
    if (transaction) result = result.filter((l) => l.transaction === transaction)
    if (city) result = result.filter((l) => l.city === city)
    if (minPrice) {
      const min = parseFloat(minPrice.replace(/[^\d.]/g, '')) * 1000000
      result = result.filter((l) => {
        const price = parseFloat(l.price.replace(/[^\d.]/g, '')) * 1000000
        return price >= min
      })
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice.replace(/[^\d.]/g, '')) * 1000000
      result = result.filter((l) => {
        const price = parseFloat(l.price.replace(/[^\d.]/g, '')) * 1000000
        return price <= max
      })
    }
    if (minArea) result = result.filter((l) => l.area >= parseFloat(minArea))

    setFilteredListings(result)
  }, [searchTerm, type, transaction, city, minPrice, maxPrice, minArea, listings])

  const handleToggleFavorite = async (listingId: string) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    try {
      const isFav = await listingService.toggleFavorite(listingId)
      if (isFav) {
        setFavoriteIds([...favoriteIds, listingId])
      } else {
        setFavoriteIds(favoriteIds.filter((id) => id !== listingId))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setType('')
    setTransaction('')
    setCity('')
    setMinPrice('')
    setMaxPrice('')
    setMinArea('')
  }

  const activeFilterCount = [type, transaction, city, minPrice, maxPrice, minArea].filter(Boolean).length
  const activeFilters: { label: string; clear: () => void }[] = []
  if (type) activeFilters.push({ label: TYPE_LABELS[type] || type, clear: () => setType('') })
  if (transaction) activeFilters.push({ label: TX_LABELS[transaction] || transaction, clear: () => setTransaction('') })
  if (city) activeFilters.push({ label: city, clear: () => setCity('') })
  if (minPrice) activeFilters.push({ label: `Từ ${minPrice} tỷ`, clear: () => setMinPrice('') })
  if (maxPrice) activeFilters.push({ label: `Đến ${maxPrice} tỷ`, clear: () => setMaxPrice('') })
  if (minArea) activeFilters.push({ label: `≥ ${minArea} m²`, clear: () => setMinArea('') })

  /* ─── Select styling ─── */
  const selectCls = 'appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 focus:bg-white transition-all cursor-pointer'
  const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 focus:bg-white transition-all'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ═══════════════════════ HERO HEADER ═══════════════════════ */}
      <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Khám phá Bất Động Sản
          </h1>
          <p className="text-amber-100 text-base sm:text-lg mb-8 max-w-xl">
            Tìm kiếm ngôi nhà mơ ước với hàng nghìn tin đăng được xác minh
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Tìm theo tên, địa chỉ, khu vực..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-sm border-0 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg shadow-black/10 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 shadow-lg ${showFilters
                  ? 'bg-white text-amber-600 shadow-black/10'
                  : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                }`}
            >
              <FilterIcon />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════ FILTER PANEL ═══════════════════════ */}
      <div
        className={`bg-white border-b border-gray-100 shadow-sm transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Loại BĐS</label>
              <div className="relative">
                <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
                  <option value="">Tất cả</option>
                  <option value="apartment">Chung cư</option>
                  <option value="house">Nhà</option>
                  <option value="land">Đất</option>
                  <option value="office">Văn phòng</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </div>
              </div>
            </div>

            {/* Transaction */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Giao dịch</label>
              <div className="relative">
                <select value={transaction} onChange={(e) => setTransaction(e.target.value)} className={selectCls}>
                  <option value="">Tất cả</option>
                  <option value="buy">Mua</option>
                  <option value="rent">Thuê</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </div>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Thành phố</label>
              <div className="relative">
                <select value={city} onChange={(e) => setCity(e.target.value)} className={selectCls}>
                  <option value="">Tất cả</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP Hồ Chí Minh">TP HCM</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </div>
              </div>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Giá từ (tỷ)</label>
              <input type="number" placeholder="VD: 1" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={inputCls} />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Giá đến (tỷ)</label>
              <input type="number" placeholder="VD: 5" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={inputCls} />
            </div>

            {/* Min Area */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Diện tích (m²)</label>
              <input type="number" placeholder="Tối thiểu" value={minArea} onChange={(e) => setMinArea(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors inline-flex items-center gap-1"
              >
                <XIcon /> Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════ CONTENT ═══════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Results bar + active filter chips */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <p className="text-sm text-gray-500">
            {loading ? 'Đang tìm kiếm...' : (
              <>Tìm thấy <strong className="text-gray-900 font-bold">{filteredListings.length}</strong> tin đăng</>
            )}
          </p>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {activeFilters.map((f, i) => (
                <button
                  key={i}
                  onClick={f.clear}
                  className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-medium hover:bg-amber-100 transition-colors group"
                >
                  {f.label}
                  <span className="text-amber-400 group-hover:text-amber-600 transition-colors">×</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Loading skeleton ─── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          /* ─── Empty state ─── */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M8 11h6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy tin đăng</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-200/40"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          /* ─── Listing cards grid ─── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => {
              const isFav = favoriteIds.includes(listing.id)
              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  {/* ── Image ── */}
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    {listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
                        {TYPE_LABELS[listing.type] || listing.type}
                      </span>
                    </div>

                    {/* Transaction badge */}
                    <div className="absolute top-3 right-12">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur-sm ${listing.transaction === 'buy'
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-blue-500/90 text-white'
                        }`}>
                        {TX_LABELS[listing.transaction] || listing.transaction}
                      </span>
                    </div>

                    {/* Favorite button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorite(listing.id)
                      }}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${isFav
                          ? 'bg-red-500 text-white scale-110'
                          : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:scale-110'
                        }`}
                    >
                      <HeartIcon filled={isFav} />
                    </button>

                    {/* Image count */}
                    {listing.images.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
                        {listing.images.length}
                      </div>
                    )}
                  </div>

                  {/* ── Card body ── */}
                  <div className="p-4 sm:p-5">
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-gray-400 mb-2">
                      <MapPinIcon />
                      <span className="text-xs font-medium truncate">{listing.city}{listing.district ? `, ${listing.district}` : ''}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem] mb-3 group-hover:text-amber-700 transition-colors">
                      {listing.title}
                    </h3>

                    {/* Price */}
                    <p className="text-lg font-extrabold text-amber-600 mb-3">
                      {listing.price}
                    </p>

                    {/* Property details pills */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                        <AreaIcon />
                        {listing.area} m²
                      </span>
                      {listing.bedrooms && listing.bedrooms > 0 && (
                        <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                          <BedIcon />
                          {listing.bedrooms} PN
                        </span>
                      )}
                      {listing.bathrooms && listing.bathrooms > 0 && (
                        <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                          <BathIcon />
                          {listing.bathrooms} WC
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
