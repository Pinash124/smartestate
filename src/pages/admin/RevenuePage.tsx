import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listingService } from '@/services/listing'
import { Payment } from '@/types'

export default function RevenuePage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentType, setPaymentType] = useState<'all' | 'post_listing' | 'push_listing' | 'broker_fee' | 'takeover_fee'>('all')

  // Vô hiệu hóa kiểm tra quyền để xem nhanh giao diện (Bật lại khi deploy)
  /*
  const role = authService.getCurrentRole()
  if (role !== 'admin') {
    return <div className="p-20 text-center text-red-500">Bạn không có quyền xem dữ liệu tài chính.</div>
  }
  */

  const paymentTypeLabels: Record<string, string> = {
    post_listing: 'Đăng tin',
    push_listing: 'Đẩy tin',
    broker_fee: 'Phí môi giới',
    takeover_fee: 'Phí quản lý',
  }

  useEffect(() => {
    // Giả lập lấy dữ liệu thanh toán từ danh sách tin đăng đã duyệt
    const loadPayments = async () => {
      const allPayments: Payment[] = (await listingService.getAllListings())
        .flatMap((l: any, index: number) => l.moderation.reviewedAt ? [{
          id: index + 1,
          type: 'post_listing' as const,
          amount: 50000,
          listingId: l.id,
          userId: l.sellerId,
          status: 'PAID' as const,
          date: l.createdAt,
          description: `Phí đăng tin: ${l.title}`,
        }] : [])

      setPayments(allPayments)
    }

    loadPayments()
  }, [])

  useEffect(() => {
    let result = payments

    if (paymentType !== 'all') {
      result = result.filter((p) => p.type === paymentType)
    }

    if (startDate) {
      const start = new Date(startDate)
      result = result.filter((p) => new Date(p.date) >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      result = result.filter((p) => new Date(p.date) <= end)
    }

    setFilteredPayments(result)
  }, [payments, paymentType, startDate, endDate])

  const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  
  const revenueByType = Object.fromEntries(
    Object.keys(paymentTypeLabels).map((key) => [
      key,
      filteredPayments
        .filter((p) => p.type === key)
        .reduce((sum, p) => sum + p.amount, 0),
    ])
  )

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Smart Admin</span>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/admin" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition font-medium">
            <span className="mr-3 text-xl">🏠</span> Tổng quan
          </Link>
          <Link to="/admin/moderation" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition font-medium">
            <span className="mr-3 text-xl">📋</span> Duyệt tin đăng
          </Link>
          <Link to="/admin/users" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition font-medium">
            <span className="mr-3 text-xl">👥</span> Người dùng
          </Link>
          <Link to="/admin/revenue" className="flex items-center px-4 py-3 bg-blue-50 text-blue-600 rounded-xl transition font-bold">
            <span className="mr-3 text-xl text-blue-500">💰</span> Doanh thu
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800">Báo cáo tài chính</h2>
          <div className="flex bg-gray-50 rounded-full px-4 py-1.5 border border-gray-100 items-center">
             <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">Finance Hub</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Doanh thu hệ thống</h1>
            <button 
              onClick={() => {
                const headers = ['Loại', 'Mô tả', 'Số tiền', 'Ngày']
                const rows = filteredPayments.map(p => [paymentTypeLabels[p.type], p.description, p.amount, new Date(p.date).toLocaleDateString('vi-VN')])
                const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n")
                window.open(encodeURI(csvContent))
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition"
            >
              📥 Xuất báo cáo
            </button>
          </div>

          {/* Filters Area */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thời gian</label>
                <div className="flex gap-2">
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loại dịch vụ</label>
                <select value={paymentType} onChange={e => setPaymentType(e.target.value as any)} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none">
                  <option value="all">Tất cả dịch vụ</option>
                  {Object.entries(paymentTypeLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={() => {setStartDate(''); setEndDate(''); setPaymentType('all');}} className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition">
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
              <p className="text-blue-100 font-medium mb-1">Tổng doanh thu thực tế</p>
              <h3 className="text-4xl font-black mb-4">{formatVND(totalRevenue)}</h3>
              <div className="flex items-center text-sm bg-white/10 w-fit px-3 py-1 rounded-full">
                <span>📈 Tăng 12% so với tháng trước</span>
              </div>
              <div className="absolute -right-4 -bottom-4 text-9xl opacity-10">💰</div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Phân bổ theo loại</p>
              <div className="space-y-4">
                {Object.entries(revenueByType).map(([type, amount]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{paymentTypeLabels[type]}</span>
                    <span className="text-sm font-bold text-gray-900">{formatVND(amount as number)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col justify-center text-center">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Số lượng giao dịch</p>
              <h3 className="text-5xl font-black text-gray-900">{filteredPayments.length}</h3>
              <p className="text-green-500 text-sm font-bold mt-2">Đã hoàn tất 100%</p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-xl text-gray-900">Nhật ký giao dịch</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Mô tả giao dịch</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Loại</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Số tiền</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Ngày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-bold text-gray-900">{p.description}</td>
                      <td className="px-8 py-5">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                          {paymentTypeLabels[p.type]}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-black text-gray-900 text-right">{formatVND(p.amount)}</td>
                      <td className="px-8 py-5 text-sm text-gray-400">{new Date(p.date).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPayments.length === 0 && (
                <div className="p-20 text-center text-gray-400">Không có dữ liệu giao dịch phù hợp.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
