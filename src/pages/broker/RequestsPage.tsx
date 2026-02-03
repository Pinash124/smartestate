import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth'
import { listingService } from '../../services/listing'
import { Listing } from '../../types'

export default function BrokerRequestsPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'all'>('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'broker') {
      navigate('/listings')
      return
    }

    const allListings = listingService.getAllListings()
    const brokerListings = allListings.filter(
      (l) =>
        l.brokerRequests &&
        l.brokerRequests.some((br) => br.brokerId === user.id)
    )

    setListings(brokerListings)
    setLoading(false)
  }, [user, navigate])

  if (!user || user.role !== 'broker') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-red-600">Bạn không có quyền truy cập trang này</p>
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

  const filteredListings = listings.filter((l) => {
    if (filter === 'all') return true
    const request = l.brokerRequests?.find((br) => br.brokerId === user.id)
    return request?.status === filter
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Yêu cầu hỗ trợ từ Seller</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tất cả ({listings.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Chờ xử lý (
            {listings.filter((l) => l.brokerRequests?.some((br) => br.brokerId === user.id && br.status === 'pending')).length}
            )
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'accepted'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Đã chấp nhận (
            {listings.filter((l) => l.brokerRequests?.some((br) => br.brokerId === user.id && br.status === 'accepted')).length}
            )
          </button>
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">Không có yêu cầu nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => {
              const request = listing.brokerRequests?.find((br) => br.brokerId === user.id)
              if (!request) return null

              return (
                <div key={listing.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-40 h-32 flex-shrink-0">
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
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{listing.title}</h3>
                          <p className="text-sm text-gray-600">
                            Người bán: <strong>{listing.sellerName}</strong>
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status === 'pending'
                            ? '⏳ Chờ xử lý'
                            : request.status === 'accepted'
                            ? '✅ Đã chấp nhận'
                            : '❌ Bị từ chối'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-4">
                        <p>💰 {listing.price}</p>
                        <p>📏 {listing.area} m²</p>
                        <p>📍 {listing.city}</p>
                      </div>

                      {/* Request Info */}
                      <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
                        <p className="text-gray-600">
                          Yêu cầu ngày: {new Date(request.requestedAt).toLocaleDateString('vi-VN')}
                        </p>
                        {request.respondedAt && (
                          <p className="text-gray-600">
                            Xử lý ngày: {new Date(request.respondedAt).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>

                      {/* Actions - Only for pending */}
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Accept request
                              const allListings = listingService.getAllListings()
                              const idx = allListings.findIndex((l) => l.id === listing.id)
                              if (idx !== -1 && allListings[idx].brokerRequests) {
                                const reqIdx = allListings[idx].brokerRequests!.findIndex(
                                  (br) => br.brokerId === user.id
                                )
                                if (reqIdx !== -1) {
                                  allListings[idx].brokerRequests![reqIdx].status = 'accepted'
                                  allListings[idx].brokerRequests![reqIdx].respondedAt = new Date()
                                  allListings[idx].responsibleBrokerId = user.id
                                  localStorage.setItem('listings', JSON.stringify(allListings))
                                  alert('Đã chấp nhận yêu cầu!')
                                  window.location.reload()
                                }
                              }
                            }}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                          >
                            ✅ Chấp nhận
                          </button>
                          <button
                            onClick={() => {
                              // Reject request
                              const allListings = listingService.getAllListings()
                              const idx = allListings.findIndex((l) => l.id === listing.id)
                              if (idx !== -1 && allListings[idx].brokerRequests) {
                                const reqIdx = allListings[idx].brokerRequests!.findIndex(
                                  (br) => br.brokerId === user.id
                                )
                                if (reqIdx !== -1) {
                                  allListings[idx].brokerRequests![reqIdx].status = 'rejected'
                                  allListings[idx].brokerRequests![reqIdx].respondedAt = new Date()
                                  localStorage.setItem('listings', JSON.stringify(allListings))
                                  alert('Đã từ chối yêu cầu!')
                                  window.location.reload()
                                }
                              }
                            }}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                          >
                            ❌ Từ chối
                          </button>
                        </div>
                      )}

                      {request.status === 'accepted' && (
                        <button
                          onClick={() => navigate(`/listing/${listing.id}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          👁️ Xem chi tiết
                        </button>
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
