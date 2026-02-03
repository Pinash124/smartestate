// Dynamic navbar based on user role
class NavbarManager {
  constructor() {
    this.authService = window.authService;
  }

  updateNavbar() {
    const navbar = document.querySelector('nav');
    if (!navbar) return;

    const userRole = this.authService.getCurrentRole();
    const desktopMenu = document.getElementById('desktop-menu');
    const authButtons = document.querySelector('[data-auth-buttons]');

    if (userRole === 'guest') {
      this.renderGuestMenu(desktopMenu, authButtons);
    } else if (userRole === 'user') {
      this.renderUserMenu(desktopMenu, authButtons);
    } else if (userRole === 'seller') {
      this.renderSellerMenu(desktopMenu, authButtons);
    } else if (userRole === 'broker') {
      this.renderBrokerMenu(desktopMenu, authButtons);
    } else if (userRole === 'admin') {
      this.renderAdminMenu(desktopMenu, authButtons);
    }
  }

  renderGuestMenu(menuEl, authEl) {
    menuEl.innerHTML = `
      <a href="/" class="text-gray-600 hover:text-amber-600 font-medium transition">Trang chủ</a>
      <a href="/pages/listings.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Tin đăng</a>
      <a href="/pages/blog.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Blog</a>
      <a href="/pages/faq.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Câu hỏi thường gặp</a>
    `;

    authEl.innerHTML = `
      <a href="/pages/auth/login.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Đăng nhập</a>
      <a href="/pages/auth/signup.html" class="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition">Đăng ký</a>
    `;
  }

  renderUserMenu(menuEl, authEl) {
    menuEl.innerHTML = `
      <a href="/" class="text-gray-600 hover:text-amber-600 font-medium transition">Trang chủ</a>
      <a href="/pages/listings.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Tin đăng</a>
      <a href="/pages/user/ai-recommend.html" class="text-gray-600 hover:text-amber-600 font-medium transition">AI Recommend</a>
      <a href="/pages/user/saved-listings.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Đã lưu</a>
      <a href="/pages/user/messages.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Tin nhắn</a>
    `;

    const user = this.authService.currentUser;
    authEl.innerHTML = `
      <div class="relative group">
        <button class="flex items-center space-x-2 text-gray-600 hover:text-amber-600 font-medium">
          <img src="${user.profile.avatar}" alt="Avatar" class="w-8 h-8 rounded-full">
          <span>${user.name}</span>
        </button>
        <div class="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
          <a href="/pages/user/profile.html" class="block px-4 py-2 hover:bg-gray-100">Hồ sơ cá nhân</a>
          <a href="/pages/user/messages.html" class="block px-4 py-2 hover:bg-gray-100">Tin nhắn</a>
          <button onclick="authService.logout(); window.location.href='/';" class="w-full text-left px-4 py-2 hover:bg-gray-100">Đăng xuất</button>
        </div>
      </div>
    `;
  }

  renderSellerMenu(menuEl, authEl) {
    menuEl.innerHTML = `
      <a href="/" class="text-gray-600 hover:text-amber-600 font-medium transition">Trang chủ</a>
      <a href="/pages/listings.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Duyệt tin</a>
      <a href="/pages/seller/my-listings.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Tin của tôi</a>
      <a href="/pages/seller/create-listing.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Đăng tin mới</a>
    `;

    const user = this.authService.currentUser;
    authEl.innerHTML = `
      <div class="relative group">
        <button class="flex items-center space-x-2 text-gray-600 hover:text-amber-600 font-medium">
          <img src="${user.profile.avatar}" alt="Avatar" class="w-8 h-8 rounded-full">
          <span>${user.name}</span>
        </button>
        <div class="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
          <a href="/pages/seller/profile.html" class="block px-4 py-2 hover:bg-gray-100">Hồ sơ</a>
          <a href="/pages/seller/my-listings.html" class="block px-4 py-2 hover:bg-gray-100">Tin của tôi</a>
          <a href="/pages/seller/messages.html" class="block px-4 py-2 hover:bg-gray-100">Tin nhắn</a>
          <button onclick="authService.logout(); window.location.href='/';" class="w-full text-left px-4 py-2 hover:bg-gray-100">Đăng xuất</button>
        </div>
      </div>
    `;
  }

  renderBrokerMenu(menuEl, authEl) {
    menuEl.innerHTML = `
      <a href="/" class="text-gray-600 hover:text-amber-600 font-medium transition">Trang chủ</a>
      <a href="/pages/broker/requests.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Yêu cầu</a>
      <a href="/pages/broker/my-listings.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Tin quản lý</a>
      <a href="/pages/broker/messages.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Tin nhắn</a>
    `;

    const user = this.authService.currentUser;
    authEl.innerHTML = `
      <div class="relative group">
        <button class="flex items-center space-x-2 text-gray-600 hover:text-amber-600 font-medium">
          <img src="${user.profile.avatar}" alt="Avatar" class="w-8 h-8 rounded-full">
          <span>${user.name}</span>
        </button>
        <div class="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
          <a href="/pages/broker/profile.html" class="block px-4 py-2 hover:bg-gray-100">Hồ sơ</a>
          <a href="/pages/broker/my-listings.html" class="block px-4 py-2 hover:bg-gray-100">Tin quản lý</a>
          <button onclick="authService.logout(); window.location.href='/';" class="w-full text-left px-4 py-2 hover:bg-gray-100">Đăng xuất</button>
        </div>
      </div>
    `;
  }

  renderAdminMenu(menuEl, authEl) {
    menuEl.innerHTML = `
      <a href="/" class="text-gray-600 hover:text-amber-600 font-medium transition">Trang chủ</a>
      <a href="/pages/admin/dashboard.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Dashboard</a>
      <a href="/pages/admin/moderation.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Duyệt tin</a>
      <a href="/pages/admin/users.html" class="text-gray-600 hover:text-amber-600 font-medium transition">Người dùng</a>
    `;

    const user = this.authService.currentUser;
    authEl.innerHTML = `
      <div class="relative group">
        <button class="flex items-center space-x-2 text-gray-600 hover:text-amber-600 font-medium">
          <img src="${user.profile.avatar}" alt="Avatar" class="w-8 h-8 rounded-full">
          <span>${user.name}</span>
        </button>
        <div class="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
          <a href="/pages/admin/profile.html" class="block px-4 py-2 hover:bg-gray-100">Hồ sơ</a>
          <button onclick="authService.logout(); window.location.href='/';" class="w-full text-left px-4 py-2 hover:bg-gray-100">Đăng xuất</button>
        </div>
      </div>
    `;
  }
}

// Initialize navbar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const navbarManager = new NavbarManager();
  navbarManager.updateNavbar();
});
