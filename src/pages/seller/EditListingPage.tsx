import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authService } from '@/services/auth'
import { listingService } from '@/services/listing'
import { Listing, PropertyType, TransactionType } from '@/types'

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<{
    title: string
    type: PropertyType
    transaction: TransactionType
    price: string
    area: string
    bedrooms: string
    bathrooms: string
    city: string
    district: string
    address: string
    description: string
  }>({
    title: '',
    type: 'apartment',
    transaction: 'buy',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    city: 'Hà Nội',
    district: '',
    address: '',
    description: '',
  })

  useEffect(() => {
    if (!id || !user) return

    const found = listingService.getListing(parseInt(id))
    if (found && (found.sellerId === user.id || found.responsibleBrokerId === user.id)) {
      setListing(found)
      setFormData({
        title: found.title,
        type: found.type,
        transaction: found.transaction,
        price: found.price,
        area: found.area.toString(),
        bedrooms: found.bedrooms?.toString() || '',
        bathrooms: found.bathrooms?.toString() || '',
        city: found.city,
        district: found.district,
        address: found.address,
        description: found.description,
      })
    } else {
      setError('Tin đăng không tồn tại hoặc bạn không có quyền chỉnh sửa')
    }
    setLoading(false)
  }, [id, user])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title || !formData.price || !formData.area || !formData.description) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }

    setSubmitting(true)

    try {
      if (listing) {
        const updated: Listing = {
          ...listing,
          title: formData.title,
          type: formData.type,
          transaction: formData.transaction,
          price: formData.price,
          area: parseFloat(formData.area),
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
          city: formData.city,
          district: formData.district,
          address: formData.address,
          description: formData.description,
        }

        // Update in service (would normally be an API call)
        const allListings = listingService.getAllListings()
        const index = allListings.findIndex((l: Listing) => l.id === listing.id)
        if (index !== -1) {
          allListings[index] = updated
          localStorage.setItem('listings', JSON.stringify(allListings))
        }

        alert('Chỉnh sửa tin đăng thành công!')
        navigate('/seller/my-listings')
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi chỉnh sửa tin đăng')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/seller/my-listings')}
            className="text-blue-600 hover:underline"
          >
            ← Quay lại danh sách tin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Chỉnh sửa tin đăng</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Property Type & Transaction */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại bất động sản
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="apartment">Chung cư</option>
                <option value="house">Nhà</option>
                <option value="land">Đất</option>
                <option value="office">Văn phòng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại giao dịch
              </label>
              <select
                name="transaction"
                value={formData.transaction}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="buy">Mua bán</option>
                <option value="rent">Cho thuê</option>
              </select>
            </div>
          </div>

          {/* Price & Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="vd: 3.5 tỷ"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diện tích (m²) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phòng ngủ
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phòng tắm
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thành phố
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
            >
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP Hồ Chí Minh">TP Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Cần Thơ">Cần Thơ</option>
            </select>

            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              placeholder="Quận/Huyện"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
            />

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Địa chỉ chi tiết"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/500 ký tự
            </p>
          </div>

          {/* Current Images Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              ℹ️ Để thay đổi ảnh, vui lòng liên hệ quản trị viên
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Tin hiện có {listing.images.length} ảnh
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
            >
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/seller/my-listings')}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
