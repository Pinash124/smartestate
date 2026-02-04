import { User } from '@/types';

export default function TestDataPage() {
  const handleCreateTestData = () => {
    // 1. Xóa sạch dữ liệu cũ để tránh trùng lặp hoặc lỗi logic
    localStorage.clear();

    // 2. Định nghĩa danh sách 4 tài khoản mẫu
    const users: User[] = [
      {
        id: 1,
        name: "Quản trị viên",
        email: "admin@smartestate.vn",
        password: btoa("admin123"), // Mã hóa Base64 để khớp với logic trong AuthService
        role: "admin",
        profile: { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: "Môi giới chuyên nghiệp",
        email: "broker@smartestate.vn",
        password: btoa("broker123"), 
        role: "broker",
        profile: { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Broker" },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: "Người bán nhà",
        email: "seller@smartestate.vn",
        password: btoa("seller123"),
        role: "seller",
        profile: { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Seller" },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: "Người mua tiềm năng",
        email: "user@smartestate.vn",
        password: btoa("user123"),
        role: "user",
        profile: { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User" },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // 3. Lưu mảng users vào localStorage dưới dạng chuỗi JSON
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Khởi tạo thành công! Hệ thống sẽ chuyển bạn sang trang Đăng nhập.');
    
    // 4. Chuyển hướng sang trang đăng nhập
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Hệ thống Kiểm thử</h1>
          <p className="text-lg text-gray-600">Nhấn nút bên dưới để thiết lập dữ liệu mẫu cho ứng dụng.</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-10">
          <div className="flex justify-center">
            <button
              onClick={handleCreateTestData}
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-xl font-bold text-xl transition-all shadow-lg hover:shadow-green-200"
            >
              ✓ Khởi tạo dữ liệu ngay
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Info */}
            <div className="p-6 bg-amber-50 rounded-xl border border-amber-100">
              <h3 className="font-bold text-amber-800 text-lg mb-2">🛡️ Admin</h3>
              <p className="text-sm text-gray-600">Email: <span className="font-mono text-black">admin@smartestate.vn</span></p>
              <p className="text-sm text-gray-600">Pass: <span className="font-mono text-black">admin123</span></p>
            </div>

            {/* Broker Info */}
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-800 text-lg mb-2">🤝 Broker</h3>
              <p className="text-sm text-gray-600">Email: <span className="font-mono text-black">broker@smartestate.vn</span></p>
              <p className="text-sm text-gray-600">Pass: <span className="font-mono text-black">broker123</span></p>
            </div>

            {/* Seller Info */}
            <div className="p-6 bg-green-50 rounded-xl border border-green-100">
              <h3 className="font-bold text-green-800 text-lg mb-2">🏠 Seller</h3>
              <p className="text-sm text-gray-600">Email: <span className="font-mono text-black">seller@smartestate.vn</span></p>
              <p className="text-sm text-gray-600">Pass: <span className="font-mono text-black">seller123</span></p>
            </div>

            {/* User Info */}
            <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
              <h3 className="font-bold text-purple-800 text-lg mb-2">🔍 User (Buyer)</h3>
              <p className="text-sm text-gray-600">Email: <span className="font-mono text-black">user@smartestate.vn</span></p>
              <p className="text-sm text-gray-600">Pass: <span className="font-mono text-black">user123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}