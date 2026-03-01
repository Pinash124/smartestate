import { useState, useEffect } from 'react'
import { authService } from '@/services/auth'
import { listingService } from '@/services/listing'
import { fetchAdminListings, approveListingAdmin, rejectListingAdmin } from '@/services/adminService'
import { Listing } from '@/types'
import AdminSidebar from '@/components/AdminSidebar'

export default function ModerationPage() {
  const user = authService.getCurrentUser()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'need_review' | 'approved' | 'rejected'>('need_review')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // Fetch listings from admin API, with fallback to listingService
  const fetchData = async () => {
    setLoading(true)
    try {
      // Try admin endpoint first, fallback to generic listing endpoint
      let allListings: Listing[] = []
      try {
        const adminData = await fetchAdminListings()
        if (adminData.length > 0) {
          // Map admin API response if needed (reuse listingService mapping)
          allListings = await listingService.getAllListings()
        } else {
          allListings = await listingService.getAllListings()
        }
      } catch {
        allListings = await listingService.getAllListings()
      }

      // Filter based on selected tab
      let filtered = allListings
      if (filter === 'need_review') {
        filtered = filtered.filter((l: Listing) =>
          l.moderation.status === 'need_review' ||
          l.moderation.status === 'pending' ||
          l.status === 'pending_moderation'
        )
      } else if (filter === 'approved') {
        filtered = filtered.filter((l: Listing) =>
          l.moderation.status.includes('approved') || l.status === 'active'
        )
      } else if (filter === 'rejected') {
        filtered = filtered.filter((l: Listing) =>
          l.moderation.status.includes('rejected') || l.status === 'rejected'
        )
      }

      setListings(filtered)
    } catch (error) {
      console.error('Error loading listings:', error)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filter])

  const handleApprove = async (id: string) => {
    setActionLoading(true)
    try {
      // Try admin API first, fallback to listingService
      const success = await approveListingAdmin(id)
      if (!success) {
        await listingService.approveListing(id, user?.id || '')
      }
      alert('Đã phê duyệt tin đăng!')
      await fetchData()
      setSelectedListing(null)
    } catch (error) {
      console.error('Error approving:', error)
      alert('Lỗi khi phê duyệt tin đăng')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectReason) return alert('Vui lòng nhập lý do từ chối')
    setActionLoading(true)
    try {
      const success = await rejectListingAdmin(id, rejectReason)
      if (!success) {
        await listingService.rejectListing(id, user?.id || '', rejectReason)
      }
      alert('Đã từ chối tin đăng')
      await fetchData()
      setSelectedListing(null)
      setRejectReason('')
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('Lỗi khi từ chối tin đăng')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-64 min-h-screen">
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800">Hệ thống kiểm duyệt</h2>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              API Connected
            </span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kiểm duyệt tin</h1>
              <p className="text-gray-500">Đang hiển thị {listings.length} tin đăng {filter === 'need_review' ? 'chờ xử lý' : ''}</p>
            </div>
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 self-start">
              <button
                onClick={() => setFilter('need_review')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'need_review' ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Chờ duyệt
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'approved' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Đã duyệt
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'rejected' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Từ chối
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-3 h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <svg className="animate-spin w-6 h-6 mx-auto mb-2 text-amber-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-gray-400 text-sm">Đang tải...</p>
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                  Trống
                </div>
              ) : (
                listings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => setSelectedListing(listing)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedListing?.id === listing.id
                      ? 'bg-white border-blue-500 shadow-lg ring-2 ring-blue-50'
                      : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 truncate flex-1">{listing.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-2 ${listing.moderation.riskScore > 70 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                        AI: {listing.moderation.riskScore}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-blue-600 mb-2">{listing.price}</p>
                    <div className="flex items-center text-xs text-gray-400">
                      <span className="truncate">{listing.sellerName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-8">
              {selectedListing ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-24">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedListing.title}</h2>
                      <p className="text-gray-500 flex items-center mt-1">
                        <span className="mr-1"></span>
                        {`${selectedListing.address}, ${selectedListing.district}, ${selectedListing.city}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Risk Level</p>
                      <div className={`text-2xl font-black ${selectedListing.moderation.riskScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedListing.moderation.riskScore}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <img
                      src={selectedListing.images[0] || 'https://via.placeholder.com/400x300'}
                      className="w-full h-56 object-cover rounded-2xl shadow-inner bg-gray-100"
                      alt="Thumbnail"
                    />
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <h4 className="font-bold text-xs mb-3 uppercase text-gray-400 tracking-widest">AI Analysis Flags</h4>
                      <ul className="space-y-3">
                        {selectedListing.moderation.flags.map((f, i) => (
                          <li key={i} className="text-sm text-red-600 flex items-start leading-tight">
                            <span className="mr-2 mt-0.5 text-red-500 font-bold">!</span> <span>{f}</span>
                          </li>
                        ))}
                        {selectedListing.moderation.flags.length === 0 && (
                          <li className="text-sm text-green-600 flex items-center font-medium">
                            <span className="mr-2 font-bold">OK</span> Nội dung an toàn
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-bold text-gray-900 mb-2">Mô tả bài đăng</h4>
                    <p className="text-gray-600 text-sm leading-relaxed max-h-32 overflow-y-auto pr-2">
                      {selectedListing.description}
                    </p>
                  </div>

                  {filter === 'need_review' && (
                    <div className="border-t border-gray-100 pt-6">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Xử lý vi phạm</label>
                      <textarea
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm mb-4 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
                        placeholder="Nhập lý do nếu bạn quyết định từ chối tin này..."
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleApprove(selectedListing.id)}
                          disabled={actionLoading}
                          className="flex-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? 'Đang xử lý...' : 'Phê duyệt tin'}
                        </button>
                        <button
                          onClick={() => handleReject(selectedListing.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-red-50 text-red-600 py-3.5 rounded-2xl font-bold hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  )}

                  {filter !== 'need_review' && (
                    <div className={`mt-4 p-4 rounded-2xl flex items-center gap-3 ${selectedListing.moderation.status.includes('approved') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                      <span className="text-xl">
                        {selectedListing.moderation.status.includes('approved') ? 'OK' : 'X'}
                      </span>
                      <p className="text-sm font-bold uppercase tracking-wide">
                        Trạng thái hiện tại: {selectedListing.moderation.status}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 transition-all">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-lg font-bold text-gray-400 mb-4">BĐS</div>
                  <h3 className="text-xl font-bold text-gray-900">Chưa có tin nào được chọn</h3>
                  <p className="text-gray-400 mt-1">Chọn một tin đăng từ danh sách bên trái để bắt đầu kiểm duyệt.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
