# Smart Estate - Real Estate Marketplace

Nền tảng bán bất động sản trực tuyến với giao diện hiện đại, tông màu vàng chủ đạo, dựa trên concept của ChợTốt.

## 🎨 Tính Năng

- **Homepage hoàn chỉnh** với tìm kiếm bất động sản
- **Design responsive** - hoạt động trên mobile, tablet, desktop
- **Tông màu vàng/gold chủ đạo** từ TailwindCSS
- **Danh mục sản phẩm** - Căn hộ, Nhà riêng, Đất nền, Văn phòng
- **Tin đăng nổi bật** - Hiển thị các tin đăng hàng đầu
- **Chức năng yêu thích** - Lưu tin đăng yêu thích
- **Mobile menu** - Navigation trên thiết bị di động

## 📁 Cấu Trúc Project

```
smartestate/
├── index.html              # Homepage
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
├── src/
│   ├── styles/
│   │   └── input.css       # Custom styles
│   ├── js/
│   │   └── main.js         # JavaScript functionality
│   └── assets/             # Images, icons, etc.
└── pages/                  # Additional pages
```

## 🚀 Bắt Đầu

### Yêu Cầu
- Node.js (nếu sử dụng build tools)
- Trình duyệt web hiện đại

### Cài Đặt

1. Mở folder project
2. Mở file `index.html` trong trình duyệt
3. (Tuỳ chọn) Chạy Tailwind CSS watch mode:
   ```bash
   npm install
   npm run build:css
   ```

## 🎯 Các Phần Chính

### 1. Navigation Bar
- Logo Smart Estate
- Menu điều hướng (Desktop & Mobile)
- Nút Đăng nhập & Đăng tin

### 2. Hero Section
- Tiêu đề lớn "Tìm Nhà Ở Mơ Ước Của Bạn"
- Search bar đa tiêu chí:
  - Loại giao dịch (Mua/Cho thuê)
  - Loại bất động sản
  - Khu vực

### 3. Statistics Section
- 50K+ tin đăng hoạt động
- 100K+ người dùng
- 500+ cố vấn chuyên nghiệp
- 24/7 hỗ trợ

### 4. Featured Listings
- 3 thẻ bất động sản mẫu
- Hình ảnh, giá, diện tích, phòng tắm
- Nút thích yêu thích
- Hiệu ứng hover nâng lên

### 5. Categories
- Căn hộ
- Nhà riêng
- Đất nền
- Văn phòng

### 6. Call-to-Action
- Khuyến khích người dùng đăng tin
- Highlight: "Đăng tin ngay"

### 7. Footer
- Thông tin công ty
- Links hữu ích
- Contact info
- Social media links

## 🎨 Màu Sắc

- **Primary (Vàng)**: `#f59e0b` (Amber-600)
- **Light Yellow**: `#fbbf24` (Amber-400)
- **White**: `#ffffff`
- **Gray**: `#6b7280` (Gray-500)
- **Dark**: `#111827` (Gray-900)

## 🔧 Customization

### Thay Đổi Màu Chính
Sửa trong `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#f59e0b', // Thay đổi màu vàng chính
  }
}
```

### Thêm Trang Mới
1. Tạo file HTML mới trong thư mục `pages/`
2. Copy structure từ `index.html`
3. Sửa nội dung phù hợp

## 📱 Responsive Design

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🌐 Resources

- [TailwindCSS Docs](https://tailwindcss.com)
- [Unsplash Images](https://unsplash.com)
- Concept: ChợTốt Real Estate Marketplace

## 📝 License

MIT License - Tự do sử dụng và chỉnh sửa

---

**Happy Coding!** 🚀
