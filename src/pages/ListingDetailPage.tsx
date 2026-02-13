import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { listingService } from '../services/listing'
import { authService } from '../services/auth'
import { chatService } from '../services/chat'
import { Listing } from '../types'
import {
  MapPinIcon,
  BedIcon,
  BathIcon,
  AreaIcon,
  PhoneIcon,
  ChatIcon,
  AlertCircleIcon,
  HeartIcon,
  CheckCircleIcon,
  ShieldIcon,
  ClockIcon,
} from '../components/Icons'

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
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const currentUser = authService.getCurrentUser()
  const isAuthenticated = authService.isAuthenticated()

  useEffect(() => {
    window.scrollTo(0, 0)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertCircleIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy tin đăng</h2>
        <p className="text-gray-600 mb-6">{error || 'Tin đăng có thể đã bị xóa hoặc không tồn tại.'}</p>
        <button
          onClick={() => navigate('/listings')}
          className="bg-amber-500 text-white px-6 py-2 rounded-full hover:bg-amber-600 transition"
        >
          Xem tin khác
        </button>
      </div>
    )
  }

  // Permission Check
  if (!isAuthenticated && (!['approved', 'active'].includes(listing.status) || listing.moderation.decision !== 'APPROVED')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600 font-medium">Bạn không có quyền xem tin đăng này (Đang chờ duyệt hoặc bị ẩn)</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb / Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/listings')}
            className="flex items-center text-gray-500 hover:text-amber-600 transition"
          >
            ← Quay lại danh sách
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full transition ${isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <HeartIcon className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
              <ShieldIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Images & Description */}
          <div className="lg:col-span-2 space-y-8">

            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              {/* Main Image */}
              <div className="aspect-video relative bg-gray-100">
                {listing.images.length > 0 ? (
                  <img
                    src={listing.images[activeImageIndex]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Chưa có hình ảnh
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm tracking-wider">
                    {listing.transaction === 'buy' ? 'Đang bán' : 'Cho thuê'}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="p-4 grid grid-cols-5 gap-2 overflow-x-auto">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${activeImageIndex === idx ? 'border-amber-500 ring-2 ring-amber-100/50' : 'border-transparent hover:border-gray-300'
                        }`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Features Mobile (Hidden on Desktop usually, but good to have context) */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="mb-4">
                <p className="text-sm font-bold text-amber-600 uppercase tracking-wide mb-1">{listing.type === 'apartment' ? 'Căn hộ chung cư' : listing.type}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{listing.title}</h1>
                <p className="text-gray-500 mt-2 flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {listing.address}, {listing.district}, {listing.city}
                </p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-gray-100">
                <div className="flex items-center text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
                    <AreaIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Diện tích</p>
                    <p className="font-bold">{listing.area} m²</p>
                  </div>
                </div>
                {listing.bedrooms && (
                  <div className="flex items-center text-gray-700">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mr-3">
                      <BedIcon className="w-5 h-5" />
                      {/* Use UserIcon as temporary placeholder for Bed if missing, but BedIcon exists */}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phòng ngủ</p>
                      <p className="font-bold">{listing.bedrooms}</p>
                    </div>
                  </div>
                )}
                {listing.bathrooms && (
                  <div className="flex items-center text-gray-700">
                    <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mr-3">
                      <BathIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phòng tắm</p>
                      <p className="font-bold">{listing.bathrooms}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-3">
                    <ClockIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Đăng tin</p>
                    <p className="font-bold">Mới</p>
                    {/* Ideally formatted date */}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Mô tả chi tiết</h2>
                <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                  {listing.description}
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 overflow-hidden">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Vị trí</h2>
              <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=21.0285,105.8542&zoom=13&size=600x300&key=YOUR_API_KEY_HERE')] bg-cover bg-center opacity-50 grayscale">
                  {/* Fake map background for visual */}
                </div>
                <div className="z-10 text-center">
                  <MapPinIcon className="w-8 h-8 text-red-500 mx-auto mb-2 animate-bounce" />
                  <p className="text-gray-600 font-medium">{listing.district}, {listing.city}</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Price Card */}
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
              <p className="text-gray-500 text-sm mb-1">Giá bán</p>
              <div className="flex items-baseline mb-4">
                <h2 className="text-3xl font-bold text-blue-600">{listing.price}</h2>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRevealPhone}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition flex items-center justify-center gap-2"
                >
                  <PhoneIcon className="w-5 h-5" />
                  {showPhone ? (phone || listing.sellerPhone) : 'Xem số điện thoại'}
                </button>

                <button
                  onClick={handleStartChat}
                  className="w-full bg-white border-2 border-green-500 text-green-600 font-bold py-3 rounded-xl hover:bg-green-50 transition flex items-center justify-center gap-2"
                >
                  <ChatIcon className="w-5 h-5" />
                  Nhắn tin qua Zalo
                </button>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Thông tin người đăng</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center text-amber-700 font-bold text-xl border-2 border-white shadow-sm">
                  {/* Better Avatar Logic */}
                  {listing.sellerName ? listing.sellerName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {listing.sellerName || 'Người dùng hệ thống'}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center">
                    <CheckCircleIcon className="w-3 h-3 text-green-500 mr-1" />
                    Đã xác thực
                  </p>
                </div>
              </div>

              <button className="w-full text-gray-500 text-sm font-medium hover:text-amber-600 transition border rounded-lg py-2">
                Xem trang cá nhân
              </button>
            </div>

            {/* Safety Tips */}
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
              <h3 className="font-bold text-orange-800 mb-3 flex items-center text-sm">
                <ShieldIcon className="w-4 h-4 mr-2" />
                Lưu ý an toàn
              </h3>
              <ul className="text-xs text-orange-700 space-y-2">
                <li>• KHÔNG chuyển khoản đặt cọc trước khi xem nhà.</li>
                <li>• Kiểm tra kỹ giấy tờ pháp lý.</li>
                <li>• Nên đi xem nhà cùng bạn bè hoặc người thân.</li>
              </ul>
              <button
                onClick={() => setShowReportForm(true)}
                className="mt-4 text-xs text-gray-500 underline hover:text-red-500"
              >
                Báo cáo tin đăng này
              </button>
            </div>

          </div>

        </div>

        {/* Report Modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center text-red-600">
                <AlertCircleIcon className="w-6 h-6 mr-2" />
                Báo cáo vi phạm
              </h2>
              <div className="space-y-4">
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Chọn lý do báo cáo</option>
                  <option value="spam">Spam / Tin rác</option>
                  <option value="fraud">Lừa đảo / Sai sự thật</option>
                  <option value="inappropriate">Nội dung không phù hợp</option>
                  <option value="duplicate">Trùng lặp</option>
                  <option value="other">Khác</option>
                </select>

                <textarea
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleReportListing}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Gửi báo cáo
                  </button>
                  <button
                    onClick={() => setShowReportForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Huỷ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
