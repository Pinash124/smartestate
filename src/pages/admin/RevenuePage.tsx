import { useState, useEffect } from 'react'
import { authService } from '../../services/auth'
import { listingService } from '../../services/listing'
import { Payment } from '../../types'

export default function RevenuePage() {
  const user = authService.getCurrentUser()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentType, setPaymentType] = useState<'all' | 'post_listing' | 'push_listing' | 'broker_fee' | 'takeover_fee'>('all')
  const [loading, setLoading] = useState(true)

  const paymentTypeLabels: Record<string, string> = {
    post_listing: 'Đăng tin',
    push_listing: 'Đẩy tin',
    broker_fee: 'Phí broker',
    takeover_fee: 'Phí nhận quản lý',
  }

  const paymentTypeAmounts: Record<string, number> = {
    post_listing: 50000,
    push_listing: 100000,
    broker_fee: 500000,
    takeover_fee: 500000,
  }

  useEffect(() => {
    const allPayments = listingService.getAllListings()
      .flatMap((l) => l.moderation.reviewedAt ? [{
        id: l.id,
        type: 'post_listing' as const,
        amount: 50000,
        listingId: l.id,
        userId: l.sellerId,
        status: 'PAID' as const,
        date: l.createdAt,
        description: `Phí đăng tin: ${l.title}`,
      }] : [])

    setPayments(allPayments)
    setLoading(false)
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
  const avgAmount = filteredPayments.length > 0 ? totalRevenue / filteredPayments.length : 0

  const revenueByType = Object.fromEntries(
    Object.entries(paymentTypeLabels).map(([key]) => [
      key,
      filteredPayments
        .filter((p) => p.type === key)
        .reduce((sum, p) => sum + p.amount, 0),
    ])
  )

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard doanh thu</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Bộ lọc</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại thanh toán
              </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="all">Tất cả</option>
                <option value="post_listing">Đăng tin</option>
                <option value="push_listing">Đẩy tin</option>
                <option value="broker_fee">Phí broker</option>
                <option value="takeover_fee">Phí nhận quản lý</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setPaymentType('all')
                }}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Tổng doanh thu</p>
            <p className="text-3xl font-bold text-blue-600">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(totalRevenue)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Số lượng giao dịch</p>
            <p className="text-3xl font-bold text-green-600">{filteredPayments.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Trung bình/giao dịch</p>
            <p className="text-3xl font-bold text-purple-600">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(avgAmount)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Trạng thái</p>
            <p className="text-3xl font-bold text-yellow-600">{filteredPayments.filter((p) => p.status === 'PAID').length} PAID</p>
          </div>
        </div>

        {/* Revenue by Type */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Doanh thu theo loại</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(revenueByType).map(([type, amount]) => (
              <div key={type} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{paymentTypeLabels[type]}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(amount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Chi tiết giao dịch</h2>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Không có giao dịch nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {paymentTypeLabels[payment.type]}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(payment.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="mt-8 flex gap-2">
          <button
            onClick={() => {
              // Simple CSV export
              const headers = ['Loại', 'Mô tả', 'Số tiền', 'Ngày', 'Trạng thái']
              const rows = filteredPayments.map((p) => [
                paymentTypeLabels[p.type],
                p.description,
                p.amount,
                new Date(p.date).toLocaleDateString('vi-VN'),
                p.status,
              ])

              const csvContent =
                'data:text/csv;charset=utf-8,' +
                [headers, ...rows].map((r) => r.join(',')).join('\n')

              const link = document.createElement('a')
              link.setAttribute('href', encodeURI(csvContent))
              link.setAttribute('download', `revenue-${new Date().toISOString()}.csv`)
              link.click()
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            📊 Xuất CSV
          </button>
        </div>
      </div>
    </div>
  )
}
