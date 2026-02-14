import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth'
import { listingService } from '../../services/listing'
import { ApiCreateListingRequest } from '../../types'
import {
  BuildingIcon,
  HouseIcon,
  LandIcon,
  OfficeIcon,
  ImageIcon,
  TrashIcon,
  MapPinIcon,
  DollarIcon,
  AreaIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  // BedIcon, // If needed for detailed form
  // BathIcon,
} from '../../components/Icons'

export default function CreateListingPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    type: 'apartment' as 'apartment' | 'house' | 'land' | 'office',
    transaction: 'buy' as 'buy' | 'rent',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    city: 'Hà Nội' as string,
    district: '',
    address: '',
    description: '',
    images: [] as string[],
  })

  // Auth check — any logged-in user can create listings
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <AlertCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để đăng tin bất động sản.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    )
  }

  // Handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeSelect = (type: any) => {
    setFormData((prev) => ({ ...prev, type }))
  }

  const handleTransactionSelect = (transaction: any) => {
    setFormData((prev) => ({ ...prev, transaction }))
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!formData.title || !formData.price || !formData.area || !formData.description) {
      setSubmitError('Vui lòng nhập đầy đủ thông tin bắt buộc (*)')
      window.scrollTo(0, 0)
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
        priceCurrency: 'VND', // Default or from form if added
        areaM2: Number(formData.area),
        address: {
          city: formData.city,
          district: formData.district,
          street: formData.address,
        },
      }

      const created = await listingService.createListingRemote(payload)
      if (created) {
        // Success animation or redirect
        navigate('/listing/' + created.id)
      } else {
        setSubmitError('Có lỗi xảy ra khi tạo tin đăng. Vui lòng thử lại.')
      }
    } catch {
      setSubmitError('Có lỗi kết nối. Vui lòng kiểm tra lại mạng.')
    } finally {
      setLoading(false)
    }
  }

  const PROPERTY_TYPES = [
    { id: 'apartment', label: 'Chung cư', icon: BuildingIcon },
    { id: 'house', label: 'Nhà đất', icon: HouseIcon },
    { id: 'land', label: 'Đất nền', icon: LandIcon },
    { id: 'office', label: 'Văn phòng', icon: OfficeIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -ml-16 -mb-16"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-400">
            Đăng tin bất động sản mới
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Tiếp cận hàng nghìn khách hàng tiềm năng. Đăng tin nhanh chóng, hiệu quả và chuyên nghiệp.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-8 px-4 relative z-20">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-start">
              <AlertCircleIcon className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <p className="font-bold text-red-700">Lỗi</p>
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            </div>
          )}

          {/* Section 1: Loại BĐS & Nhu cầu */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-3 text-sm font-bold">1</span>
              Thông tin cơ bản
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Hình thức giao dịch</label>
                <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => handleTransactionSelect('buy')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${formData.transaction === 'buy'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Cần bán
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTransactionSelect('rent')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${formData.transaction === 'rent'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Cho thuê
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Loại bất động sản</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {PROPERTY_TYPES.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.type === type.id
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleTypeSelect(type.id)}
                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${isSelected
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-100 bg-white text-gray-500 hover:border-amber-200 hover:bg-amber-50/30'
                          }`}
                      >
                        <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-amber-500' : 'text-gray-400'}`} />
                        <span className="font-medium text-sm">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Chi tiết & Hình ảnh */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form Details */}
            <div className="lg:col-span-2 space-y-8">

              {/* Location & Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-bold">2</span>
                  Chi tiết bất động sản
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề tin đăng <span className="text-red-500">*</span></label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="VD: Bán căn hộ chung cư cao cấp VinHomes 2PN..."
                      className="w-full border-gray-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 px-4 py-3 border bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mức giá <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="VD: 5 tỷ"
                          className="pl-10 w-full border-gray-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 px-4 py-3 border bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <AreaIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="area"
                          value={formData.area}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="pl-10 w-full border-gray-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 px-4 py-3 border bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full border-gray-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 px-4 py-3 border bg-gray-50 focus:bg-white"
                      >
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quận / Huyện</label>
                      <input
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        placeholder="VD: Cầu Giấy"
                        className="w-full border-gray-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 px-4 py-3 border bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="VD: Số 10, Ngõ 5..."
                        className="pl-10 w-full border-gray-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 px-4 py-3 border bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <FileTextIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        name="description"
                        rows={6}
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Mô tả kỹ về vị trí, tiện ích, nội thất..."
                        className="pl-10 w-full border-gray-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 px-4 py-3 border bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">{formData.description.length} ký tự</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Images & Tips */}
            <div className="space-y-8">
              {/* Image Upload */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm font-bold">3</span>
                  Hình ảnh
                </h2>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-colors group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                    <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-amber-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Click để tải ảnh lên</p>
                  <p className="text-xs text-gray-500 mt-1">Hỗ trợ JPG, PNG (Max 10 ảnh)</p>
                </div>

                {/* Image List */}
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={img}
                          alt={`Upload ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tips Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 text-sm">
                <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Mẹo đăng tin hiệu quả
                </h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Tiêu đề nên chứa loại BĐS + Khu vực + Điểm nổi bật.
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Đăng ít nhất 3 ảnh thực tế, rõ nét.
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Mô tả chi tiết tiện ích xung quanh (trường học, chợ...).
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Kiểm tra kỹ số điện thoại liên hệ trong hồ sơ của bạn.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-end pt-6 border-t border-gray-200 space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition"
              disabled={loading}
            >
              Huỷ bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-amber-500/30 flex items-center ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transform hover:-translate-y-0.5 transition-all'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Đăng tin ngay
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
