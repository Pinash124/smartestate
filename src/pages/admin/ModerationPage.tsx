import { useState, useEffect } from 'react'
import { authService } from '../../services/auth'
import { listingService } from '../../services/listing'
import { Listing } from '../../types'

export default function ModerationPage() {
  const user = authService.getCurrentUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [filter, setFilter] = useState<'all' | 'need_review' | 'approved' | 'rejected'>('need_review')
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    const allListings = listingService.getAllListings()
    let filtered = allListings

    if (filter === 'need_review') {
      filtered = filtered.filter((l) => l.moderation.status === 'need_review')
    } else if (filter === 'approved') {
      filtered = filtered.filter((l) => l.moderation.status === 'auto_approved' || l.moderation.status === 'manually_approved')
    } else if (filter === 'rejected') {
      filtered = filtered.filter((l) => l.moderation.status === 'auto_rejected' || l.moderation.status === 'manually_rejected')
    }

    setListings(filtered)
    setLoading(false)
  }, [filter])

  if (!user || user.role !== 'admin') {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Duyệt tin đăng</h1>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tất cả ({listingService.getAllListings().length})
          </button>
          <button
            onClick={() => setFilter('need_review')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'need_review'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cần xem xét ({listingService.getAllListings().filter((l) => l.moderation.status === 'need_review').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Đã duyệt ({listingService.getAllListings().filter((l) => l.moderation.status.includes('approved')).length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bị từ chối ({listingService.getAllListings().filter((l) => l.moderation.status.includes('rejected')).length})
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">Không có tin đăng nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Listings List */}
            <div className="lg:col-span-1">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {listings.map((listing) => (
                  <button
                    key={listing.id}
                    onClick={() => setSelectedListing(listing)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedListing?.id === listing.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium truncate">{listing.title}</p>
                    <p className={`text-xs ${selectedListing?.id === listing.id ? 'text-blue-100' : 'text-gray-500'}`}>
                      {listing.sellerName}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail View */}
            {selectedListing && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                  {/* Header */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedListing.title}
                    </h2>
                    <p className="text-gray-600">
                      Người đăng: <strong>{selectedListing.sellerName}</strong>
                    </p>
                    <p className="text-gray-600">
                      Giá: <strong>{selectedListing.price}</strong>
                    </p>
                  </div>

                  {/* Image */}
                  {selectedListing.images.length > 0 && (
                    <img
                      src={selectedListing.images[0]}
                      alt={selectedListing.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}

                  {/* Moderation Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">Kết quả AI duyệt</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Điểm rủi ro:</strong> {selectedListing.moderation.riskScore}/100
                    </p>
                    {selectedListing.moderation.flags.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Cảnh báo:</p>
                        <ul className="list-disc pl-5 text-gray-700 text-sm">
                          {selectedListing.moderation.flags.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedListing.moderation.suggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-gray-900 mb-1">Gợi ý:</p>
                        <ul className="list-disc pl-5 text-gray-700 text-sm">
                          {selectedListing.moderation.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Mô tả</h3>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{selectedListing.description}</p>
                  </div>

                  {/* Actions - Only show if NEED_REVIEW */}
                  {selectedListing.moderation.status === 'need_review' && (
                    <div className="border-t pt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nếu từ chối, vui lòng nhập lý do:
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Lý do từ chối..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            listingService.approveListing(selectedListing.id, user.id)
                            setSelectedListing(null)
                            setRejectReason('')
                            alert('Duyệt thành công')
                            // Reload
                            window.location.reload()
                          }}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          ✅ Duyệt
                        </button>

                        <button
                          onClick={() => {
                            if (!rejectReason) {
                              alert('Vui lòng nhập lý do từ chối')
                              return
                            }
                            listingService.rejectListing(selectedListing.id, user.id)
                            setSelectedListing(null)
                            setRejectReason('')
                            alert('Từ chối thành công')
                            window.location.reload()
                          }}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
                        >
                          ❌ Từ chối
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedListing.moderation.status !== 'need_review' && (
                    <div className="bg-blue-50 p-4 rounded-lg text-blue-700 text-sm">
                      ℹ️ Tin đăng này đã được xử lý ({selectedListing.moderation.status})
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
