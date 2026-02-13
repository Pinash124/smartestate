import { useState } from 'react'
import { authService } from '../../services/auth'
import { recommendationService } from '../../services/recommendation'
import { Listing, PropertyType } from '../../types'
export default function AIRecommendPage() {
  const user = authService.getCurrentUser()
  const [transaction, setTransaction] = useState('buy')
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState('')
  const [minArea, setMinArea] = useState('')
  const [minBedrooms, setMinBedrooms] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [submitted, setSubmitted] = useState(false)

  const handlePropertyTypeChange = (type: string) => {
    setPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleCityChange = (city: string) => {
    setCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const preferences = {
        transaction: transaction as any,
        propertyTypes: propertyTypes.length > 0 ? (propertyTypes as PropertyType[]) : undefined,
        cities: cities.length > 0 ? cities : undefined,
        priceRange: priceRange || undefined,
        minArea: minArea ? parseInt(minArea) : undefined,
        minBedrooms: minBedrooms ? parseInt(minBedrooms) : undefined,
      }

      // Submit preferences
      await recommendationService.submitPreferences(preferences)

      // Get recommendations
      const recs = await recommendationService.getRecommendations(preferences, 10)
      setRecommendations(recs)
      setSubmitted(true)
    } catch (error) {
      alert('Có lỗi xảy ra khi tải gợi ý')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Khuyến nghị AI</h1>
          {!user && (
            <div className="text-sm text-gray-500">
              Chế độ xem khách · <a href="/login" className="text-blue-600 hover:underline">Đăng nhập</a> để lưu hồ sơ
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Preferences Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Tiêu chí tìm kiếm</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại giao dịch
                  </label>
                  <select
                    value={transaction}
                    onChange={(e) => setTransaction(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="buy">Mua bán</option>
                    <option value="rent">Cho thuê</option>
                  </select>
                </div>

                {/* Property Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại bất động sản
                  </label>
                  <div className="space-y-2">
                    {['apartment', 'house', 'land', 'office'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={propertyTypes.includes(type)}
                          onChange={() => handlePropertyTypeChange(type)}
                          className="rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {type === 'apartment'
                            ? 'Chung cư'
                            : type === 'house'
                              ? 'Nhà'
                              : type === 'land'
                                ? 'Đất'
                                : 'Văn phòng'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thành phố
                  </label>
                  <div className="space-y-2">
                    {['Hà Nội', 'TP Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'].map((city) => (
                      <label key={city} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={cities.includes(city)}
                          onChange={() => handleCityChange(city)}
                          className="rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{city}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khoảng giá (tỷ đ)
                  </label>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="vd: 1-5"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                {/* Min Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diện tích tối thiểu (m²)
                  </label>
                  <input
                    type="number"
                    value={minArea}
                    onChange={(e) => setMinArea(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                {/* Min Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng ngủ tối thiểu
                  </label>
                  <input
                    type="number"
                    value={minBedrooms}
                    onChange={(e) => setMinBedrooms(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
                >
                  {loading ? 'Đang tìm kiếm...' : 'Tìm gợi ý'}
                </button>
              </form>
            </div>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-3">
            {!submitted ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">
                  Nhập tiêu chí tìm kiếm để nhận gợi ý từ AI
                </p>
                <p className="text-gray-500">
                  AI sẽ phân tích sở thích của bạn và đề xuất các bất động sản phù hợp nhất
                </p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">Không tìm thấy gợi ý phù hợp</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Tìm thấy {recommendations.length} gợi ý
                  </h2>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    ← Quay lại
                  </button>
                </div>

                {recommendations.map((rec) => {
                  const listing = rec.listing as Listing
                  return (
                    <div
                      key={listing.id}
                      className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition"
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-40 h-32 flex-shrink-0">
                          {listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                              <p className="text-gray-600 text-sm">Không có ảnh</p>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {listing.title}
                              </h3>
                              <p className="text-2xl font-bold text-blue-600">
                                {listing.price}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 font-medium">Điểm phù hợp</p>
                              <p className="text-3xl font-bold text-green-600">
                                {rec.score}%
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                            <p>{listing.city}</p>
                            <p>{listing.area} m²</p>
                            {listing.bedrooms && <p>{listing.bedrooms} phòng</p>}
                          </div>

                          {/* Reasons */}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              Lý do gợi ý:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {rec.reasons.map((reason: any, i: number) => (
                                <span
                                  key={i}
                                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                                >
                                  {reason.icon} {reason.text}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => window.location.href = `/listing/${listing.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
