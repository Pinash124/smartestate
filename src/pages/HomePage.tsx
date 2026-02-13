import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '48px', margin: 0, marginBottom: '20px' }}>🏠 Smart Estate</h1>
      <p style={{ fontSize: '20px', color: '#666', margin: 0, marginBottom: '30px' }}>
        Nền tảng tìm kiếm bất động sản hàng đầu tại Việt Nam
      </p>
      <p style={{ 
        marginTop: '20px', 
        color: 'green', 
        fontSize: '18px', 
        fontWeight: 'bold',
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '5px',
        display: 'inline-block'
      }}>
        ✓ Web app is working correctly!
      </p>
      <div style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link 
          to="/listings" 
          style={{ 
            padding: '12px 24px', 
            background: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'inline-block'
          }}
        >
          📋 Xem Tin Đăng
        </Link>
        <Link 
          to="/login" 
          style={{ 
            padding: '12px 24px', 
            background: '#6c757d', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'inline-block'
          }}
        >
          🔐 Đăng Nhập
        </Link>
      </div>
      <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid #ddd', color: '#999', fontSize: '14px' }}>
        <p>Smart Estate v1.0.0 © 2026 - Tất cả quyền được bảo lưu</p>
      </div>
    </div>
  )
}
