import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listingService } from '@/services/listing'
import { authService } from '@/services/auth'
import { Listing } from '@/types'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const [favorites, setFavorites] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const favs = await listingService.getFavoriteListings()
        setFavorites(favs)
      } catch (error) {
        console.error('Error loading favorites:', error)
      } finally {
        setLoading(false)
      }
    }
    void loadFavorites()
  }, [user])

  const handleRemove = async (listingId: string) => {
    if (!user) return
    try {
      const success = await listingService.removeFavorite(listingId)
      if (success) {
        setFavorites(favorites.filter((f) => f.id !== listingId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Vui lòng đăng nhập để xem tin đã lưu</p>
          <Link to="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tin đã lưu</h1>
          <Link to="/listings" className="text-blue-600 hover:text-blue-700 font-medium">
            Khám phá thêm
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Bạn chưa lưu tin nào</p>
            <Link to="/listings" className="text-blue-600 hover:underline">
              Xem tin đăng
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                {listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                    <p className="text-gray-600">Không có ảnh</p>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {listing.title}
                    </h3>
                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        handleRemove(listing.id)
                      }}
                      className="text-sm text-gray-500 hover:text-red-600 transition"
                    >
                      Bỏ lưu
                    </button>
                  </div>

                  <p className="text-2xl font-bold text-blue-600 mb-3">{listing.price}</p>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                    <p>{listing.city}</p>
                    <p>{listing.area} m²</p>
                    {listing.bedrooms && <p>{listing.bedrooms} phòng</p>}
                  </div>

                  <div className="flex gap-2 text-xs text-gray-500 mb-3">
                    <span className="bg-gray-200 px-2 py-1 rounded">
                      {listing.type}
                    </span>
                    <span className="bg-gray-200 px-2 py-1 rounded">
                      {listing.transaction}
                    </span>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
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
