import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth'
import { listingService } from '../../services/listing'
import { ApiCreateListingRequest } from '../../types'

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Bạn không có quyền tạo tin đăng</p>
      </div>
    )
  }

  // ==============================
  // Input change
  // ==============================
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ==============================
  // ✅ Upload ảnh thật (file)
  // ==============================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    const newImages = files.map((file) => URL.createObjectURL(file))

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 10),
    }))
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  // ==============================
  // Submit
  // ==============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!formData.title || !formData.price || !formData.area || !formData.description) {
      setSubmitError('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }

    setLoading(true)

    try {
      const propertyTypeMap: Record<string, number> = {
        apartment: 1,
        house: 2,
        land: 3,
        office: 0,
      }
      const priceAmount = Number(formData.price.replace(/[^\d]/g, ''))
      const payload: ApiCreateListingRequest = {
        title: formData.title,
        description: formData.description,
        propertyType: propertyTypeMap[formData.type] ?? 0,
        priceAmount,
        priceCurrency: 'VND',
        areaM2: Number(formData.area),
        address: {
          city: formData.city,
          district: formData.district,
          street: formData.address,
        },
      }

      const created = await listingService.createListingRemote(payload)
      if (created) {
        alert('Tạo tin đăng thành công!')
        navigate('/listing/' + created.id)
      } else {
        setSubmitError('Có lỗi xảy ra khi tạo tin đăng')
      }
    } catch {
      setSubmitError('Có lỗi xảy ra khi tạo tin đăng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">Tạo tin đăng mới</h1>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">

          {submitError && (
            <div className="bg-red-100 text-red-700 p-3 rounded">
              {submitError}
            </div>
          )}

          {/* Title */}
          <input
            name="title"
            placeholder="Tiêu đề *"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full border p-3 rounded"
          />

          {/* Price & Area */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="price"
              placeholder="Giá *"
              value={formData.price}
              onChange={handleInputChange}
              className="border p-3 rounded"
            />

            <input
              type="number"
              name="area"
              placeholder="Diện tích (m²) *"
              value={formData.area}
              onChange={handleInputChange}
              className="border p-3 rounded"
            />
          </div>

          {/* Description */}
          <textarea
            name="description"
            rows={5}
            placeholder="Mô tả *"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border p-3 rounded"
          />

          {/* ===================== */}
          {/* ✅ Upload file */}
          {/* ===================== */}
          <div>
            <label className="block mb-2 font-medium">Tải ảnh (tối đa 10)</label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="mb-4"
            />

            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      className="h-24 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded"
            >
              {loading ? 'Đang tạo...' : 'Tạo tin đăng'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/seller/my-listings')}
              className="flex-1 bg-gray-300 py-3 rounded"
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
