import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { listingService } from '../services/listing'
import { authService } from '../services/auth'
import { chatService } from '../services/chat'
import { Listing } from '../types'

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [showPhone, setShowPhone] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [showChatForm, setShowChatForm] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportNote, setReportNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const currentUser = authService.getCurrentUser()
  const isAuthenticated = authService.isAuthenticated()

  useEffect(() => {
    if (id) {
      const listingId = parseInt(id)
      const found = listingService.getListing(listingId)
      if (found) {
        setListing(found)
      } else {
        setError('Không tìm thấy tin đăng')
      }
      setLoading(false)
    }
  }, [id])

  const handleRevealPhone = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setShowPhone(true)
  }

  const handleReportListing = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!reportReason || !reportNote) {
      alert('Vui lòng nhập đầy đủ thông tin báo cáo')
      return
    }
    if (listing && currentUser) {
      listingService.reportListing(listing.id, currentUser.id, reportReason, reportNote)
      alert('Báo cáo tin đăng thành công')
      setShowReportForm(false)
      setReportReason('')
      setReportNote('')
    }
  }

  const handleStartChat = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (listing && currentUser && listing.responsibleBrokerId !== currentUser.id) {
      const otherUserId = listing.responsibleBrokerId || listing.sellerId
      const conversation = chatService.createConversation(currentUser.id, otherUserId, listing.id)
      navigate('/messages/' + conversation.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-red-600">{error || 'Không tìm thấy tin đăng'}</p>
      </div>
    )
  }

  // Check if user can view this listing (guest sees only APPROVED + ACTIVE)
  if (!isAuthenticated && (listing.status !== 'approved' || listing.moderation.decision !== 'APPROVED')) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-red-600">Bạn không có quyền xem tin đăng này</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/listings')}
          className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Quay lại danh sách
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-300 flex items-center justify-center">
                  <p className="text-gray-600">Không có ảnh</p>
                </div>
              )}

              {listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {listing.images.slice(1).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Ảnh ${idx + 2}`}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <p className="text-3xl font-bold text-blue-600 mb-4">{listing.price}</p>

              <div className="space-y-2 text-gray-700 mb-6">
                <p>
                  <strong>Loại:</strong> {listing.type}
                </p>
                <p>
                  <strong>Giao dịch:</strong> {listing.transaction}
                </p>
                <p>
                  <strong>Diện tích:</strong> {listing.area} m²
                </p>
                {listing.bedrooms && (
                  <p>
                    <strong>Phòng ngủ:</strong> {listing.bedrooms}
                  </p>
                )}
                {listing.bathrooms && (
                  <p>
                    <strong>Phòng tắm:</strong> {listing.bathrooms}
                  </p>
                )}
                <p>
                  <strong>Địa chỉ:</strong> {listing.address}, {listing.district}, {listing.city}
                </p>
              </div>

              {/* Contact Section */}
              <div className="border-t pt-4 space-y-3">
                <button
                  onClick={handleRevealPhone}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {showPhone ? `📞 ${listing.sellerPhone}` : 'Xem số điện thoại'}
                </button>

                <button
                  onClick={handleStartChat}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                  💬 Gửi tin nhắn
                </button>

                <button
                  onClick={() => setShowReportForm(!showReportForm)}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                >
                  🚩 Báo cáo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả</h2>
          <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
        </div>

        {/* Report Form */}
        {showReportForm && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6 border-2 border-red-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Báo cáo tin đăng</h2>
            <div className="space-y-4">
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">Chọn lý do báo cáo</option>
                <option value="spam">Spam</option>
                <option value="fraud">Gian lận</option>
                <option value="inappropriate">Nội dung không phù hợp</option>
                <option value="duplicate">Trùng lặp</option>
                <option value="other">Khác</option>
              </select>

              <textarea
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="Ghi chú thêm..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleReportListing}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Gửi báo cáo
                </button>
                <button
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Huỷ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
