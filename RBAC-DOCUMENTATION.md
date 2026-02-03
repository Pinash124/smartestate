# Smart Estate - Role-Based Access Control (RBAC)

## Hệ Thống Roles và Permissions

### 1. Guest (Khách)
**Quyền hạn:**
- ✅ Xem trang chủ
- ✅ Xem danh sách tin & chi tiết tin (chỉ APPROVED)
- ✅ Tìm kiếm & lọc cơ bản
- ✅ Đăng ký/Đăng nhập
- ✅ Xem blog/FAQ

**Routes:**
- `/` - Homepage
- `/pages/auth/login.html` - Login
- `/pages/auth/signup.html` - Signup

---

### 2. User (Người dùng)
**Quyền hạn:**
- ✅ Xem danh sách tin & chi tiết tin
- ✅ Tìm kiếm & lọc nâng cao
- ✅ Nhập nhu cầu để nhận AI Recommend
- ✅ Nhắn tin (chat) với Seller/Broker
- ✅ Quản lý hồ sơ cá nhân
- ✅ Lưu tin đăng yêu thích

**Routes:**
- `/pages/user/profile.html` - Hồ sơ cá nhân
- `/pages/user/ai-recommend.html` - AI Recommend
- `/pages/user/messages.html` - Tin nhắn
- `/pages/user/saved-listings.html` - Tin đã lưu

---

### 3. Seller (Người bán/Chủ nhà)
**Quyền hạn:**
- ✅ Đăng tin (Create Listing) + upload ảnh
- ✅ Chỉnh sửa tin của mình
- ✅ Xem danh sách tin của mình
- ✅ Nhận & trả lời chat từ User
- ✅ Gửi yêu cầu Broker Support

**Routes:**
- `/pages/seller/create-listing.html` - Đăng tin mới
- `/pages/seller/my-listings.html` - Quản lý tin
- `/pages/seller/messages.html` - Tin nhắn
- `/pages/seller/profile.html` - Hồ sơ

---

### 4. Broker/Agent (Môi giới)
**Quyền hạn:**
- ✅ Nhận yêu cầu hỗ trợ từ Seller (Accept/Reject)
- ✅ Khi accept: trở thành Responsible → nhận chat & cập nhật tin
- ✅ Quản lý các tin mình phụ trách
- ✅ Nhận & trả lời chat từ User

**Routes:**
- `/pages/broker/requests.html` - Yêu cầu hỗ trợ
- `/pages/broker/my-listings.html` - Tin quản lý
- `/pages/broker/messages.html` - Tin nhắn
- `/pages/broker/profile.html` - Hồ sơ

---

### 5. Admin
**Quyền hạn:**
- ✅ Duyệt tin (Approve/Reject)
- ✅ Xem AI Moderation report
- ✅ Quản lý người dùng/role
- ✅ Quản lý blog/FAQ
- ✅ Dashboard/Reports

**Routes:**
- `/pages/admin/dashboard.html` - Dashboard
- `/pages/admin/moderation.html` - Duyệt tin
- `/pages/admin/users.html` - Quản lý users

---

## Cấu Trúc Database (localStorage)

### Users Collection
```javascript
{
  id: number,
  email: string,
  password: string (hashed),
  name: string,
  role: 'guest' | 'user' | 'seller' | 'broker' | 'admin',
  createdAt: ISO8601,
  verified: boolean,
  profile: {
    avatar: string (URL),
    phone: string,
    address: string
  }
}
```

### Listings Collection
```javascript
{
  id: number,
  sellerId: number,
  sellerName: string,
  responsibleBrokerId?: number,
  title: string,
  transactionType: 'buy' | 'rent',
  type: 'apartment' | 'house' | 'land' | 'office',
  price: string,
  city: string,
  district: string,
  address: string,
  area: number,
  bedrooms: number,
  bathrooms: number,
  description: string,
  images: string[] (URLs),
  status: 'pending' | 'approved' | 'rejected',
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Messages Collection
```javascript
{
  id: number,
  senderId: number,
  senderName: string,
  receiverId: number,
  listingId: number,
  content: string,
  createdAt: ISO8601,
  read: boolean
}
```

### Broker Requests Collection
```javascript
{
  id: number,
  listingId: number,
  sellerId: number,
  brokerId?: number,
  status: 'pending' | 'accepted' | 'rejected',
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

---

## Authentication Flow

### 1. Register
```javascript
authService.register(email, password, name, role)
```

### 2. Login
```javascript
authService.login(email, password)
```

### 3. Check Permission
```javascript
authService.hasPermission('view_home')
authService.hasRole('user')
```

### 4. Protected Routes
```javascript
requireAuth('user', 'manage_profile')
```

---

## Default Admin Account (cho testing)

**Email:** `admin@smartestate.vn`
**Password:** `admin123`

---

## File Structure

```
smartestate/
├── index.html
├── pages/
│   ├── auth/
│   │   ├── login.html
│   │   └── signup.html
│   ├── user/
│   │   ├── profile.html
│   │   ├── ai-recommend.html
│   │   ├── messages.html
│   │   └── saved-listings.html
│   ├── seller/
│   │   ├── create-listing.html
│   │   ├── my-listings.html
│   │   ├── messages.html
│   │   └── profile.html
│   ├── broker/
│   │   ├── requests.html
│   │   ├── my-listings.html
│   │   ├── messages.html
│   │   └── profile.html
│   └── admin/
│       ├── dashboard.html
│       ├── moderation.html
│       └── users.html
└── src/
    ├── js/
    │   ├── auth.js (Authentication & RBAC)
    │   ├── navbar.js (Dynamic navbar)
    │   └── main.js (Common functions)
    ├── styles/
    │   └── input.css
    └── assets/
```

---

## API Endpoints (Future)

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Listings
- `GET /api/listings` - Lấy danh sách tin
- `POST /api/listings` - Tạo tin (Seller)
- `PUT /api/listings/:id` - Cập nhật tin
- `DELETE /api/listings/:id` - Xóa tin

### Admin
- `PUT /api/listings/:id/approve` - Duyệt tin
- `PUT /api/listings/:id/reject` - Từ chối tin
- `GET /api/users` - Lấy danh sách users
- `PUT /api/users/:id/role` - Thay đổi role

---

## Next Steps

- [ ] Hoàn thành tất cả trang cho mỗi role
- [ ] Thêm chat functionality
- [ ] Implement AI Recommendation engine
- [ ] Thêm payment integration
- [ ] Setup backend API
- [ ] Database migration
