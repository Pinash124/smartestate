import { useState, useEffect } from 'react'
import { pointsService } from '@/services/pointsService'
import { PointTransaction } from '@/types'
import AdminSidebar from '@/components/AdminSidebar'

const formatPrice = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const StatusBadge = ({ status }: { status: 'PAID' | 'PENDING' | 'FAILED' }) => {
    const map = {
        PAID: { label: 'Thành công', cls: 'bg-emerald-100 text-emerald-700' },
        PENDING: { label: 'Đang xử lý', cls: 'bg-amber-100  text-amber-700' },
        FAILED: { label: 'Thất bại', cls: 'bg-red-100    text-red-700' },
    }
    const { label, cls } = map[status]
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>{label}</span>
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<PointTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'FAILED'>('ALL')

    useEffect(() => {
        pointsService.getAdminPayments()
            .then(setPayments)
            .finally(() => setLoading(false))
    }, [])

    const filtered = filterStatus === 'ALL'
        ? payments
        : payments.filter(p => p.status === filterStatus)

    const totalRevenue = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)
    const totalPoints = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.points, 0)
    const pendingCount = payments.filter(p => p.status === 'PENDING').length

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar />

            <main className="ml-64 min-h-screen">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-gray-800">Báo cáo thanh toán điểm</h2>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        API Connected
                    </span>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán điểm</h1>
                    <p className="text-gray-500 mb-8">Tổng hợp doanh thu từ các giao dịch nạp điểm của người dùng.</p>

                    {/* ─── Summary Cards ─── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Doanh thu (PAID)</p>
                            <p className="text-2xl font-black text-emerald-600">{formatPrice(totalRevenue)}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tổng điểm đã bán</p>
                            <p className="text-2xl font-black text-amber-500">{totalPoints} điểm</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Đang chờ xử lý</p>
                            <p className="text-2xl font-black text-amber-400">{pendingCount} giao dịch</p>
                        </div>
                    </div>

                    {/* ─── Filter ─── */}
                    <div className="flex gap-2 mb-5">
                        {(['ALL', 'PAID', 'PENDING', 'FAILED'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filterStatus === s
                                        ? 'bg-gray-900 text-white shadow'
                                        : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                {s === 'ALL' ? 'Tất cả' : s === 'PAID' ? 'Thành công' : s === 'PENDING' ? 'Đang xử lý' : 'Thất bại'}
                                <span className="ml-1.5 text-xs opacity-70">
                                    ({s === 'ALL' ? payments.length : payments.filter(p => p.status === s).length})
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* ─── Table ─── */}
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                            <p className="text-gray-400">Không có giao dịch nào.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase">Người dùng</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase">Gói</th>
                                        <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400 uppercase">Điểm</th>
                                        <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400 uppercase">Số tiền</th>
                                        <th className="text-center px-5 py-3.5 text-xs font-bold text-gray-400 uppercase">Trạng thái</th>
                                        <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400 uppercase">Ngày</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map(tx => (
                                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                        {(tx.userEmail || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <span className="text-gray-600 text-xs">{tx.userEmail || tx.userId.slice(0, 12)}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-gray-800">{tx.packageName || tx.packageId}</td>
                                            <td className="px-5 py-3.5 text-right font-bold text-amber-600">+{tx.points}</td>
                                            <td className="px-5 py-3.5 text-right font-bold text-gray-800">{formatPrice(tx.amount)}</td>
                                            <td className="px-5 py-3.5 text-center"><StatusBadge status={tx.status} /></td>
                                            <td className="px-5 py-3.5 text-right text-gray-400 text-xs">{formatDate(tx.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {/* Footer total */}
                                <tfoot className="bg-gray-50 border-t border-gray-200">
                                    <tr>
                                        <td colSpan={3} className="px-5 py-3.5 text-xs font-bold text-gray-500">Tổng (PAID)</td>
                                        <td className="px-5 py-3.5 text-right font-black text-gray-900">{formatPrice(totalRevenue)}</td>
                                        <td colSpan={2} />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
