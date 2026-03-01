import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth'
import { pointsService, PointsBalance } from '@/services/pointsService'
import { PointPackage, PointTransaction } from '@/types'
import { ClipboardIcon, RocketIcon, UsersIcon } from '@/components/Icons'

const formatPrice = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const StatusBadge = ({ status }: { status: 'PAID' | 'PENDING' | 'FAILED' }) => {
    const map = {
        PAID: { label: 'Thành công', cls: 'bg-emerald-50 text-emerald-700' },
        PENDING: { label: 'Đang xử lý', cls: 'bg-amber-50  text-amber-700' },
        FAILED: { label: 'Thất bại', cls: 'bg-red-50    text-red-700' },
    }
    const { label, cls } = map[status]
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>{label}</span>
}

export default function PointsPage() {
    const navigate = useNavigate()
    const user = authService.getCurrentUser()

    const [balance, setBalance] = useState<PointsBalance | null>(null)
    const [packages, setPackages] = useState<PointPackage[]>([])
    const [history, setHistory] = useState<PointTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [buying, setBuying] = useState<string | null>(null)   // packageId being bought
    const [success, setSuccess] = useState<string | null>(null)   // success message

    useEffect(() => {
        if (!user) return
        Promise.all([
            pointsService.getBalance(),
            pointsService.listPackages(),
            pointsService.getPaymentHistory(),
        ]).then(([bal, pkgs, hist]) => {
            setBalance(bal)
            setPackages(pkgs)
            setHistory(hist)
        }).finally(() => setLoading(false))
    }, [user])

    const handleBuy = async (pkg: PointPackage) => {
        if (!user) { navigate('/login'); return }
        setBuying(pkg.id)
        try {
            const result = await pointsService.initiatePayment(pkg.id)
            if (result) {
                setSuccess(`Đã khởi tạo thanh toán cho gói "${pkg.name}". Hệ thống sẽ cộng điểm sau khi xác nhận.`)
                // In real app: redirect to result.paymentUrl
                setTimeout(() => setSuccess(null), 6000)
            }
        } catch {
            alert('Không thể khởi tạo thanh toán. Vui lòng thử lại.')
        } finally {
            setBuying(null)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <span className="text-amber-600 font-black text-xl">PT</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Vui lòng đăng nhập</h2>
                    <p className="text-gray-500 text-sm mb-6">Bạn cần đăng nhập để xem và mua điểm</p>
                    <button onClick={() => navigate('/login')} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-md">
                        Đăng nhập
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ─── Hero / Balance ─── */}
            <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-10 w-72 h-72 bg-white/10 rounded-full translate-y-1/2" />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm shrink-0">
                            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="8" cy="8" r="6" />
                                <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-amber-100 text-sm font-medium mb-1">Số dư điểm hiện tại</p>
                            {loading ? (
                                <div className="h-12 w-40 bg-white/20 rounded-xl animate-pulse" />
                            ) : (
                                <div className="flex items-end gap-3">
                                    <span className="text-5xl font-black text-white">{balance?.balance ?? 0}</span>
                                    <span className="text-xl text-amber-100 mb-1">điểm</span>
                                </div>
                            )}
                            {!loading && balance && (
                                <p className="text-amber-100 text-xs mt-2">
                                    Tổng nạp: <b>{balance.totalEarned}</b> &nbsp;·&nbsp; Đã dùng: <b>{balance.totalSpent}</b>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                {/* Success banner */}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                        <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                        <p className="text-emerald-800 text-sm font-medium">{success}</p>
                    </div>
                )}

                {/* ─── Packages ─── */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn gói nạp điểm</h2>
                    <p className="text-gray-500 text-sm mb-6">Điểm được dùng để đăng tin, boost bài đăng và sử dụng các tính năng cao cấp.</p>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {packages.map(pkg => (
                                <div key={pkg.id} className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl ${pkg.popular ? 'border-amber-400 shadow-lg shadow-amber-100' : 'border-gray-100 shadow-sm'}`}>
                                    {pkg.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-md tracking-wide">
                                                Phổ biến
                                            </span>
                                        </div>
                                    )}
                                    <div className="mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${pkg.popular ? 'bg-amber-100' : 'bg-gray-100'}`}>
                                            <span className={`font-black text-sm ${pkg.popular ? 'text-amber-600' : 'text-gray-500'}`}>PT</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-base">{pkg.name}</h3>
                                        <p className="text-gray-500 text-xs mt-1">{pkg.description}</p>
                                    </div>
                                    <div className="mt-auto">
                                        <div className="mb-4">
                                            <span className="text-3xl font-black text-amber-600">{pkg.points}</span>
                                            <span className="text-gray-400 text-sm ml-1">điểm</span>
                                            <p className="text-gray-700 font-bold mt-1">{formatPrice(pkg.price)}</p>
                                            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                                                ≈ {Math.round(pkg.price / pkg.points).toLocaleString('vi-VN')}đ / điểm
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleBuy(pkg)}
                                            disabled={buying === pkg.id}
                                            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 ${pkg.popular
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200 hover:opacity-90'
                                                : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                                        >
                                            {buying === pkg.id ? 'Đang xử lý...' : 'Mua ngay'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── Usage guide ─── */}
                <div className="mb-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                    <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.663 17h4.674" />
                            <path d="M10 20h4" />
                            <path d="M9 13a4.5 4.5 0 1 1 6 0 4.5 4.5 0 0 0-3 4.5v.5H12v-.5A4.5 4.5 0 0 0 9 13z" />
                        </svg>
                        Điểm được dùng để làm gì?
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { icon: <ClipboardIcon className="w-7 h-7 text-blue-600" />, title: 'Đăng tin', desc: 'Mỗi lần đăng tốn một số điểm nhất định.' },
                            { icon: <RocketIcon className="w-7 h-7 text-orange-500" />, title: 'Boost bài đăng', desc: 'Tốn 10 điểm để ưu tiên hiển thị lên đầu.' },
                            { icon: <UsersIcon className="w-7 h-7 text-emerald-600" />, title: 'Takeover broker', desc: 'Tốn 30 điểm để bàn giao quản lý cho broker.' },
                        ].map(item => (
                            <div key={item.title} className="bg-white/70 rounded-2xl p-4">
                                <div className="mb-2">{item.icon}</div>
                                <h4 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h4>
                                <p className="text-gray-500 text-xs">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── History ─── */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Lịch sử giao dịch</h2>
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : history.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                            <p className="text-gray-400">Chưa có giao dịch nào.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase">Gói</th>
                                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase">Điểm</th>
                                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase">Số tiền</th>
                                        <th className="text-center px-5 py-3 text-xs font-bold text-gray-400 uppercase">Trạng thái</th>
                                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase">Ngày</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {history.map(tx => (
                                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3 font-medium text-gray-800">{tx.packageName || tx.packageId}</td>
                                            <td className="px-5 py-3 text-right font-bold text-amber-600">+{tx.points}</td>
                                            <td className="px-5 py-3 text-right text-gray-600">{formatPrice(tx.amount)}</td>
                                            <td className="px-5 py-3 text-center"><StatusBadge status={tx.status} /></td>
                                            <td className="px-5 py-3 text-right text-gray-400 text-xs">{formatDate(tx.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
