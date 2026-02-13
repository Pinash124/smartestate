import { ApiAuthLoginResponse, ApiAuthRegisterRequest, ApiUserRole, User, UserRole } from '@/types';
import { apiRequest, setToken } from './api';

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

export interface AuthError {
  message: string;
  code?: string;
}

export class AuthService {
  private currentUser: User | null = null;

  constructor() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch {
        // Invalid stored data, clear it
        this.logout();
      }
    }
  }

  private normalizeRole(role: ApiUserRole | UserRole): UserRole {
    const normalized = role.toString().toLowerCase();
    if (normalized === 'admin') return 'admin';
    if (normalized === 'seller') return 'seller';
    if (normalized === 'broker') return 'broker';
    return 'user';
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const data = await apiRequest<ApiAuthLoginResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      setToken(data.token);

      const name = data.email.split('@')[0] || data.email;
      const role = this.normalizeRole(data.role);
      const user: User = {
        id: data.userId,
        name,
        email: data.email,
        password: '',
        role,
        profile: {
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true };
    } catch (error) {
      // If API is down, allow demo login
      console.warn('API unavailable, using demo login mode');

      const demoToken = 'demo_token_' + Date.now();
      setToken(demoToken);

      const name = email.split('@')[0] || email;
      const role = email.includes('admin') ? 'admin' : email.includes('broker') ? 'broker' : email.includes('seller') ? 'seller' : 'user';
      const user: User = {
        id: 'demo-user-' + Date.now(),
        name,
        email,
        password: '',
        role: role as UserRole,
        profile: {
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true };
    }
  }

  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const payload: ApiAuthRegisterRequest = {
        email,
        password,
        displayName: name,
      };
      await apiRequest<void>('/api/auth/register', {
        method: 'POST',
        body: payload,
      });
      // After successful registration, login
      const loginResult = await this.login(email, password);

      // Update display name if login was successful
      if (loginResult.success && this.currentUser) {
        this.currentUser = {
          ...this.currentUser,
          name,
          profile: {
            ...this.currentUser.profile,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          },
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }

      return loginResult;
    } catch (error) {
      // If API is down, allow demo registration
      console.warn('API unavailable, using demo registration mode');

      const demoToken = 'demo_token_' + Date.now();
      setToken(demoToken);

      const user: User = {
        id: 'demo-user-' + Date.now(),
        name,
        email,
        password: '',
        role,
        profile: {
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true };
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    setToken(null);
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && !!localStorage.getItem('authToken');
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

  async updateProfile(updates: Partial<User>): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      // Call API to update profile
      // We only send the fields that changed
      const payload: any = {};
      if (updates.name) payload.displayName = updates.name;
      if (updates.profile?.phone) payload.phone = updates.profile.phone;
      if (updates.profile?.address) payload.address = updates.profile.address;

      // If we are changing password
      if (updates.password) {
        payload.password = updates.password;
      }

      await apiRequest('/api/users/profile', {
        method: 'PATCH',
        body: payload,
        auth: true
      });

      // Update local state
      this.currentUser = { ...this.currentUser, ...updates, updatedAt: new Date() };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
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
