import { Link } from 'react-router-dom'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gray-950 text-gray-400 relative overflow-hidden">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

            {/* Decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/5 blur-3xl rounded-full" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main footer content */}
                <div className="py-14 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
                    {/* Brand column */}
                    <div className="lg:col-span-4">
                        <Link to="/" className="inline-flex items-center gap-2.5 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 group-hover:scale-105 transition-all duration-300">
                                <span className="text-white font-bold text-base">S</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-extrabold text-white leading-tight tracking-tight">
                                    Smart<span className="text-amber-400">Estate</span>
                                </span>
                            </div>
                        </Link>
                        <p className="mt-4 text-sm leading-relaxed text-gray-500 max-w-xs">
                            Nền tảng tìm kiếm bất động sản hàng đầu tại Việt Nam.
                            Kết nối người mua — người bán nhanh chóng và an toàn với công nghệ AI.
                        </p>

                        {/* Social icons */}
                        <div className="mt-6 flex gap-3">
                            {[
                                { label: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                                { label: 'YouTube', icon: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z' },
                                { label: 'Zalo', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' },
                            ].map((social) => (
                                <button
                                    key={social.label}
                                    className="w-9 h-9 rounded-xl bg-gray-800/80 hover:bg-amber-500/20 border border-gray-800 hover:border-amber-500/30 flex items-center justify-center transition-all duration-300 group"
                                    title={social.label}
                                >
                                    <svg className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={social.icon} />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Explore column */}
                    <div className="lg:col-span-2">
                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-5">Khám Phá</h4>
                        <ul className="space-y-3">
                            {[
                                { to: '/listings', label: 'Tất cả tin đăng' },
                                { to: '/listings?type=apartment', label: 'Chung cư' },
                                { to: '/listings?type=house', label: 'Nhà phố' },
                                { to: '/listings?type=land', label: 'Đất nền' },
                                { to: '/listings?type=office', label: 'Văn phòng' },
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-sm text-gray-500 hover:text-amber-400 transition-colors duration-200 inline-flex items-center gap-1.5 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-amber-400 transition-colors" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Account column */}
                    <div className="lg:col-span-2">
                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-5">Tài Khoản</h4>
                        <ul className="space-y-3">
                            {[
                                { to: '/login', label: 'Đăng nhập' },
                                { to: '/signup', label: 'Đăng ký' },
                                { to: '/seller/create-listing', label: 'Đăng tin bán' },

                                { to: '/favorites', label: 'Tin đã lưu' },
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-sm text-gray-500 hover:text-amber-400 transition-colors duration-200 inline-flex items-center gap-1.5 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-amber-400 transition-colors" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact column */}
                    <div className="lg:col-span-4">
                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-5">Liên Hệ</h4>
                        <ul className="space-y-4">
                            {[
                                { icon: '@', label: 'contact@smartestate.vn', sub: 'Email hỗ trợ' },
                                { icon: 'T', label: '1900-xxxx', sub: 'Hotline (8h-22h)' },
                                { icon: 'P', label: 'Hà Nội, Việt Nam', sub: 'Trụ sở chính' },
                            ].map((item) => (
                                <li key={item.label} className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gray-800/80 border border-gray-800 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300 font-medium">{item.label}</p>
                                        <p className="text-xs text-gray-600">{item.sub}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Newsletter mini */}
                        <div className="mt-6 p-4 bg-gray-900/80 rounded-2xl border border-gray-800">
                            <p className="text-xs font-semibold text-gray-300 mb-2.5">Nhận tin mới nhất</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Email của bạn..."
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
                                />
                                <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 whitespace-nowrap">
                                    Đăng ký
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-800/80 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-600">
                        © {currentYear} Smart Estate. Tất cả quyền được bảo lưu.
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                        {['Điều khoản', 'Chính sách', 'Bảo mật'].map((item, i) => (
                            <span key={item} className="flex items-center">
                                <span className="hover:text-gray-400 cursor-pointer transition-colors px-2 py-1">
                                    {item}
                                </span>
                                {i < 2 && <span className="text-gray-800">·</span>}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
