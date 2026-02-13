import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth'
import { listingService } from '@/services/listing'
import { Listing } from '@/types'

export default function BrokerRequestsPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'all'>('pending')
  const [loading, setLoading] = useState(true)

  // Giả lập một ID broker để xem dữ liệu nếu chưa đăng nhập
  const mockBrokerId = user?.id || 1

  useEffect(() => {
    // ĐÃ BỎ: Đoạn check redirect nếu không phải broker

    const loadListings = async () => {
      const allListings = await listingService.getAllListings()

      // Lọc các tin có yêu cầu broker (sử dụng ID user hiện tại hoặc ID giả lập)
      const brokerListings = allListings.filter(
        (l: Listing) =>
          l.brokerRequests &&
          l.brokerRequests.some((br: any) => br.brokerId === mockBrokerId)
      )

      setListings(brokerListings)
      setLoading(false)
    }

    loadListings()
  }, [user, mockBrokerId])

  // ĐÃ BỎ: Đoạn return báo lỗi "Không có quyền truy cập"

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center font-bold text-gray-400">
        Đang tải...
      </div>
    )
  }

  const filteredListings = listings.filter((l) => {
    if (filter === 'all') return true
    const request = l.brokerRequests?.find((br) => br.brokerId === mockBrokerId)
    return request?.status === filter
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yêu cầu hỗ trợ từ Seller</h1>
          <div className="bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            <span className="text-[10px] font-black text-amber-600 tracking-widest uppercase">Preview Mode</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
          >
            Tất cả ({listings.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filter === 'pending'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-100'
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
          >
            Chờ xử lý (
            {listings.filter((l) => l.brokerRequests?.some((br) => br.brokerId === mockBrokerId && br.status === 'pending')).length}
            )
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filter === 'accepted'
                ? 'bg-green-600 text-white shadow-lg shadow-green-100'
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
          >
            Đã chấp nhận (
            {listings.filter((l) => l.brokerRequests?.some((br) => br.brokerId === mockBrokerId && br.status === 'accepted')).length}
            )
          </button>
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-dashed border-gray-200 p-20 text-center">
            <span className="text-4xl mb-4 block">--</span>
            <p className="text-gray-400 font-medium">Hiện tại không có yêu cầu nào cho bạn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredListings.map((listing) => {
              const request = listing.brokerRequests?.find((br) => br.brokerId === mockBrokerId)
              if (!request) return null

              return (
                <div key={listing.id} className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    <div className="w-full md:w-64 h-44 flex-shrink-0">
                      <img
                        src={listing.images[0] || 'https://via.placeholder.com/400x300'}
                        alt={listing.title}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{listing.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              Người bán: <span className="font-bold text-gray-700 ml-1">{listing.sellerName}</span>
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${request.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : request.status === 'accepted'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                          >
                            {request.status === 'pending'
                              ? 'Chờ xử lý'
                              : request.status === 'accepted'
                                ? 'Đã chấp nhận'
                                : 'Bị từ chối'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4">
                          <div className="bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold text-blue-600">{listing.price}</div>
                          <div className="bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold text-gray-600">{listing.area} m²</div>
                          <div className="bg-gray-50 px-3 py-2 rounded-xl text-sm font-bold text-gray-600">{listing.city}</div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-50 pt-6">
                        <p className="text-xs text-gray-400 font-medium italic">
                          Yêu cầu nhận quản lý ngày: {new Date(request.requestedAt).toLocaleDateString('vi-VN')}
                        </p>

                        <div className="flex gap-2 w-full sm:w-auto">
                          {request.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => alert('Đã chấp nhận!')}
                                className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition"
                              >
                                Chấp nhận
                              </button>
                              <button
                                onClick={() => alert('Đã từ chối')}
                                className="flex-1 bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition"
                              >
                                Từ chối
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => navigate(`/listing/${listing.id}`)}
                              className="w-full bg-gray-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition"
                            >
                              Xem chi tiết tin đăng
                            </button>
                          )}
                        </div>
                      </div>
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