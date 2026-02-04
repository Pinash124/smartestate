import { User, UserRole } from '@/types';

const PERMISSIONS: Record<UserRole, string[]> = {
  guest: ['browse_listings', 'register', 'login'],
  user: [
    'browse_listings',
    'ai_recommendations',
    'manage_profile',
    'report_listing',
    'send_messages',
    'reveal_phone',
  ],
  seller: [
    'browse_listings',
    'create_listing',
    'manage_listings',
    'edit_listing',
    'request_broker',
    'receive_offers',
    'manage_profile',
  ],
  broker: [
    'browse_listings',
    'view_requests',
    'accept_requests',
    'manage_assigned_listings',
    'view_revenue',
    'mark_listing_done',
    'accept_payments',
  ],
  admin: [
    'moderation_review',
    'approve_listings',
    'reject_listings',
    'view_revenue',
    'view_reports',
    'manage_users',
    'system_settings',
  ],
};

export class AuthService {
  private currentUser: User | null = null;

  constructor() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUser = JSON.parse(saved);
    }
  }

  hashPassword(password: string): string {
    // Simple hash for MVP (use bcrypt in production)
    return btoa(password);
  }

  login(email: string, password: string): boolean {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const user = users.find(
      (u) => u.email === email && u.password === this.hashPassword(password)
    );

    if (user) {
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  register(name: string, email: string, password: string, role: UserRole): boolean {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];

    if (users.some((u) => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: users.length + 1,
      name,
      email,
      password: this.hashPassword(password),
      role,
      profile: {
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    this.currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return true;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentRole(): UserRole {
    return this.currentUser?.role || 'guest';
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  hasPermission(permission: string): boolean {
    const role = this.getCurrentRole();
    return PERMISSIONS[role].includes(permission);
  }

  updateProfile(updates: Partial<User>): boolean {
    if (!this.currentUser) return false;

    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const index = users.findIndex((u) => u.id === this.currentUser!.id);

    if (index === -1) return false;

    users[index] = { ...users[index], ...updates, updatedAt: new Date() };
    this.currentUser = users[index];

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    return true;
  }
}

export const authService = new AuthService();

export function requireAuth(requiredRole?: UserRole, requiredPermission?: string): boolean {
  if (!authService.isAuthenticated()) {
    return false;
  }

  if (requiredRole && !authService.hasRole(requiredRole)) {
    return false;
  }

  if (requiredPermission && !authService.hasPermission(requiredPermission)) {
    return false;
  }

  return true;
}
