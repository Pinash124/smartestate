import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth'
import { listingService } from '../../services/listing'
import { Listing } from '../../types'

export default function MyListingsPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const allListings = listingService.getAllListings()
    const userListings = allListings.filter((l) => l.sellerId === user.id)
    setListings(userListings)
    setLoading(false)
  }, [user])

  if (!user || (user.role !== 'seller' && user.role !== 'broker')) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-red-600">Bạn không có quyền xem trang này</p>
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tin đăng của tôi</h1>
          <button
            onClick={() => navigate('/seller/create-listing')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Tạo tin đăng
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Bạn chưa có tin đăng nào</p>
            <button
              onClick={() => navigate('/seller/create-listing')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Tạo tin đăng đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-32 h-32 flex-shrink-0">
                    {listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                        <p className="text-gray-600 text-sm">Không có ảnh</p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h3>

                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <p>
                        <strong>Giá:</strong> {listing.price}
                      </p>
                      <p>
                        <strong>Diện tích:</strong> {listing.area} m²
                      </p>
                      <p>
                        <strong>Địa chỉ:</strong> {listing.city}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex gap-2 items-center mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          listing.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : listing.status === 'pending_moderation'
                            ? 'bg-yellow-100 text-yellow-800'
                            : listing.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {listing.status === 'pending_moderation' && '⏳ Chờ duyệt'}
                        {listing.status === 'active' && '✅ Đang bán'}
                        {listing.status === 'done' && '🏁 Đã hoàn thành'}
                        {listing.status === 'rejected' && '❌ Bị từ chối'}
                        {listing.status === 'cancelled' && '🚫 Đã huỷ'}
                      </span>

                      {listing.responsibleBrokerId && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🤝 Broker duyên
                        </span>
                      )}
                    </div>

                    {/* Moderation Info */}
                    {listing.moderation.status === 'pending' && (
                      <p className="text-sm text-yellow-700 mb-4">
                        ⏳ Tin đang chờ AI duyệt...
                      </p>
                    )}
                    {listing.moderation.decision === 'REJECTED' && (
                      <div className="text-sm text-red-700 mb-4">
                        <p className="font-medium">❌ Lý do bị từ chối:</p>
                        <ul className="list-disc pl-5">
                          {listing.moderation.flags.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                        {listing.moderation.suggestions.length > 0 && (
                          <p className="mt-2">
                            <strong>Gợi ý:</strong> {listing.moderation.suggestions.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Xem chi tiết
                    </button>

                    {listing.status === 'active' && (
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn kết thúc tin đăng này?')) {
                            // Update status to done
                            const updatedListings = listings.map((l) =>
                              l.id === listing.id ? { ...l, status: 'done' as const } : l
                            )
                            setListings(updatedListings)
                          }
                        }}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-sm"
                      >
                        Kết thúc
                      </button>
                    )}

                    {listing.status === 'active' && !listing.responsibleBrokerId && (
                      <button
                        onClick={() => {
                          // Request broker takeover
                          alert('Yêu cầu hỗ trợ broker đã được gửi')
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        Yêu cầu broker
                      </button>
                    )}

                    {listing.responsibleBrokerId && (
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn xoá broker?')) {
                            // Remove broker
                            const updatedListings = listings.map((l) =>
                              l.id === listing.id ? { ...l, responsibleBrokerId: undefined } : l
                            )
                            setListings(updatedListings)
                          }
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Xoá broker
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
