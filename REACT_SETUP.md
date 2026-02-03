# Smart Estate - React TypeScript Setup Guide

Dự án đã được chuyển đổi sang React + TypeScript với Vite build tool.

## 🚀 Cách chạy dự án

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5173`

### 3. Build cho production
```bash
npm run build
```

### 4. Preview production build
```bash
npm run preview
```

## 📁 Cấu trúc thư mục

```
smartestate/
├── src/
│   ├── components/          # React components
│   │   └── Navbar.tsx
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx
│   │   ├── ListingsPage.tsx
│   │   ├── ListingDetailPage.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── seller/
│   │   │   ├── CreateListingPage.tsx
│   │   │   └── MyListingsPage.tsx
│   │   ├── admin/
│   │   │   ├── ModerationPage.tsx
│   │   │   └── RevenuePage.tsx
│   │   ├── user/
│   │   │   └── AIRecommendPage.tsx
│   │   └── TestDataPage.tsx
│   ├── services/           # Business logic services
│   │   ├── auth.ts
│   │   ├── listing.ts
│   │   └── recommendation.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── index.html              # HTML entry point
├── package.json
├── tsconfig.json           # TypeScript config
├── tailwind.config.js      # TailwindCSS config
├── postcss.config.js       # PostCSS config
└── vite.config.ts          # Vite config
```

## 🔧 Tuyệt vời! Những gì được thiết lập

### ✅ Đã cài đặt
- **React 18.2** - UI framework
- **React Router DOM 6.20** - Routing
- **TypeScript 5.3** - Type safety
- **Vite 5.0** - Fast build tool
- **TailwindCSS 3.4** - Styling
- **PostCSS & Autoprefixer** - CSS processing

### 📦 Services (TypeScript)
- `auth.ts` - Authentication & RBAC
- `listing.ts` - Listing CRUD + AI moderation + Payments
- `recommendation.ts` - AI recommendations

### 🎯 Types
- `types/index.ts` - All TypeScript interfaces & types

## 🌐 Routing

| Path | Component | Mô tả |
|------|-----------|-------|
| `/` | HomePage | Trang chủ |
| `/login` | LoginPage | Đăng nhập |
| `/signup` | SignupPage | Đăng ký |
| `/listings` | ListingsPage | Danh sách tin đăng |
| `/listing/:id` | ListingDetailPage | Chi tiết tin đăng |
| `/seller/create-listing` | CreateListingPage | Đăng tin mới |
| `/seller/my-listings` | MyListingsPage | Quản lý tin của tôi |
| `/admin/moderation` | ModerationPage | Duyệt tin |
| `/admin/revenue` | RevenuePage | Doanh thu |
| `/user/ai-recommend` | AIRecommendPage | Gợi ý AI |
| `/test-data` | TestDataPage | Tạo dữ liệu kiểm thử |

## 💾 Data Storage

- **localStorage**: Lưu trữ tạm thời cho MVP
- **Format**: JSON
- **Collections**:
  - `users` - Người dùng
  - `listings` - Tin đăng
  - `payments` - Thanh toán
  - `userPreferences` - Sở thích của người dùng

## 🔐 Authentication

### Demo Accounts
```
Admin:
  Email: admin@smartestate.vn
  Password: admin123

Seller:
  Email: seller@smartestate.vn
  Password: seller123

User:
  Email: user@smartestate.vn
  Password: user123

Broker:
  Email: broker@smartestate.vn
  Password: broker123
```

## 📝 Tính năng chính

### ✅ Đã hoàn thành
- Authentication & Authorization (RBAC)
- 5 user roles: Guest, User, Seller, Broker, Admin
- Dynamic navbar based on role
- AI-powered listing moderation
- Payment tracking
- Revenue dashboard
- AI recommendations
- Responsive design

### ⏳ Tiếp theo
- Hoàn thành tất cả page components
- Implement localStorage persistence
- Add form validation
- Add error handling
- Add loading states
- Add toast notifications

## 📚 File Chính

### Services
```typescript
// Authentication
import { authService } from '@/services/auth'
authService.login(email, password)
authService.register(name, email, password, role)
authService.logout()
authService.hasRole('seller')
authService.hasPermission('create_listing')

// Listings
import { listingService } from '@/services/listing'
listingService.createListing(data)
listingService.getAllListings()
listingService.approveListing(id, adminId)
listingService.reportListing(id, userId, reason, note)

// Recommendations
import { recommendationService } from '@/services/recommendation'
recommendationService.submitPreferences(userId, prefs)
recommendationService.getRecommendations(userId)
```

### Types
```typescript
import { User, Listing, UserRole, PropertyType } from '@/types'
```

## 🎨 Styling

- **TailwindCSS** - Utility-first CSS framework
- **Custom colors**: Amber theme (#fbbf24, #f59e0b)
- **Responsive design**: Mobile-first approach
- **Custom utilities** in `src/index.css`

## 🔌 Environment Variables

Hiện tại không cần biến môi trường (sử dụng localStorage).
Sau này có thể thêm `.env`:
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=Smart Estate
```

## 🧪 Testing

1. Mở `http://localhost:5173/test-data`
2. Tạo dữ liệu kiểm thử
3. Sử dụng demo accounts để đăng nhập

## 🚨 Troubleshooting

### Lỗi: Module not found
```bash
# Xóa cache và cài lại
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Lỗi: Port 5173 đang được sử dụng
```bash
# Vite sẽ tự động dùng port tiếp theo
# Hoặc chỉ định port khác
npm run dev -- --port 3000
```

### Lỗi: TypeScript errors
```bash
# Kiểm tra TypeScript
npx tsc --noEmit
```

## 📖 Tài liệu

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## 🎯 Next Steps

1. ✅ Hoàn thành tất cả page components
2. ✅ Implement form handling & validation
3. ✅ Add localStorage persistence
4. ✅ Add error handling & notifications
5. ⏳ Connect to backend API (Node.js/Express)
6. ⏳ Add real-time features (WebSocket)
7. ⏳ Deploy to production

---

**Ready to develop!** 🚀

Chạy `npm run dev` để bắt đầu!
