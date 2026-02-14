import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth'
import { listingService } from '../../services/listing'
import { Listing, ListingStatus } from '../../types'

/* ─── Label maps ─── */
const TYPE_LABELS: Record<string, string> = { apartment: 'Chung cư', house: 'Nhà', land: 'Đất', office: 'Văn phòng' }
const TX_LABELS: Record<string, string> = { buy: 'Mua', rent: 'Thuê' }
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  active: { label: 'Đang bán', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending_moderation: { label: 'Chờ duyệt', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  approved: { label: 'Đã duyệt', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  done: { label: 'Hoàn thành', bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
  cancelled: { label: 'Đã huỷ', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
  rejected: { label: 'Bị từ chối', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
  draft: { label: 'Bản nháp', bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-300' },
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang bán' },
  { value: 'pending_moderation', label: 'Chờ duyệt' },
  { value: 'done', label: 'Hoàn thành' },
]

/* ─── SVG helpers ─── */
const Icon = ({ d, cls = 'w-4 h-4' }: { d: string; cls?: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

/* ─── Skeleton row ─── */
const SkeletonRow = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5 animate-pulse">
    <div className="w-28 h-28 sm:w-36 sm:h-28 rounded-xl bg-gray-200 flex-shrink-0" />
    <div className="flex-1 space-y-3 py-1">
      <div className="h-3 bg-gray-200 rounded-full w-1/4" />
      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
      <div className="h-5 bg-gray-200 rounded-full w-1/3" />
      <div className="flex gap-2"><div className="h-6 bg-gray-200 rounded-lg w-16" /><div className="h-6 bg-gray-200 rounded-lg w-16" /></div>
    </div>
  </div>
)

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

  const filteredListings = listings.filter((l) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    return matchSearch && matchStatus
  })

  const countByStatus = (s: string) => s === 'all' ? listings.length : listings.filter(l => l.status === s).length

  /* ─── Not logged in ─── */
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center max-w-md">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" cls="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-500 text-sm mb-6">Bạn cần đăng nhập để xem và quản lý tin đăng của mình</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-200/40"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Tin đăng của tôi
              </h1>
              <p className="text-amber-100 text-sm mt-1">
                Quản lý {listings.length} tin đăng bất động sản
              </p>
            </div>
            <button
              onClick={() => navigate('/create-listing')}
              className="inline-flex items-center gap-2 bg-white text-amber-600 px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-amber-50 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Tạo tin đăng mới
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════ TABS + SEARCH ═══════════════════════ */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
            {/* Status tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 -mb-1">
              {STATUS_TABS.map((tab) => {
                const count = countByStatus(tab.value)
                const isActive = filterStatus === tab.value
                return (
                  <button
                    key={tab.value}
                    onClick={() => setFilterStatus(tab.value)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[1.25rem] text-center ${isActive ? 'bg-amber-200/60 text-amber-800' : 'bg-gray-100 text-gray-400'
                      }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" cls="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm tiêu đề..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════ CONTENT ═══════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filteredListings.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filterStatus !== 'all' ? 'Không có tin đăng nào ở trạng thái này' : 'Chưa có tin đăng nào'}
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              {filterStatus !== 'all'
                ? 'Thử chọn trạng thái khác hoặc xem tất cả tin đăng'
                : 'Bắt đầu đăng tin bất động sản đầu tiên của bạn ngay bây giờ'}
            </p>
            <button
              onClick={() => filterStatus !== 'all' ? setFilterStatus('all') : navigate('/create-listing')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-200/40"
            >
              {filterStatus !== 'all' ? 'Xem tất cả' : '+ Tạo tin đăng mới'}
            </button>
          </div>
        ) : (
          /* Listing rows */
          <div className="space-y-4">
            {filteredListings.map((listing) => {
              const status = STATUS_CONFIG[listing.status] || STATUS_CONFIG.draft
              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* ── Image ── */}
                    <div className="relative w-full sm:w-44 h-44 sm:h-auto flex-shrink-0 overflow-hidden">
                      {listing.images?.length ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full min-h-[120px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
                        </div>
                      )}
                      {/* Type badge on image */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-0.5 rounded-md text-[11px] font-bold shadow-sm">
                          {TYPE_LABELS[listing.type] || listing.type}
                        </span>
                      </div>
                      {/* Image count */}
                      {listing.images?.length > 1 && (
                        <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                          {listing.images.length}
                        </div>
                      )}
                    </div>

                    {/* ── Info ── */}
                    <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Status + Transaction badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${listing.transaction === 'buy' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                            {TX_LABELS[listing.transaction] || listing.transaction}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-1 group-hover:text-amber-700 transition-colors mb-1.5">
                          {listing.title}
                        </h3>

                        {/* Details row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" cls="w-3.5 h-3.5 text-gray-400" />
                            {listing.city}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Icon d="M4 4h16v16H4z" cls="w-3.5 h-3.5 text-gray-400" />
                            {listing.area} m²
                          </span>
                          {listing.bedrooms && listing.bedrooms > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Icon d="M3 7v11m0-4h18M3 18h18M5 7h14a2 2 0 012 2v2H3V9a2 2 0 012-2z" cls="w-3.5 h-3.5 text-gray-400" />
                              {listing.bedrooms} PN
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="sm:text-right sm:min-w-[120px] flex-shrink-0">
                        <p className="text-lg font-extrabold text-amber-600">{listing.price}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col items-center gap-2 flex-shrink-0 sm:border-l sm:border-gray-100 sm:pl-5 sm:ml-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/edit-listing/${listing.id}`) }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" cls="w-3.5 h-3.5" />
                          Sửa
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/chat?listing=${listing.id}`) }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
                          title="Nhắn tin"
                        >
                          <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" cls="w-3.5 h-3.5" />
                          Chat
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Bạn có chắc muốn xoá tin đăng này?')) {
                              setListings((prev) => prev.filter((l) => l.id !== listing.id))
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
                          title="Xoá"
                        >
                          <Icon d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" cls="w-3.5 h-3.5" />
                          Xoá
                        </button>
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
