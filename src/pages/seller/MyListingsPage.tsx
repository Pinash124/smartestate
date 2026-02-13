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
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const loadUserListings = async () => {
      if (!user) return

      try {
        // Fetch all approved listings and filter by current seller
        // TODO: Backend should provide GET /api/users/me/listings
        const allListings = await listingService.fetchListings()
        const userListings = allListings.filter((l) => l.sellerId === user.id)
        setListings(userListings)
      } catch (error) {
        console.error('Error loading listings:', error)
      } finally {
        setLoading(false)
      }
    }
    void loadUserListings()
  }, [user])

  // phải đặt ngoài return
  const filteredListings = listings.filter((l) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    return matchSearch && matchStatus
  })

  if (!user || (user.role !== 'seller' && user.role !== 'broker')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Bạn không có quyền xem trang này</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tin đăng của tôi</h1>
          <button
            onClick={() => navigate('/seller/create-listing')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            + Tạo tin đăng
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Tìm tiêu đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-lg w-64"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang bán</option>
            <option value="done">Hoàn thành</option>
            <option value="pending_moderation">Chờ duyệt</option>
          </select>
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-white p-10 rounded-lg text-center shadow">
            Chưa có tin đăng nào
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white p-6 rounded-lg shadow flex gap-4">

                {/* Image */}
                <div className="w-32 h-32">
                  {listing.images?.length ? (
                    <img
                      src={listing.images[0]}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm">
                      Không ảnh
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{listing.title}</h3>
                  <p>Giá: {listing.price}</p>
                  <p>Diện tích: {listing.area} m²</p>
                  <p>Thành phố: {listing.city}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">

                  <button
                    onClick={() => navigate(`/seller/edit-listing/${listing.id}`)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => navigate(`/chat?listing=${listing.id}`)}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Chat
                  </button>

                  <button
                    onClick={() =>
                      setListings((prev) =>
                        prev.filter((l) => l.id !== listing.id)
                      )
                    }
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Xoá
                  </button>

                  <button
                    onClick={() => navigate(`/listing/${listing.id}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Xem
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
