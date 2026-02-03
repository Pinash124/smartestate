# Smart Estate - Real Estate Marketplace Platform

## React + TypeScript Version 🚀

Một nền tảng thương mại điện tử bất động sản toàn chức năng được xây dựng bằng **React**, **TypeScript**, **Vite**, và **TailwindCSS**.

## ⚡ Quick Start

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy development server
npm run dev

# 3. Truy cập http://localhost:5173
```

## 🎯 Tính năng

### Xác thực & RBAC
- ✅ Đăng ký & Đăng nhập
- ✅ 5 vai trò người dùng: Guest, User, Seller, Broker, Admin
- ✅ Kiểm soát quyền dựa trên vai trò
- ✅ Navbar động theo vai trò

### Quản lý Tin Đăng
- ✅ Tạo/chỉnh sửa/xóa tin đăng
- ✅ AI moderation tự động
- ✅ Rủi ro scoring (0-100)
- ✅ Tự động duyệt/từ chối/cần xem xét
- ✅ Báo cáo tin đăng từ người dùng

### Tính năng Broker
- ✅ Yêu cầu hỗ trợ bán/cho thuê
- ✅ Chấp nhận/từ chối yêu cầu
- ✅ Quản lý tin được giao
- ✅ Theo dõi phí dịch vụ

### Admin
- ✅ Dashboard duyệt tin
- ✅ Lọc theo rủi ro & trạng thái
- ✅ Dashboard doanh thu
- ✅ Xuất CSV

### Khuyến nghị AI
- ✅ Gợi ý cá nhân hóa
- ✅ Thuật toán scoring đa yếu tố
- ✅ Hiển thị lý do gợi ý

### Tìm Kiếm & Lọc
- ✅ Lọc theo loại, thành phố, giá, diện tích
- ✅ Kết quả real-time
- ✅ Responsive design

## 🏗️ Kiến trúc

```
Services Layer (TypeScript)
├── auth.ts         → Authentication & RBAC
├── listing.ts      → Listing CRUD + Moderation + Payments
└── recommendation.ts → AI recommendations

React Components
├── Pages (11+ pages)
├── Components (Navbar, etc.)
└── App.tsx (Router)

Data Storage
└── localStorage (MVP) → MongoDB/PostgreSQL (Future)
```

## 📁 Cấu Trúc Thư Mục

```
src/
├── components/        # React components
│   └── Navbar.tsx
├── pages/             # Page components
│   ├── HomePage.tsx
│   ├── ListingsPage.tsx
│   ├── auth/
│   ├── seller/
│   ├── admin/
│   ├── user/
│   └── TestDataPage.tsx
├── services/          # TypeScript services
│   ├── auth.ts
│   ├── listing.ts
│   └── recommendation.ts
├── types/             # TypeScript types
│   └── index.ts
├── App.tsx            # Main router
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## 🔐 Demo Accounts

```
Admin:
  📧 admin@smartestate.vn
  🔑 admin123

Seller:
  📧 seller@smartestate.vn
  🔑 seller123

User:
  📧 user@smartestate.vn
  🔑 user123

Broker:
  📧 broker@smartestate.vn
  🔑 broker123
```

## 🚀 Scripts

```bash
npm run dev        # Start dev server (localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2 | UI Framework |
| React Router | 6.20 | Routing |
| TypeScript | 5.3 | Type Safety |
| Vite | 5.0 | Build Tool |
| TailwindCSS | 3.4 | Styling |
| PostCSS | 8.4 | CSS Processing |

## 📊 Data Model

### User
```typescript
{
  id: number
  name: string
  email: string
  password: string (hashed)
  role: 'guest' | 'user' | 'seller' | 'broker' | 'admin'
  profile: { avatar, phone, address }
  createdAt: Date
}
```

### Listing
```typescript
{
  id: number
  sellerId: number
  title: string
  type: 'apartment' | 'house' | 'land' | 'office'
  transaction: 'buy' | 'rent'
  price: string
  area: number
  bedrooms: number
  bathrooms: number
  status: ListingStatus
  moderation: {
    decision: 'APPROVED' | 'REJECTED' | 'NEED_REVIEW'
    riskScore: number (0-100)
    flags: string[]
    suggestions: string[]
  }
  images: string[]
  createdAt: Date
}
```

## 🔌 Services

### AuthService
```typescript
import { authService } from '@/services/auth'

authService.login(email, password)
authService.register(name, email, password, role)
authService.logout()
authService.isAuthenticated()
authService.getCurrentUser()
authService.hasRole('seller')
authService.hasPermission('create_listing')
```

### ListingService
```typescript
import { listingService } from '@/services/listing'

listingService.createListing(listing)
listingService.getAllListings()
listingService.getApprovedListings()
listingService.approveListing(id, adminId)
listingService.rejectListing(id, adminId)
listingService.reportListing(id, userId, reason, note)
```

### RecommendationService
```typescript
import { recommendationService } from '@/services/recommendation'

recommendationService.submitPreferences(userId, preferences)
recommendationService.getRecommendations(userId, topN)
```

## 📋 Routes

| Route | Component | Auth | Role |
|-------|-----------|------|------|
| `/` | HomePage | ❌ | - |
| `/login` | LoginPage | ❌ | - |
| `/signup` | SignupPage | ❌ | - |
| `/listings` | ListingsPage | ❌ | - |
| `/listing/:id` | ListingDetailPage | ❌ | - |
| `/seller/create-listing` | CreateListingPage | ✅ | seller |
| `/seller/my-listings` | MyListingsPage | ✅ | seller |
| `/admin/moderation` | ModerationPage | ✅ | admin |
| `/admin/revenue` | RevenuePage | ✅ | admin |
| `/user/ai-recommend` | AIRecommendPage | ✅ | user |
| `/test-data` | TestDataPage | ❌ | - |

## 🎨 Styling

- **TailwindCSS** utility-first CSS
- **Responsive Design**: Mobile-first approach
- **Color Scheme**: Amber theme (#fbbf24, #f59e0b)
- **Custom Components**: Buttons, cards, forms in `index.css`

## 🔄 State Management

- **Navbar Auth State**: Lifted to App component
- **Form State**: Local component state (useState)
- **Global Data**: localStorage
- **Future**: Context API or Redux

## ⚙️ Configuration

### TypeScript
- `tsconfig.json` - Compiler options
- `tsconfig.node.json` - Node.js config

### Vite
- `vite.config.ts` - Build configuration
- `index.html` - HTML entry point

### TailwindCSS
- `tailwind.config.js` - Customization
- `postcss.config.js` - PostCSS plugins
- `src/index.css` - Global styles

## 📦 Storage

**MVP**: localStorage (5-10MB limit)
```javascript
localStorage.setItem('users', JSON.stringify(users))
localStorage.setItem('listings', JSON.stringify(listings))
localStorage.getItem('currentUser')
```

**Production**: Backend API + Database
```javascript
await fetch('/api/listings').then(r => r.json())
await fetch('/api/listings', { method: 'POST', body: JSON.stringify(listing) })
```

## 🐛 Debugging

### Check Current User
```typescript
import { authService } from '@/services/auth'
console.log(authService.getCurrentUser())
```

### View All Listings
```typescript
const listings = JSON.parse(localStorage.getItem('listings') || '[]')
console.log(listings)
```

### Clear Data
```typescript
localStorage.clear()
location.reload()
```

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | `npm install` và `npm run dev` |
| Port 5173 in use | Vite sẽ dùng port tiếp theo |
| TypeScript errors | Run `npx tsc --noEmit` |
| Build fails | Delete `node_modules` và `npm install` |

## 📚 Documentation

- [REACT_SETUP.md](./REACT_SETUP.md) - Setup & development guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) - Feature documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment checklist

## 📋 Workflow

1. **Development**: `npm run dev`
2. **Testing**: Manual testing + test data
3. **Building**: `npm run build`
4. **Preview**: `npm run preview`
5. **Deployment**: Push to GitHub → Vercel/Netlify

## 🎯 Next Steps

- [ ] Complete all page components
- [ ] Implement form handling & validation
- [ ] Add loading states & error handling
- [ ] Add toast notifications
- [ ] Persist data to localStorage
- [ ] Connect to backend API
- [ ] Add real-time features
- [ ] Deploy to production

## 📞 Support

Xem file documentation để biết thêm chi tiết:
- Setup: `REACT_SETUP.md`
- Architecture: `ARCHITECTURE.md`
- Features: `IMPLEMENTATION-GUIDE.md`

## 📄 License

MIT License

---

**Ready to build!** 🚀

```bash
npm install && npm run dev
```
