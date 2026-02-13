import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth'
import { recommendationService } from '@/services/recommendation'
import { Listing, PropertyType } from '@/types'

interface RecommendedItem {
    listing: Listing
    score: number
    reasons: { icon: string; text: string }[]
}

export default function AIFloatingWidget() {
    const navigate = useNavigate()
    const user = authService.getCurrentUser()

    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState<'form' | 'results'>('form')

    // Form state
    const [transaction, setTransaction] = useState('buy')
    const [propertyTypes, setPropertyTypes] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])
    const [priceRange, setPriceRange] = useState('')
    const [minArea, setMinArea] = useState('')
    const [minBedrooms, setMinBedrooms] = useState('')

    const [loading, setLoading] = useState(false)
    const [recommendations, setRecommendations] = useState<RecommendedItem[]>([])

    const togglePropertyType = (type: string) => {
        setPropertyTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        )
    }

    const toggleCity = (city: string) => {
        setCities((prev) =>
            prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
        )
    }

    const handleSubmit = async () => {
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
            await recommendationService.submitPreferences(preferences)
            const recs = await recommendationService.getRecommendations(preferences, 5)
            setRecommendations(recs)
            setStep('results')
        } catch {
            // silently fail
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setStep('form')
        setRecommendations([])
    }

    const propertyTypeLabels: Record<string, string> = {
        apartment: 'Chung cư',
        house: 'Nhà',
        land: 'Đất',
        office: 'VP',
    }

    const cityOptions = ['Hà Nội', 'TP HCM', 'Đà Nẵng', 'Cần Thơ']

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group ${isOpen
                    ? 'bg-gray-800 rotate-0 scale-95'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500 hover:shadow-xl hover:shadow-amber-200/50 hover:scale-110'
                    }`}
                title="AI Gợi ý BĐS"
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <>
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                        </svg>
                        {/* Pulse ring */}
                        <span className="absolute w-14 h-14 rounded-full bg-amber-400 animate-ping opacity-30" />
                    </>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 text-white flex items-center gap-3 flex-shrink-0">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">AI Gợi ý Bất động sản</h3>
                            <p className="text-[11px] text-white/70">Tìm BĐS phù hợp với bạn</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        {step === 'form' ? (
                            <div className="space-y-4">
                                {/* Welcome message bubble */}
                                <div className="bg-amber-50 rounded-2xl rounded-tl-sm p-3 text-sm text-gray-700 border border-amber-100">
                                    Xin chào{user ? ` ${user.name}` : ''}! Cho mình biết bạn đang tìm kiếm BĐS như thế nào nhé.
                                </div>

                                {/* Transaction Type */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Loại giao dịch</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { val: 'buy', label: 'Mua bán' },
                                            { val: 'rent', label: 'Cho thuê' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.val}
                                                onClick={() => setTransaction(opt.val)}
                                                className={`py-2 rounded-xl text-sm font-medium border transition-all ${transaction === opt.val
                                                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Property Type */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Loại BĐS</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(propertyTypeLabels).map(([val, label]) => (
                                            <button
                                                key={val}
                                                onClick={() => togglePropertyType(val)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${propertyTypes.includes(val)
                                                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cities */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Khu vực</p>
                                    <div className="flex flex-wrap gap-2">
                                        {cityOptions.map((city) => (
                                            <button
                                                key={city}
                                                onClick={() => toggleCity(city)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${cities.includes(city)
                                                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price & Area row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Giá (tỷ đ)</p>
                                        <input
                                            type="text"
                                            value={priceRange}
                                            onChange={(e) => setPriceRange(e.target.value)}
                                            placeholder="vd: 1-5"
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">DT (m²)</p>
                                        <input
                                            type="number"
                                            value={minArea}
                                            onChange={(e) => setMinArea(e.target.value)}
                                            placeholder="Tối thiểu"
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Bedrooms */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phòng ngủ</p>
                                    <div className="flex gap-2">
                                        {['', '1', '2', '3', '4'].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setMinBedrooms(num)}
                                                className={`w-10 h-10 rounded-xl text-sm font-medium border transition-all ${minBedrooms === num
                                                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {num || 'Tất'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Results */
                            <div className="space-y-3">
                                <div className="bg-green-50 rounded-2xl rounded-tl-sm p-3 text-sm text-gray-700 border border-green-100">
                                    Tìm thấy <strong>{recommendations.length}</strong> BĐS phù hợp!
                                </div>

                                {recommendations.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-3xl mb-2">--</p>
                                        <p className="text-sm text-gray-500">Không tìm thấy gợi ý phù hợp. Hãy thử điều chỉnh tiêu chí.</p>
                                    </div>
                                ) : (
                                    recommendations.map((rec) => {
                                        const listing = rec.listing
                                        return (
                                            <button
                                                key={listing.id}
                                                onClick={() => {
                                                    navigate(`/listing/${listing.id}`)
                                                    setIsOpen(false)
                                                }}
                                                className="w-full text-left bg-white rounded-xl border border-gray-100 p-3 hover:border-amber-200 hover:shadow-sm transition-all group"
                                            >
                                                <div className="flex gap-3">
                                                    <div className="w-16 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                        {listing.images?.length > 0 ? (
                                                            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">BĐS</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-amber-600 transition-colors">
                                                            {listing.title}
                                                        </p>
                                                        <p className="text-xs text-amber-600 font-bold">{listing.price}</p>
                                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                                                            <span>{listing.city}</span>
                                                            {listing.area && <span>· {listing.area}m²</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 text-right">
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 border border-green-100">
                                                            <span className="text-xs font-bold text-green-600">{rec.score}%</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Reasons */}
                                                {rec.reasons.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {rec.reasons.slice(0, 3).map((reason, i) => (
                                                            <span key={i} className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-gray-500">
                                                                {reason.icon} {reason.text}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer / Action Button */}
                    <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
                        {step === 'form' ? (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-amber-200/50 disabled:opacity-50 disabled:cursor-wait transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Đang tìm kiếm...
                                    </>
                                ) : (
                                    <>Tìm gợi ý cho tôi</>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={resetForm}
                                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all"
                            >
                                ← Tìm kiếm lại
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Styles for animation */}
            <style>{`
        .animate-in {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
        </>
    )
}
