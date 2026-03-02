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
      console.error('[PointsService] getBalance failed', error);
      throw error;
    }
  }

  // ─── User: List available packages ───────────────────────────────────
  async listPackages(): Promise<PointPackage[]> {
    try {
      const data = await apiRequest<PointPackage[]>('/api/points/packages', { auth: true });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('[PointsService] listPackages failed', error);
      throw error;
    }
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
      throw error;
    }
  }

  // ─── User: Payment history ────────────────────────────────────────────
  async getPaymentHistory(): Promise<PointTransaction[]> {
    try {
      const data = await apiRequest<PointTransaction[]>('/api/points/payments/history', { auth: true });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('[PointsService] getPaymentHistory failed', error);
      throw error;
    }
  }

  // ─── Admin: All PAID point payments ──────────────────────────────────
  async getAdminPayments(): Promise<PointTransaction[]> {
    try {
      const data = await apiRequest<PointTransaction[]>('/api/admin/payments', { auth: true });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('[PointsService] getAdminPayments failed', error);
      throw error;
    }
  }
}

export const pointsService = new PointsService();
