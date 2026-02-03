// User roles and permissions
const ROLES = {
  GUEST: 'guest',
  USER: 'user',
  SELLER: 'seller',
  BROKER: 'broker',
  ADMIN: 'admin'
};

const PERMISSIONS = {
  // Guest permissions
  [ROLES.GUEST]: [
    'view_home',
    'view_approved_listings',
    'basic_search',
    'view_blog',
    'view_faq',
    'register',
    'login'
  ],
  
  // User permissions
  [ROLES.USER]: [
    'view_home',
    'view_all_listings',
    'advanced_search',
    'advanced_filter',
    'ai_recommend',
    'chat_with_seller',
    'manage_profile',
    'view_blog',
    'view_faq'
  ],
  
  // Seller permissions
  [ROLES.SELLER]: [
    'view_home',
    'view_all_listings',
    'create_listing',
    'edit_own_listing',
    'view_own_listings',
    'upload_images',
    'receive_chat',
    'reply_chat',
    'request_broker',
    'manage_profile',
    'view_blog'
  ],
  
  // Broker permissions
  [ROLES.BROKER]: [
    'view_home',
    'view_all_listings',
    'accept_seller_request',
    'reject_seller_request',
    'manage_responsible_listings',
    'update_responsible_listing',
    'receive_chat_from_user',
    'reply_chat',
    'manage_profile',
    'view_blog'
  ],
  
  // Admin permissions
  [ROLES.ADMIN]: [
    'approve_listing',
    'reject_listing',
    'view_ai_moderation',
    'manage_users',
    'manage_roles',
    'manage_blog',
    'manage_faq',
    'view_dashboard',
    'view_reports'
  ]
};

// Authentication class
class AuthService {
  constructor() {
    this.currentUser = this.loadFromStorage();
  }

  // Load user from localStorage
  loadFromStorage() {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  // Save user to localStorage
  saveToStorage(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Register new user
  register(email, password, name, role = ROLES.USER) {
    // In production, this would call a backend API
    const newUser = {
      id: Date.now(),
      email,
      password: this.hashPassword(password),
      name,
      role,
      createdAt: new Date().toISOString(),
      profile: {
        avatar: 'https://via.placeholder.com/150',
        phone: '',
        address: ''
      },
      verified: false
    };

    // Simulate saving to backend
    const users = this.getAllUsers();
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    return { success: true, user: newUser };
  }

  // Login user
  login(email, password) {
    // In production, this would call a backend API
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === this.hashPassword(password));

    if (user) {
      this.currentUser = user;
      this.saveToStorage(user);
      return { success: true, user };
    }

    return { success: false, message: 'Email hoặc mật khẩu không đúng' };
  }

  // Logout
  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get current user role
  getCurrentRole() {
    return this.currentUser?.role || ROLES.GUEST;
  }

  // Check if user has permission
  hasPermission(permission) {
    const role = this.getCurrentRole();
    return PERMISSIONS[role]?.includes(permission) || false;
  }

  // Check if user has role
  hasRole(role) {
    return this.getCurrentRole() === role;
  }

  // Get all users (simulated)
  getAllUsers() {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  }

  // Hash password (simple hash, use bcrypt in production)
  hashPassword(password) {
    return btoa(password);
  }

  // Update user profile
  updateProfile(updates) {
    if (!this.currentUser) return false;

    this.currentUser = { ...this.currentUser, ...updates };
    this.saveToStorage(this.currentUser);
    
    // Update in all users
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === this.currentUser.id);
    if (index !== -1) {
      users[index] = this.currentUser;
      localStorage.setItem('users', JSON.stringify(users));
    }

    return true;
  }

  // Initialize default admin user
  initializeDefaultAdmin() {
    const users = this.getAllUsers();
    if (users.some(u => u.role === ROLES.ADMIN)) return;

    this.register('admin@smartestate.vn', 'admin123', 'Administrator', ROLES.ADMIN);
  }
}

// Create global auth service instance
const authService = new AuthService();
authService.initializeDefaultAdmin();

// Utility function to check route access
function canAccessRoute(requiredRole = null, requiredPermission = null) {
  if (!requiredRole && !requiredPermission) return true;

  if (requiredRole && !authService.hasRole(requiredRole)) {
    return false;
  }

  if (requiredPermission && !authService.hasPermission(requiredPermission)) {
    return false;
  }

  return true;
}

// Redirect to login if not authenticated
function requireAuth(requiredRole = null, requiredPermission = null) {
  if (!authService.isAuthenticated()) {
    window.location.href = '/pages/auth/login.html';
    return false;
  }

  if (!canAccessRoute(requiredRole, requiredPermission)) {
    window.location.href = '/pages/403-forbidden.html';
    return false;
  }

  return true;
}
