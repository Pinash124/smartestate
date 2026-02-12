import { listingService } from './listing';
import { User, BrokerRequest } from '@/types';

export const brokerService = {
  /**
   * DEPRECATED: These methods use localStorage mock data
   * Should use backend API for broker takeover operations
   */
  
  /**
   * 1. SELLER: Gửi yêu cầu ủy quyền cho một Broker cụ thể
   */
  sendTakeoverRequest: (listingId: string, broker: User) => {
    console.warn('brokerService.sendTakeoverRequest is deprecated. Use backend API instead.');
    // TODO: Replace with: POST /api/brokers/takeover/request
    return false;
  },

  /**
   * 2. BROKER: Chấp nhận hoặc Từ chối yêu cầu quản lý
   */
  respondToRequest: (listingId: string, brokerId: string, status: 'accepted' | 'rejected') => {
    console.warn('brokerService.respondToRequest is deprecated. Use backend API instead.');
    // TODO: Replace with: PATCH /api/brokers/takeover/{id}
    return false;
  },
          listing.takeoverFeeStatus = 'unpaid';
        }
        
      // TODO: Replace with: PATCH /api/brokers/takeover/{id}
      return false;
    },

  /**
   * 3. HỆ THỐNG: Xác nhận đã đóng phí (Takeover Fee) và chính thức bàn giao quyền quản lý
   */
  confirmPaymentAndTransfer: (listingId: string, brokerId: string) => {
    console.warn('brokerService.confirmPaymentAndTransfer is deprecated. Use backend API instead.');
    // TODO: Replace with: POST /api/brokers/takeover/{id}/confirm
    return false;
  },

  /**
   * 4. SELLER: Thu hồi quyền quản lý từ Broker (Unassign)
   */
  unassignBroker: (listingId: string) => {
    console.warn('brokerService.unassignBroker is deprecated. Use backend API instead.');
    // TODO: Replace with: DELETE /api/brokers/takeover/{id}
    return false;
  }
};
