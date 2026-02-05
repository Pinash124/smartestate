import { listingService } from './listing';
import { User, BrokerRequest } from '@/types';

export const brokerService = {
  /**
   * 1. SELLER: Gửi yêu cầu ủy quyền cho một Broker cụ thể
   */
  sendTakeoverRequest: (listingId: string, broker: User) => {
    const listings = listingService.getAllListings();
    const idx = listings.findIndex(l => l.id === listingId);
    
    if (idx !== -1) {
      const listing = listings[idx];

      // Kiểm tra nếu đã có yêu cầu PENDING từ broker này để tránh trùng lặp
      const hasPending = listing.brokerRequests?.some(
        r => r.brokerId === broker.id && r.status === 'pending'
      );
      if (hasPending) return false;

      const newRequest: BrokerRequest = {
        brokerId: broker.id,
        brokerName: broker.name,
        sellerName: listing.sellerName, // FIX: Bổ sung trường này theo yêu cầu của type BrokerRequest
        requestedAt: new Date(),
        status: 'pending'
      };
      
      listings[idx].brokerRequests = [...(listing.brokerRequests || []), newRequest];
      localStorage.setItem('listings', JSON.stringify(listings));
      return true;
    }
    return false;
  },

  /**
   * 2. BROKER: Chấp nhận hoặc Từ chối yêu cầu quản lý
   */
  respondToRequest: (listingId: string, brokerId: string, status: 'accepted' | 'rejected') => {
    const listings = listingService.getAllListings();
    const listing = listings.find(l => l.id === listingId);
    
    if (listing && listing.brokerRequests) {
      const req = listing.brokerRequests.find(r => r.brokerId === brokerId);
      if (req) {
        req.status = status;
        req.respondedAt = new Date();
        
        // Nếu chấp nhận, chuyển trạng thái phí sang 'unpaid' để kích hoạt luồng thanh toán
        if (status === 'accepted') {
          listing.takeoverFeeStatus = 'unpaid';
        }
        
        localStorage.setItem('listings', JSON.stringify(listings));
        return true;
      }
    }
    return false;
  },

  /**
   * 3. HỆ THỐNG: Xác nhận đã đóng phí (Takeover Fee) và chính thức bàn giao quyền quản lý
   */
  confirmPaymentAndTransfer: (listingId: string, brokerId: string) => {
    const listings = listingService.getAllListings();
    const idx = listings.findIndex(l => l.id === listingId);
    
    if (idx !== -1) {
      const listing = listings[idx];
      
      // Cập nhật người chịu trách nhiệm chính cho tin đăng
      listings[idx].responsibleId = brokerId; 
      listings[idx].responsibleBrokerId = brokerId; // Lưu ID để filter nhanh trong danh sách của Broker
      listings[idx].isBrokerManaged = true;
      listings[idx].takeoverFeeStatus = 'paid';
      
      // Tự động hủy các yêu cầu PENDING khác của cùng tin đăng này (nếu có)
      if (listing.brokerRequests) {
        listings[idx].brokerRequests = listing.brokerRequests.map(req => 
          req.brokerId !== brokerId && req.status === 'pending' 
          ? { ...req, status: 'rejected', respondedAt: new Date() } 
          : req
        );
      }

      localStorage.setItem('listings', JSON.stringify(listings));
      return true;
    }
    return false;
  },

  /**
   * 4. SELLER: Thu hồi quyền quản lý từ Broker (Unassign)
   */
  unassignBroker: (listingId: string) => {
    const listings = listingService.getAllListings();
    const idx = listings.findIndex(l => l.id === listingId);
    
    if (idx !== -1) {
      // Trả lại quyền quản lý cho chủ sở hữu ban đầu (Seller)
      listings[idx].responsibleId = listings[idx].sellerId;
      listings[idx].isBrokerManaged = false;
      listings[idx].takeoverFeeStatus = 'unpaid';
      delete listings[idx].responsibleBrokerId;
      
      localStorage.setItem('listings', JSON.stringify(listings));
      return true;
    }
    return false;
  }
};
