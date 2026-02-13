import { User } from '@/types';

export const brokerService = {
  /**
   * DEPRECATED: These methods use localStorage mock data
   * Should use backend API for broker takeover operations
   */
  
  /**
   * 1. SELLER: Gửi yêu cầu ủy quyền cho một Broker cụ thể
   */
  sendTakeoverRequest: (_listingId: string, _broker: User) => {
    console.warn('brokerService.sendTakeoverRequest is deprecated. Use backend API instead.');
    // TODO: Replace with: POST /api/brokers/takeover/request
    return false;
  },

  /**
   * 2. BROKER: Chấp nhận hoặc Từ chối yêu cầu quản lý
   */
  respondToRequest: (_listingId: string, _brokerId: string, _status: 'accepted' | 'rejected') => {
    console.warn('brokerService.respondToRequest is deprecated. Use backend API instead.');
    // TODO: Replace with: PATCH /api/brokers/takeover/{id}
    return false;
  },

  /**
   * 3. HỆ THỐNG: Xác nhận đã đóng phí (Takeover Fee) và chính thức bàn giao quyền quản lý
   */
  confirmPaymentAndTransfer: (_listingId: string, _brokerId: string) => {
    console.warn('brokerService.confirmPaymentAndTransfer is deprecated. Use backend API instead.');
    // TODO: Replace with: POST /api/brokers/takeover/{id}/confirm
    return false;
  },

  /**
   * 4. SELLER: Thu hồi quyền quản lý từ Broker (Unassign)
   */
  unassignBroker: (_listingId: string) => {
    console.warn('brokerService.unassignBroker is deprecated. Use backend API instead.');
    // TODO: Replace with: DELETE /api/brokers/takeover/{id}
    return false;
  }
};
