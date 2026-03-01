import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth'
import { listingService } from '@/services/listing'
import { fetchBrokerRequests, respondToTakeoverRequest } from '@/services/adminService'
import { Listing } from '@/types'

interface TakeoverRequest {
    id: string
    listingId: string
    brokerId: string
    status: string
    createdAt: string
}

export default function BrokerManagementPage() {
    const navigate = useNavigate()
    const currentUser = authService.getCurrentUser()
    const isBroker = currentUser?.role === 'broker'

    const [requests, setRequests] = useState<TakeoverRequest[]>([])
    const [managedListings, setManagedListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'requests' | 'managed'>('requests')

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            const [reqs, listings] = await Promise.all([
                fetchBrokerRequests(),
                listingService.getAllListings(),
            ])
            setRequests(reqs)
            // Filter listings managed by this broker
            const managed = listings.filter(
                (l) => l.responsibleBrokerId === currentUser?.id
            )
            setManagedListings(managed)
            setLoading(false)
        }
        void loadData()
    }, [currentUser?.id])

    const handleRespond = async (requestId: string, status: 'accepted' | 'rejected') => {
        setActionLoading(requestId)
        const success = await respondToTakeoverRequest(requestId, status)
        if (success) {
            setRequests((prev) =>
                prev.map((r) => (r.id === requestId ? { ...r, status } : r))
            )
        }
        setActionLoading(null)
    }

    if (!isBroker) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 font-bold text-lg">Trang này chỉ dành cho Broker.</p>
                    <Link to="/" className="mt-4 inline-block text-sm text-amber-600 hover:underline">
                        Về trang chủ
                    </Link>
                </div>
            </div>
        )
    }

    const pendingRequests = requests.filter((r) => r.status === 'pending')
    const answeredRequests = requests.filter((r) => r.status !== 'pending')

    return (
        <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý Broker</h1>
                        <p className="text-gray-500 mt-1">
                            Xem yêu cầu ủy quyền và quản lý tin đăng của bạn
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/listings')}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                        ← Về danh sách
                    </button>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'requests'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Yêu cầu
                        {pendingRequests.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-xs font-bold">
                                {pendingRequests.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('managed')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'managed'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Đang quản lý
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-xs font-bold">
                            {managedListings.length}
                        </span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <svg className="animate-spin w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="font-semibold">Đang tải...</span>
                    </div>
                ) : activeTab === 'requests' ? (
                    /* Requests Tab */
                    <div className="space-y-4">
                        {pendingRequests.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    Chờ xử lý ({pendingRequests.length})
                                </h3>
                                <div className="space-y-3">
                                    {pendingRequests.map((req) => (
                                        <div
                                            key={req.id}
                                            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    Yêu cầu quản lý tin #{req.listingId.slice(0, 8)}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRespond(req.id, 'accepted')}
                                                    disabled={actionLoading === req.id}
                                                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 disabled:opacity-50 transition"
                                                >
                                                    Chấp nhận
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(req.id, 'rejected')}
                                                    disabled={actionLoading === req.id}
                                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 disabled:opacity-50 transition"
                                                >
                                                    Từ chối
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {answeredRequests.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    Đã xử lý ({answeredRequests.length})
                                </h3>
                                <div className="space-y-3">
                                    {answeredRequests.map((req) => (
                                        <div
                                            key={req.id}
                                            className="bg-white rounded-xl p-5 border border-gray-100 flex items-center justify-between opacity-75"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-700 text-sm">
                                                    Tin #{req.listingId.slice(0, 8)}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-lg text-xs font-bold ${req.status === 'accepted'
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'bg-red-50 text-red-600'
                                                    }`}
                                            >
                                                {req.status === 'accepted' ? 'Đã chấp nhận' : 'Đã từ chối'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {requests.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-gray-500 text-lg font-medium mb-4">--</p>
                                <p className="text-gray-500 font-medium">Chưa có yêu cầu ủy quyền nào.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Managed Listings Tab */
                    <div>
                        {managedListings.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-gray-500 text-lg font-medium mb-4">--</p>
                                <p className="text-gray-500 font-medium">Chưa quản lý tin đăng nào.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {managedListings.map((listing) => (
                                    <Link
                                        key={listing.id}
                                        to={`/listings/${listing.id}`}
                                        className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex items-center gap-4 group"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {listing.images?.[0] ? (
                                                <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">BĐS</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm group-hover:text-amber-600 transition-colors truncate">
                                                {listing.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {listing.price} · {listing.city || 'N/A'}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${listing.status === 'active'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-gray-50 text-gray-500'
                                            }`}>
                                            {listing.status === 'active' ? 'Hoạt động' : listing.status}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
