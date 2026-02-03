export default function TestDataPage() {
  const handleCreateTestData = () => {
    alert('Tính năng tạo dữ liệu kiểm thử sẽ được triển khai sớm')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tạo dữ liệu kiểm thử</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <button
            onClick={handleCreateTestData}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition"
          >
            ✓ Tạo dữ liệu kiểm thử
          </button>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tài khoản kiểm thử</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-amber-600 mb-4">Admin</h3>
                <p className="text-gray-700"><strong>Email:</strong> admin@smartestate.vn</p>
                <p className="text-gray-700"><strong>Mật khẩu:</strong> admin123</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-amber-600 mb-4">Người bán</h3>
                <p className="text-gray-700"><strong>Email:</strong> seller@smartestate.vn</p>
                <p className="text-gray-700"><strong>Mật khẩu:</strong> seller123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
