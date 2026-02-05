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
      } catch {
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
      setFavoriteIds(listingService.getFavoriteIds(user.id))
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

  const handleToggleFavorite = (listingId: string) => {
    if (!user) {
      navigate('/login')
      return
    }
    listingService.toggleFavorite(listingId, user.id)
    setFavoriteIds(listingService.getFavoriteIds(user.id))
  }

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
