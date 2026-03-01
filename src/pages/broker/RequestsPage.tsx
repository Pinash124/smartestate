import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth'
import { fetchBrokerRequests, respondToTakeoverRequest } from '@/services/adminService'
import { listingService } from '@/services/listing'
import { Listing } from '@/types'

interface TakeoverRequest {
  id: string
  listingId: string
  brokerId: string
  status: string
  createdAt: string
  listing?: Listing
}

export default function BrokerRequestsPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()

  const [requests, setRequests] = useState<TakeoverRequest[]>([])
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('pending')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)   // ID being processed
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadRequests = async () => {
    setLoading(true)
    try {
      const raw = await fetchBrokerRequests()
      // Optionally enrich with listing data
      const enriched: TakeoverRequest[] = await Promise.all(
        raw.map(async (r) => {
          let listing: Listing | undefined
          try {
            listing = (await listingService.fetchListing(r.listingId)) ?? undefined
          } catch { /* ignore */ }
          return { ...r, listing }
        })
      )
      setRequests(enriched)
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [])

  const handleRespond = async (requestId: string, decision: 'accepted' | 'rejected') => {
    setActionId(requestId)
    try {
      const ok = await respondToTakeoverRequest(requestId, decision)
      if (ok) {
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: decision } : r))
        showToast(decision === 'accepted' ? 'Đã chấp nhận yêu cầu!' : 'Đã từ chối yêu cầu.', 'ok')
      } else {
        showToast('Không thể thực hiện. Thử lại.', 'err')
      }
    } catch {
      showToast('Lỗi kết nối. Thử lại.', 'err')
    } finally {
      setActionId(null)
    }
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  const countOf = (s: string) => s === 'all' ? requests.length : requests.filter(r => r.status === s).length

  const TABS: { value: typeof filter; label: string; active: string }[] = [
    { value: 'pending', label: 'Chờ xử lý', active: 'bg-amber-500 text-white shadow-lg shadow-amber-100' },
    { value: 'accepted', label: 'Đã chấp nhận', active: 'bg-green-600 text-white shadow-lg shadow-green-100' },
    { value: 'rejected', label: 'Đã từ chối', active: 'bg-red-500 text-white shadow-lg shadow-red-100' },
    { value: 'all', label: 'Tất cả', active: 'bg-gray-900 text-white shadow-lg' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-lg font-bold text-sm transition-all ${toast.type === 'ok' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'ok' ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      {/* ─── Header ─── */}
      <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">📋</div>
            <div>
              <h1 className="text-3xl font-black text-white">Yêu cầu Takeover</h1>
              <p className="text-blue-100 text-sm mt-1">
                Quản lý các yêu cầu ủy quyền từ Seller · {user?.name || 'Broker'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === tab.value ? tab.active : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-80">({countOf(tab.value)})</span>
            </button>
          ))}
        </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
            <span className="text-4xl mb-4 block">📭</span>
            <p className="text-gray-400 font-medium">Không có yêu cầu nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filtered.map(req => {
              const isPending = req.status === 'pending'
              const isAccepted = req.status === 'accepted'
              const listing = req.listing

              return (
                <div key={req.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Listing image */}
                    <div className="w-full md:w-56 h-40 flex-shrink-0">
                      {listing?.images?.[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-3xl">🏠</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {listing?.title || `Listing #${req.listingId.slice(0, 8)}`}
                            </h3>
                            {listing && (
                              <p className="text-sm text-gray-500 mt-0.5">
                                Seller: <span className="font-bold text-gray-700">{listing.sellerName}</span>
                                {listing.city && <> · {listing.city}</>}
                              </p>
                            )}
                          </div>
                          {/* Status badge */}
                          <span className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider shrink-0 ${isPending ? 'bg-amber-100 text-amber-700' :
                            isAccepted ? 'bg-green-100 text-green-700' :
                              'bg-red-100   text-red-700'
                            }`}>
                            {isPending ? 'Chờ xử lý' : isAccepted ? 'Đã chấp nhận' : 'Đã từ chối'}
                          </span>
                        </div>

                        {/* Details chips */}
                        {listing && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl text-xs font-bold">{listing.price}</span>
                            <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-xl text-xs font-bold">{listing.area} m²</span>
                            {listing.city && <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-xl text-xs font-bold">{listing.city}</span>}
                          </div>
                        )}

                        <div className="mt-3">
                          <p className="text-xs text-amber-700 font-medium bg-amber-50 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg">
                            ⚠️ Hệ thống trừ <b className="mx-0.5">30 điểm</b> khi bạn chấp nhận
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-50 pt-5 mt-5">
                        <p className="text-xs text-gray-400">
                          Yêu cầu nhận ngày: <span className="font-medium">{new Date(req.createdAt).toLocaleDateString('vi-VN')}</span>
                        </p>

                        <div className="flex gap-2 w-full sm:w-auto">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleRespond(req.id, 'accepted')}
                                disabled={actionId === req.id}
                                className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50"
                              >
                                {actionId === req.id ? '...' : 'Chấp nhận'}
                              </button>
                              <button
                                onClick={() => handleRespond(req.id, 'rejected')}
                                disabled={actionId === req.id}
                                className="flex-1 sm:flex-none bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition disabled:opacity-50"
                              >
                                Từ chối
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => listing && navigate(`/listing/${listing.id}`)}
                              className="w-full sm:w-auto bg-gray-900 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition"
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