import { apiRequest } from './api';
import { PointPackage, PointTransaction } from '@/types';

export interface PointsBalance {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export class PointsService {
  // ─── User: Get current balance ───────────────────────────────────────
  async getBalance(): Promise<PointsBalance> {
    try {
      const data = await apiRequest<PointsBalance>('/api/points/balance', { auth: true });
      return data;
    } catch (error) {
      console.warn('[PointsService] getBalance failed, using mock', error);
      return { userId: '', balance: 100, totalEarned: 200, totalSpent: 100 };
    }
  }

  // ─── User: List available packages ───────────────────────────────────
  async listPackages(): Promise<PointPackage[]> {
    try {
      const data = await apiRequest<PointPackage[]>('/api/points/packages', { auth: true });
      return Array.isArray(data) ? data : this.getMockPackages();
    } catch {
      return this.getMockPackages();
    }
  }

  private getMockPackages(): PointPackage[] {
    return [
      { id: 'pkg_50',  name: 'Gói Cơ bản',    points: 50,  price: 50000,  description: 'Phù hợp để đăng 1-2 tin', popular: false },
      { id: 'pkg_150', name: 'Gói Tiêu chuẩn', points: 150, price: 130000, description: 'Tốt nhất cho seller mới', popular: true  },
      { id: 'pkg_300', name: 'Gói Nâng cao',   points: 300, price: 240000, description: 'Đăng nhiều tin, boost ưu tiên', popular: false },
      { id: 'pkg_500', name: 'Gói Chuyên gia', points: 500, price: 380000, description: 'Dành cho seller chuyên nghiệp', popular: false },
    ];
  }

  // ─── User: Initiate payment ───────────────────────────────────────────
  async initiatePayment(packageId: string): Promise<{ paymentId: string; paymentUrl?: string; qrCode?: string } | null> {
    try {
      const data = await apiRequest<{ paymentId: string; paymentUrl?: string; qrCode?: string }>(
        '/api/points/payments',
        { method: 'POST', body: { packageId }, auth: true }
      );
      return data;
    } catch (error) {
      console.error('[PointsService] initiatePayment failed', error);
      // Demo fallback
      return { paymentId: 'demo-' + Date.now(), paymentUrl: '#', qrCode: undefined };
    }
  }

  // ─── User: Payment history ────────────────────────────────────────────
  async getPaymentHistory(): Promise<PointTransaction[]> {
    try {
      const data = await apiRequest<PointTransaction[]>('/api/points/payments/history', { auth: true });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  // ─── Admin: All PAID point payments ──────────────────────────────────
  async getAdminPayments(): Promise<PointTransaction[]> {
    try {
      const data = await apiRequest<PointTransaction[]>('/api/admin/payments', { auth: true });
      return Array.isArray(data) ? data : this.getMockAdminPayments();
    } catch {
      return this.getMockAdminPayments();
    }
  }

  private getMockAdminPayments(): PointTransaction[] {
    const now = new Date();
    return [
      { id: '1', userId: 'user-001', userEmail: 'seller1@example.com', packageId: 'pkg_150', packageName: 'Gói Tiêu chuẩn', points: 150, amount: 130000, status: 'PAID', createdAt: new Date(now.getTime() - 86400000 * 1).toISOString() },
      { id: '2', userId: 'user-002', userEmail: 'seller2@example.com', packageId: 'pkg_500', packageName: 'Gói Chuyên gia', points: 500, amount: 380000, status: 'PAID', createdAt: new Date(now.getTime() - 86400000 * 2).toISOString() },
      { id: '3', userId: 'user-003', userEmail: 'seller3@example.com', packageId: 'pkg_50',  packageName: 'Gói Cơ bản',    points: 50,  amount: 50000,  status: 'PAID', createdAt: new Date(now.getTime() - 86400000 * 3).toISOString() },
      { id: '4', userId: 'user-001', userEmail: 'seller1@example.com', packageId: 'pkg_300', packageName: 'Gói Nâng cao',  points: 300, amount: 240000, status: 'PAID', createdAt: new Date(now.getTime() - 86400000 * 5).toISOString() },
      { id: '5', userId: 'user-004', userEmail: 'seller4@example.com', packageId: 'pkg_150', packageName: 'Gói Tiêu chuẩn',points: 150, amount: 130000, status: 'PENDING', createdAt: new Date(now.getTime() - 3600000).toISOString() },
    ];
  }
}

export const pointsService = new PointsService();
