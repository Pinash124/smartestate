import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listingService } from '@/services/listing'
import { authService } from '@/services/auth'
import { Listing } from '@/types'

/* ─── SVG helpers ─── */
const Icon = ({ d, cls = 'w-4 h-4' }: { d: string; cls?: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)
const MapPinIcon = () => <Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" cls="w-3.5 h-3.5" />
const AreaIcon = () => <Icon d="M4 4h16v16H4z" cls="w-3.5 h-3.5" />
const BedIcon = () => <Icon d="M3 7v11m0-4h18M3 18h18M5 7h14a2 2 0 012 2v2H3V9a2 2 0 012-2z" cls="w-3.5 h-3.5" />
const BathIcon = () => <Icon d="M4 12h16M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M6 12V5a2 2 0 012-2h1" cls="w-3.5 h-3.5" />

/* ─── Label maps ─── */
const TYPE_LABELS: Record<string, string> = { apartment: 'Chung cư', house: 'Nhà', land: 'Đất', office: 'Văn phòng' }
const TX_LABELS: Record<string, string> = { buy: 'Mua', rent: 'Thuê' }

/* ─── Skeleton ─── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="h-52 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-200 rounded-full w-1/3" />
      <div className="h-4 bg-gray-200 rounded-full w-full" />
      <div className="h-4 bg-gray-200 rounded-full w-2/3" />
    </div>
  </div>
)

export default function FavoritesPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const [favorites, setFavorites] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const favs = await listingService.getFavoriteListings()
        setFavorites(favs)
      } catch (error) {
        console.error('Error loading favorites:', error)
      } finally {
        setLoading(false)
      }
    }
    void loadFavorites()
  }, [user])

  const handleRemove = async (listingId: string) => {
    if (!user) return
    try {
      const success = await listingService.removeFavorite(listingId)
      if (success) {
        setFavorites(favorites.filter((f) => f.id !== listingId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  /* ─── Not logged in ─── */
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center max-w-md">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Icon d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" cls="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Đăng nhập để xem tin đã lưu</h2>
          <p className="text-gray-500 text-sm mb-6">Lưu các tin đăng yêu thích để xem lại sau</p>
          <Link
            to="/login"
            className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-200/40"
          >
            Đăng nhập ngay
          </Link>
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Tin đã lưu
              </h1>
              <p className="text-amber-100 text-sm mt-1">
                {favorites.length} bất động sản bạn quan tâm
              </p>
            </div>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/30 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              Khám phá thêm
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════ CONTENT ═══════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : favorites.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icon d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" cls="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có tin nào được lưu</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Hãy thả tim các bất động sản bạn thích để xem lại tại đây
            </p>
            <Link
              to="/listings"
              className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-200/40"
            >
              Xem danh sách tin đăng
            </Link>
          </div>
        ) : (
          /* Listing Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                {/* ── Image ── */}
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  {listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" cls="w-12 h-12 text-gray-300" />
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(listing.id)
                    }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
                    title="Bỏ lưu"
                  >
                    <Icon d="M6 18L18 6M6 6l12 12" cls="w-4 h-4" />
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
                      {TYPE_LABELS[listing.type] || listing.type}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur-sm ${listing.transaction === 'buy' ? 'bg-emerald-500/90 text-white' : 'bg-blue-500/90 text-white'
                      }`}>
                      {TX_LABELS[listing.transaction] || listing.transaction}
                    </span>
                  </div>
                </div>

                {/* ── Card body ── */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-2">
                    <MapPinIcon />
                    <span className="text-xs font-medium truncate">{listing.city}</span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem] mb-3 group-hover:text-amber-700 transition-colors">
                    {listing.title}
                  </h3>

                  <p className="text-lg font-extrabold text-amber-600 mb-3">
                    {listing.price}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                      <AreaIcon />
                      {listing.area} m²
                    </span>
                    {listing.bedrooms && listing.bedrooms > 0 && (
                      <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                        <BedIcon />
                        {listing.bedrooms} PN
                      </span>
                    )}
                    {listing.bathrooms && listing.bathrooms > 0 && (
                      <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                        <BathIcon />
                        {listing.bathrooms} WC
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
