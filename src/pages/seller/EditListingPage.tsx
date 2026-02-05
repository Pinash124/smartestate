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

  const [formData, setFormData] = useState({
    title: '',
    type: 'apartment' as PropertyType,
    transaction: 'buy' as TransactionType,
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    city: 'Hà Nội',
    district: '',
    address: '',
    description: '',
    images: [] as string[],
  })

  /* ================= LOAD LISTING ================= */
  useEffect(() => {
    if (!id || !user) return

    const found = listingService.getListing(id)

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
        images: found.images || [],
      })
    } else {
      setError('Tin đăng không tồn tại hoặc bạn không có quyền chỉnh sửa')
    }

    setLoading(false)
  }, [id, user])

  /* ================= INPUT ================= */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /* ================= IMAGE ================= */
  const handleAddImage = (url: string) => {
    if (formData.images.length >= 10) return

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }))
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title || !formData.price || !formData.area || !formData.description) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }

    if (formData.images.length === 0) {
      setError('Cần ít nhất 1 ảnh')
      return
    }

    setSubmitting(true)

    try {
      if (!listing) return

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
        images: formData.images,
        updatedAt: new Date(),
      }

      listingService.updateListing(updated)

      alert('Cập nhật thành công!')
      navigate('/seller/my-listings')
    } catch {
      setError('Có lỗi xảy ra khi cập nhật')
    } finally {
      setSubmitting(false)
    }
  }

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    )
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    )
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow space-y-6">

        <h1 className="text-2xl font-bold">Chỉnh sửa tin đăng</h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Tiêu đề"
            className="w-full border p-2 rounded"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Mô tả"
            rows={4}
            className="w-full border p-2 rounded"
          />

          {/* IMAGE */}
          <div>
            <p className="font-medium mb-2">Ảnh (tối đa 10)</p>

            <div className="flex gap-2 mb-3">
              <input id="imageUrl" className="flex-1 border p-2 rounded" />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('imageUrl') as HTMLInputElement
                  if (input.value) {
                    handleAddImage(input.value)
                    input.value = ''
                  }
                }}
                className="bg-blue-600 text-white px-3 rounded"
              >
                Thêm
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {formData.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} className="h-20 w-full object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded"
          >
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  )
}
