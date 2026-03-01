import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth'
import { listingService } from '@/services/listing'
import { sendTakeoverRequest, fetchAllUsers } from '@/services/adminService'
import { Listing, User } from '@/types'

export default function TakeoverPage() {
    const navigate = useNavigate()
    const user = authService.getCurrentUser()

    const [listings, setListings] = useState<Listing[]>([])
    const [brokers, setBrokers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedListing, setSelectedListing] = useState<string>('')
    const [selectedBroker, setSelectedBroker] = useState<string>('')
    const [submitting, setSubmitting] = useState(false)
    const [sent, setSent] = useState(false)

    useEffect(() => {
        if (!user) return
        Promise.all([
            listingService.fetchListings(),
            fetchAllUsers(),
        ]).then(([allListings, allUsers]) => {
            // Only seller's own active listings
            const myActiveListings = allListings.filter(
                l => l.sellerId === user.id && (l.status === 'active' || l.status === 'approved')
            )
            setListings(myActiveListings)

            // Only broker-role users
            const brokerUsers = allUsers.filter(u => u.role === 'broker')
            setBrokers(brokerUsers)
        }).finally(() => setLoading(false))
    }, [user])

    const handleSubmit = async () => {
        if (!selectedListing || !selectedBroker) return
        setSubmitting(true)
        try {
            const result = await sendTakeoverRequest(selectedListing, selectedBroker)
            if (result) {
                setSent(true)
            } else {
                alert('Không thể gửi yêu cầu. Vui lòng thử lại.')
            }
        } catch {
            alert('Đã xảy ra lỗi khi gửi yêu cầu.')
        } finally {
            setSubmitting(false)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md">
                    <p className="text-gray-500 mb-4">Bạn cần đăng nhập để sử dụng tính năng này.</p>
                    <button onClick={() => navigate('/login')} className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition">
                        Đăng nhập
                    </button>
                </div>
            </div>
        )
    }

    if (sent) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-lg p-12 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">Yêu cầu đã được gửi!</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Broker sẽ xem xét và phản hồi yêu cầu của bạn. Hệ thống sẽ trừ <b>30 điểm</b> khi broker chấp nhận và takeover hoàn thành.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => { setSent(false); setSelectedListing(''); setSelectedBroker('') }}
                            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                            Gửi yêu cầu khác
                        </button>
                        <button
                            onClick={() => navigate('/my-listings')}
                            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 text-white hover:bg-amber-600 transition shadow-md"
                        >
                            Xem tin đăng
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const selectedListingObj = listings.find(l => l.id === selectedListing)
    const selectedBrokerObj = brokers.find(b => b.id === selectedBroker)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ─── Header ─── */}
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">🤝</div>
                        <div>
                            <h1 className="text-3xl font-black text-white">Ủy quyền Broker (Takeover)</h1>
                            <p className="text-slate-300 text-sm mt-1">Chọn bài đăng và broker bạn muốn ủy quyền quản lý</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                {/* Cost warning banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mb-8">
                    <span className="text-amber-500 text-xl mt-0.5">⚠️</span>
                    <div>
                        <p className="font-bold text-amber-800 text-sm">Lưu ý về phí Takeover</p>
                        <p className="text-amber-700 text-xs mt-0.5">
                            Khi broker chấp nhận yêu cầu, hệ thống sẽ tự động trừ <b>30 điểm</b> từ tài khoản của bạn và giao quyền quản lý tin đăng cho broker đó.
                            Hãy đảm bảo bạn có đủ điểm trước khi gửi yêu cầu.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ─── Form ─── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Step 1: Select listing */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm font-black">1</div>
                                <h3 className="font-bold text-gray-900">Chọn bài đăng cần ủy quyền</h3>
                            </div>
                            {loading ? (
                                <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
                            ) : listings.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <p className="text-sm">Bạn không có tin đăng nào đang hoạt động.</p>
                                    <button onClick={() => navigate('/create-listing')} className="mt-3 text-amber-600 font-bold text-sm hover:underline">
                                        Tạo tin đăng mới →
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {listings.map(l => (
                                        <button
                                            key={l.id}
                                            onClick={() => setSelectedListing(l.id)}
                                            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${selectedListing === l.id
                                                    ? 'border-amber-400 bg-amber-50'
                                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {l.images?.[0] ? (
                                                    <img src={l.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 shrink-0">🏠</div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 text-sm truncate">{l.title}</p>
                                                    <p className="text-xs text-gray-400 truncate">{l.city} · {l.price}</p>
                                                </div>
                                                {selectedListing === l.id && (
                                                    <span className="ml-auto text-amber-500 font-black text-lg shrink-0">✓</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Step 2: Select broker */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm font-black">2</div>
                                <h3 className="font-bold text-gray-900">Chọn Broker</h3>
                            </div>
                            {loading ? (
                                <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                            ) : brokers.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6">Chưa có broker nào trong hệ thống.</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {brokers.map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => setSelectedBroker(b.id)}
                                            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${selectedBroker === b.id
                                                    ? 'border-amber-400 bg-amber-50'
                                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={b.profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${b.name}`}
                                                    alt={b.name}
                                                    className="w-10 h-10 rounded-full bg-gray-100 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 text-sm">{b.name}</p>
                                                    <p className="text-xs text-gray-400">{b.email}</p>
                                                </div>
                                                {selectedBroker === b.id && (
                                                    <span className="ml-auto text-amber-500 font-black text-lg shrink-0">✓</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedListing || !selectedBroker || submitting}
                            className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Đang gửi yêu cầu...' : '🤝 Gửi yêu cầu Takeover (−30 điểm)'}
                        </button>
                    </div>

                    {/* ─── Summary panel ─── */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-4">
                            <h4 className="font-bold text-gray-700 text-sm mb-4">Tóm tắt yêu cầu</h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Bài đăng được chọn</p>
                                    {selectedListingObj ? (
                                        <p className="font-bold text-gray-900 text-sm line-clamp-2">{selectedListingObj.title}</p>
                                    ) : (
                                        <p className="text-gray-300 text-sm italic">Chưa chọn</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Broker được chọn</p>
                                    {selectedBrokerObj ? (
                                        <div className="flex items-center gap-2">
                                            <img src={selectedBrokerObj.profile.avatar} alt="" className="w-7 h-7 rounded-full" />
                                            <p className="font-bold text-gray-900 text-sm">{selectedBrokerObj.name}</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-300 text-sm italic">Chưa chọn</p>
                                    )}
                                </div>
                                <div className="pt-3 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-500">Phí takeover</span>
                                        <span className="font-black text-red-500 text-sm">−30 điểm</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400">Trừ khi broker chấp nhận</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
