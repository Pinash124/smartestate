import { ApiAuthLoginResponse, ApiAuthRegisterRequest, ApiUserRole, User, UserRole } from '@/types';
import { apiRequest, setToken, ApiError } from './api';

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
      if (error instanceof ApiError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Đã xảy ra lỗi',
        },
      };
    }
  }

  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: AuthError }> {
    try {
      void role;
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
      return this.login(email, password);
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Đã xảy ra lỗi',
        },
      };
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

  updateProfile(updates: Partial<User>): boolean {
    if (!this.currentUser) return false;
    this.currentUser = { ...this.currentUser, ...updates, updatedAt: new Date() };
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
