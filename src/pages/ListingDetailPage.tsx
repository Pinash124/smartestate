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
  const [phone, setPhone] = useState('')
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportNote, setReportNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)

  const currentUser = authService.getCurrentUser()
  const isAuthenticated = authService.isAuthenticated()

  useEffect(() => {
    const loadListing = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const found = await listingService.fetchListing(id)
        if (found) {
          setListing(found)
          setPhone(found.sellerPhone)
          if (currentUser) {
            setIsFavorite(listingService.isFavorite(found.id))
          }
        } else {
          setError('Không tìm thấy tin đăng')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không tìm thấy tin đăng'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    void loadListing()
  }, [id, currentUser])

  useEffect(() => {
    if (listing && currentUser) {
      setIsFavorite(listingService.isFavorite(listing.id))
    }
  }, [listing, currentUser])

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!listing) return
    try {
      const newState = await listingService.toggleFavorite(listing.id)
      setIsFavorite(newState)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleRevealPhone = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!listing) return
    try {
      const realPhone = await listingService.revealPhone(listing.id)
      if (realPhone) {
        setPhone(realPhone)
        setShowPhone(true)
      }
    } catch {
      alert('Không thể lấy số điện thoại')
    }
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
      listingService.reportListing(listing.id, reportReason, reportNote)
      alert('Báo cáo tin đăng thành công')
      setShowReportForm(false)
      setReportReason('')
      setReportNote('')
    }
  }

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!listing || !currentUser) return

    try {
      const otherUserId = listing.responsibleBrokerId || listing.sellerId
      const conversation = await chatService.createConversation(
        currentUser.id,
        otherUserId,
        listing.id
      )
      navigate('/messages/' + conversation.id)
    } catch (error) {
      console.error('Error starting chat:', error)
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
  if (!isAuthenticated && (!['approved', 'active'].includes(listing.status) || listing.moderation.decision !== 'APPROVED')) {
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
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                <button
                  onClick={handleToggleFavorite}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
                    isFavorite
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-500'
                  }`}
                >
                  {isFavorite ? 'Đã lưu' : 'Lưu tin'}
                </button>
              </div>
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
                  {showPhone ? `📞 ${phone || listing.sellerPhone}` : 'Xem số điện thoại'}
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
