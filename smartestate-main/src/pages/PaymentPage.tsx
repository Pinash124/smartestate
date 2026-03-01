import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { listingService } from '../services/listing'
import { paymentService } from '../services/payments'
import { authService } from '../services/auth'
import { Listing } from '../types'

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const user = authService.getCurrentUser()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  // ===============================
  // Load listing
  // ===============================
  useEffect(() => {
    const loadListing = async () => {
      if (!id) return

      try {
        const data = await listingService.fetchListing(id)
        setListing(data)
      } catch (err) {
        console.error(err)
        navigate('/listings')
      } finally {
        setLoading(false)
      }
    }

    void loadListing()
  }, [id, navigate])

  // ===============================
  // Handle payment
  // ===============================
  const handlePayment = async () => {
    if (!user || !listing) return

    try {
      setPaying(true)

      await paymentService.pay({
        userId: user.id,
        listingId: listing.id,
        amount: 50000 // mock price
      })

      alert('Thanh toán thành công ')

      navigate('/listings')
    } catch (err) {
      console.error(err)
      alert('Thanh toán thất bại')
    } finally {
      setPaying(false)
    }
  }

  // ===============================
  // UI
  // ===============================
  if (loading || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md space-y-6">
        <h1 className="text-xl font-bold text-center">
          Thanh toán Boost Listing
        </h1>

        <div className="space-y-2 text-sm">
          <p><b>Tiêu đề:</b> {listing.title}</p>
          <p><b>ID:</b> {listing.id}</p>
          <p><b>Phí boost:</b> 50.000đ</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={paying}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {paying ? 'Đang thanh toán...' : 'Thanh toán ngay'}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full text-gray-500 text-sm"
        >
          Quay lại
        </button>
      </div>
    </div>
  )
}