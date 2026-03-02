import { User } from '@/types';
import { apiRequest } from './api';

export const brokerService = {
  /**
   * 1. SELLER: Gửi yêu cầu ủy quyền cho một Broker cụ thể
   */
  sendTakeoverRequest: async (listingId: string, broker: User): Promise<boolean> => {
    try {
      await apiRequest('/api/brokers/takeover/request', {
        method: 'POST',
        body: { listingId, brokerId: broker.id },
        auth: true
      });
      return true;
    } catch (error) {
      console.error('Error sending takeover request:', error);
      return false;
    }
  },

  /**
   * 2. BROKER: Chấp nhận hoặc Từ chối yêu cầu quản lý
   */
  respondToRequest: async (listingId: string, brokerId: string, status: 'accepted' | 'rejected'): Promise<boolean> => {
    try {
      await apiRequest(`/api/brokers/takeover/${listingId}`, {
        method: 'PATCH',
        body: { brokerId, status },
        auth: true
      });
      return true;
    } catch (error) {
      console.error('Error responding to takeover request:', error);
      return false;
    }
  },

  /**
   * 3. HỆ THỐNG: Xác nhận đã đóng phí (Takeover Fee) và chính thức bàn giao quyền quản lý
   */
  confirmPaymentAndTransfer: async (listingId: string, brokerId: string): Promise<boolean> => {
    try {
      await apiRequest(`/api/brokers/takeover/${listingId}/confirm`, {
        method: 'POST',
        body: { brokerId },
        auth: true
      });
      return true;
    } catch (error) {
      console.error('Error confirming payment and transfer:', error);
      return false;
    }
  },

  /**
   * 4. SELLER: Thu hồi quyền quản lý từ Broker (Unassign)
   */
  unassignBroker: async (listingId: string): Promise<boolean> => {
    try {
      await apiRequest(`/api/brokers/takeover/${listingId}`, {
        method: 'DELETE',
        auth: true
      });
      return true;
    } catch (error) {
      console.error('Error unassigning broker:', error);
      return false;
    }
  }
};
