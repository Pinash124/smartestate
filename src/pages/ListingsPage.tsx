import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listingService } from '../services/listing'
import { authService } from '../services/auth'
import { Listing } from '../types'

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

  const isAuthenticated = authService.isAuthenticated()
  const user = authService.getCurrentUser()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  useEffect(() => {
    const loadListings = async () => {
      setLoading(true)
      try {
        const allListings = await listingService.fetchListings()
        const filtered = allListings.filter((l) => {
          if (!isAuthenticated) {
            return l.status === 'active' && l.moderation.decision === 'APPROVED'
          }
          return l.moderation.decision === 'APPROVED'
        })
        setListings(filtered)
        setFilteredListings(filtered)
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
    // Apply filters
    let result = listings

    if (searchTerm) {
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (type) {
      result = result.filter((l) => l.type === type)
    }

    if (transaction) {
      result = result.filter((l) => l.transaction === transaction)
    }

    if (city) {
      result = result.filter((l) => l.city === city)
    }

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

    if (minArea) {
      result = result.filter((l) => l.area >= parseFloat(minArea))
    }

    setFilteredListings(result)
  }, [searchTerm, type, transaction, city, minPrice, maxPrice, minArea, listings])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    )
  }

  const handleToggleFavorite = async (listingId: string) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    try {
      const isFav = await listingService.toggleFavorite(listingId)
      // Update UI by re-fetching or update favorites
      if (isFav) {
        setFavoriteIds([...favoriteIds, listingId])
      } else {
        setFavoriteIds(favoriteIds.filter((id) => id !== listingId))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (!isAuthenticated) {
    // Guest layout - full width without sidebar
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách bất động sản</h1>
            <p className="text-gray-600">Khám phá những tài sản tuyệt vời</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {/* Search */}
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="col-span-2 sm:col-span-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Type */}
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Loại BĐS</option>
                <option value="apartment">Chung cư</option>
                <option value="house">Nhà</option>
                <option value="land">Đất</option>
                <option value="office">Văn phòng</option>
              </select>

              {/* City */}
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Thành phố</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP Hồ Chí Minh">TP HCM</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
              </select>

              {/* Price */}
              <select
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Giá</option>
                <option value="1">Từ 1 tỷ</option>
                <option value="2">Từ 2 tỷ</option>
                <option value="3">Từ 3 tỷ</option>
                <option value="5">Từ 5 tỷ</option>
              </select>

              {/* Reset */}
              <button
                onClick={() => {
                  setSearchTerm('')
                  setType('')
                  setTransaction('')
                  setCity('')
                  setMinPrice('')
                  setMaxPrice('')
                  setMinArea('')
                }}
                className="col-span-2 sm:col-span-1 bg-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm hover:bg-gray-300 transition font-medium"
              >
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Tìm thấy <strong className="text-gray-900">{filteredListings.length}</strong> tin đăng
            </p>
          </div>

          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg">Không tìm thấy tin đăng phù hợp</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden group"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  {/* Image */}
                  {listing.images.length > 0 ? (
                    <div className="relative overflow-hidden h-48 bg-gray-200">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition"></div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                      <p className="text-gray-600">Không có ảnh</p>
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                      {listing.city} • {listing.area} m²
                    </p>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 h-10">
                      {listing.title}
                    </h3>
                    <p className="text-xl font-bold text-blue-600 mb-3">{listing.price}</p>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3 h-8">
                      {listing.description}
                    </p>
                    <button className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Authenticated user layout - with sidebar
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Danh sách tin đăng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Bộ lọc</h2>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  placeholder="Tên, địa chỉ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Property Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại bất động sản
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="apartment">Chung cư</option>
                  <option value="house">Nhà</option>
                  <option value="land">Đất</option>
                  <option value="office">Văn phòng</option>
                </select>
              </div>

              {/* Transaction */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại giao dịch
                </label>
                <select
                  value={transaction}
                  onChange={(e) => setTransaction(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="buy">Mua</option>
                  <option value="rent">Thuê</option>
                </select>
              </div>

              {/* City */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thành phố
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP Hồ Chí Minh">TP Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá (tỷ đ)
                </label>
                <input
                  type="number"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Area */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diện tích tối thiểu (m²)
                </label>
                <input
                  type="number"
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSearchTerm('')
                  setType('')
                  setTransaction('')
                  setCity('')
                  setMinPrice('')
                  setMaxPrice('')
                  setMinArea('')
                }}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Tìm thấy <strong>{filteredListings.length}</strong> tin đăng
              </p>
            </div>

            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">Không tìm thấy tin đăng phù hợp</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  >
                    {/* Image */}
                    {listing.images.length > 0 ? (
                      <div className="relative">
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-48 object-cover"
                        />
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            handleToggleFavorite(listing.id)
                          }}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-lg flex items-center justify-center shadow hover:shadow-md transition"
                        >
                          {favoriteIds.includes(listing.id) ? '⭐' : '☆'}
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                        <p className="text-gray-600">Không có ảnh</p>
                      </div>
                    )}

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {listing.title}
                      </h3>

                      <p className="text-2xl font-bold text-blue-600 mb-3">{listing.price}</p>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <p>📍 {listing.city}</p>
                        <p>📏 {listing.area} m²</p>
                        {listing.bedrooms && <p>🛏️ {listing.bedrooms} phòng</p>}
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {listing.description}
                      </p>

                      <div className="flex gap-2 text-xs text-gray-500 mb-3">
                        <span className="bg-gray-200 px-2 py-1 rounded">
                          {listing.type}
                        </span>
                        <span className="bg-gray-200 px-2 py-1 rounded">
                          {listing.transaction}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                          Xem chi tiết
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            handleToggleFavorite(listing.id)
                          }}
                          className={`w-12 h-10 rounded-lg border transition ${
                            favoriteIds.includes(listing.id)
                              ? 'bg-amber-500 border-amber-500 text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-500'
                          }`}
                        >
                          ♥
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
