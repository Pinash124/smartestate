import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth'
import { listingService } from '../../services/listing'
import { Listing } from '../../types'

export default function CreateListingPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    type: 'apartment' as const,
    transaction: 'buy' as const,
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    city: 'Hà Nội' as const,
    district: '',
    address: '',
    description: '',
    images: [] as string[],
  })

  if (!user || (user.role !== 'seller' && user.role !== 'broker')) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <p className="text-red-600">Bạn không có quyền tạo tin đăng</p>
      </div>
    )
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddImage = (imageUrl: string) => {
    if (formData.images.length < 10) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }))
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    // Validation
    if (!formData.title || !formData.price || !formData.area || !formData.description) {
      setSubmitError('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }

    if (formData.images.length === 0) {
      setSubmitError('Vui lòng thêm ít nhất 1 ảnh')
      return
    }

    setLoading(true)

    try {
      // Create listing
      const newListing: Listing = {
        id: Date.now(),
        sellerId: user.id,
        sellerName: user.name,
        sellerPhone: user.profile.phone || '',
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
        images: formData.images,
        status: 'pending_moderation',
        moderation: {
          status: 'pending',
          decision: 'APPROVED',
          riskScore: 0,
          flags: [],
          suggestions: [],
        },
        createdAt: new Date(),
      }

      listingService.createListing(newListing)

      alert('Tạo tin đăng thành công! Tin đăng của bạn đang chờ duyệt.')
      navigate('/seller/my-listings')
    } catch (error) {
      setSubmitError('Có lỗi xảy ra khi tạo tin đăng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tạo tin đăng mới</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {submitError}
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
              placeholder="vd: Căn hộ 3 phòng tầng 10 tại Ba Đình"
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
                placeholder="vd: 85"
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
              placeholder="Mô tả chi tiết về bất động sản..."
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/500 ký tự
            </p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh (tối đa 10) <span className="text-red-600">*</span>
            </label>

            {/* Image URL Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                id="imageUrl"
                placeholder="Nhập URL ảnh"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('imageUrl') as HTMLInputElement
                  if (input.value) {
                    handleAddImage(input.value)
                    input.value = ''
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Ảnh ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-500 mt-2">
              {formData.images.length}/10 ảnh đã thêm
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
            >
              {loading ? 'Đang tạo...' : 'Tạo tin đăng'}
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
