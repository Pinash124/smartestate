import {
  ApiCreateListingRequest,
  ApiListingContactResponse,
  ApiListingDetail,
  Listing,
  ListingStatus,
  ModerationStatus,
  ModerationResult,
  Payment,
  PaymentType,
} from '@/types';
import { API_BASE_URL, apiRequest, ApiError } from './api';

export const LISTING_STATUS: Record<string, ListingStatus> = {
  DRAFT: 'draft',
  PENDING_MODERATION: 'pending_moderation',
  APPROVED: 'approved',
  ACTIVE: 'active',
  DONE: 'done',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

export const MODERATION_STATUS: Record<string, ModerationStatus> = {
  PENDING: 'pending',
  NEED_REVIEW: 'need_review',
  AUTO_APPROVED: 'auto_approved',
  AUTO_REJECTED: 'auto_rejected',
  MANUALLY_APPROVED: 'manually_approved',
  MANUALLY_REJECTED: 'manually_rejected',
};

export const PAYMENT_TYPE: Record<string, PaymentType> = {
  POST_LISTING: 'post_listing',
  PUSH_LISTING: 'push_listing',
  BROKER_MEMBERSHIP: 'broker_fee',
  TAKEOVER_FEE: 'takeover_fee',
};

const FAVORITE_KEY = 'favoriteListings';

// AI Moderation Service
export class AIModerationService {
  private readonly FORBIDDEN_WORDS = ['fake', 'spam', 'scam', 'cheat'];
  private readonly LOW_RISK = 20;
  private readonly HIGH_RISK = 30;

  runModeration(listing: Listing): ModerationResult {
    let riskScore = 0;
    const flags: string[] = [];
    const suggestions: string[] = [];

    // Title validation
    if (listing.title.length < 10) {
      flags.push('Tiêu đề quá ngắn (tối thiểu 10 ký tự)');
      riskScore += 15;
    }

    // Description validation
    if (listing.description.length < 50) {
      flags.push('Mô tả quá ngắn (tối thiểu 50 ký tự)');
      riskScore += 10;
      suggestions.push('Thêm mô tả chi tiết về bất động sản');
    }

    // Images validation
    if (!listing.images || listing.images.length === 0) {
      flags.push('Cần có ít nhất 1 ảnh');
      riskScore += 20;
    } else if (listing.images.length < 3) {
      suggestions.push('Thêm 3+ ảnh để tăng độ tin cậy');
      riskScore += 5;
    }

    // Forbidden words check
    const contentLower = (listing.title + ' ' + listing.description).toLowerCase();
    for (const word of this.FORBIDDEN_WORDS) {
      if (contentLower.includes(word)) {
        flags.push(`Chứa từ khóa nhạy cảm: "${word}"`);
        riskScore += 20;
      }
    }

    // Duplicate check
    const allListings = JSON.parse(localStorage.getItem('listings') || '[]') as Listing[];
    const duplicates = allListings.filter(
      (l) => l.sellerId === listing.sellerId && l.title === listing.title
    );
    if (duplicates.length > 0) {
      flags.push('Có tin đăng trùng lặp từ cùng người bán');
      riskScore += 15;
    }

    // Determine decision
    let decision: 'APPROVED' | 'REJECTED' | 'NEED_REVIEW';
    let status: ModerationStatus;

    if (riskScore < this.LOW_RISK) {
      decision = 'APPROVED';
      status = MODERATION_STATUS.AUTO_APPROVED;
    } else if (riskScore > this.HIGH_RISK) {
      decision = 'REJECTED';
      status = MODERATION_STATUS.AUTO_REJECTED;
    } else {
      decision = 'NEED_REVIEW';
      status = MODERATION_STATUS.NEED_REVIEW;
    }

    return {
      status,
      decision,
      riskScore: Math.min(riskScore, 100),
      flags,
      suggestions,
      reviewedAt: new Date(),
    };
  }
}

// Payment Service
export class PaymentService {
  recordPayment(payment: Omit<Payment, 'id'>): Payment {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]') as Payment[];
    const newPayment: Payment = {
      ...payment,
      id: payments.length + 1,
    };
    payments.push(newPayment);
    localStorage.setItem('payments', JSON.stringify(payments));
    return newPayment;
  }

  getRevenueByDateRange(startDate: Date, endDate: Date): Record<string, number> {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]') as Payment[];
    const revenue: Record<string, number> = {
      total: 0,
      post_listing: 0,
      push_listing: 0,
      broker_fee: 0,
      takeover_fee: 0,
    };

    for (const payment of payments) {
      const paymentDate = new Date(payment.date);
      if (paymentDate >= startDate && paymentDate <= endDate && payment.status === 'PAID') {
        revenue.total += payment.amount;
        revenue[payment.type] = (revenue[payment.type] || 0) + payment.amount;
      }
    }

    return revenue;
  }
}

// Listing Service
export class ListingService {
  private moderationService = new AIModerationService();
  private paymentService = new PaymentService();

  private resolveImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const normalized = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL}${normalized}`;
  }

  private formatPrice(amount: number, currency: string): string {
    const formatted = new Intl.NumberFormat('vi-VN').format(amount);
    return `${formatted} ${currency}`;
  }

  private mapApiListing(listing: ApiListingDetail): Listing {
    const name = listing.responsibleUserId ? `User ${listing.responsibleUserId.slice(0, 6)}` : 'Người đăng';
    return {
      id: listing.id,
      sellerId: listing.responsibleUserId || '',
      sellerName: name,
      sellerPhone: listing.maskedPhone || '',
      responsibleBrokerId: listing.responsibleUserId,
      title: listing.title,
      type: 'apartment',
      transaction: 'buy',
      price: this.formatPrice(listing.priceAmount, listing.priceCurrency || 'VND'),
      area: 0,
      bedrooms: undefined,
      bathrooms: undefined,
      city: '',
      district: '',
      address: '',
      description: listing.description || '',
      images: (listing.images || []).map((img) => this.resolveImageUrl(img.url)),
      status: LISTING_STATUS.ACTIVE,
      moderation: {
        status: MODERATION_STATUS.AUTO_APPROVED,
        decision: 'APPROVED',
        riskScore: 0,
        flags: [],
        suggestions: [],
        reviewedAt: new Date(),
      },
      createdAt: new Date(),
    };
  }

  async fetchListing(id: string): Promise<Listing | null> {
    try {
      const data = await apiRequest<ApiListingDetail>(`/api/listings/${id}`);
      return this.mapApiListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async fetchListings(): Promise<Listing[]> {
    try {
      const data = await apiRequest<ApiListingDetail[]>(`/api/search/listings`);
      return Array.isArray(data) ? data.map((item) => this.mapApiListing(item)) : [];
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  }

  async revealPhone(id: string): Promise<string | null> {
    try {
      const data = await apiRequest<ApiListingContactResponse>(`/api/listings/${id}/contact`, {
        method: 'POST',
        auth: true,
      });
      return data.phone || null;
    } catch (error) {
      console.error('Error revealing phone:', error);
      if (error instanceof ApiError && error.status === 401) {
        throw new Error('Bạn cần đăng nhập để xem số điện thoại');
      }
      throw error;
    }
  }

  async createListingRemote(payload: ApiCreateListingRequest): Promise<Listing | null> {
    try {
      const data = await apiRequest<ApiListingDetail>('/api/listings', {
        method: 'POST',
        body: payload,
        auth: true,
      });
      return this.mapApiListing(data);
    } catch (error) {
      console.error('Error creating listing:', error);
      if (error instanceof ApiError && error.status === 403) {
        throw new Error('Bạn không có quyền tạo tin đăng');
      }
      throw error;
    }
  }

  private getFavoriteMap(): Record<string, string[]> {
    return JSON.parse(localStorage.getItem(FAVORITE_KEY) || '{}') as Record<string, string[]>;
  }

  private saveFavoriteMap(map: Record<string, string[]>): void {
    localStorage.setItem(FAVORITE_KEY, JSON.stringify(map));
  }

  createListing(listing: Omit<Listing, 'id' | 'status' | 'moderation'>): Listing {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]') as Listing[];

    const newListing: Listing = {
      ...listing,
      id: String(Date.now()),
      status: LISTING_STATUS.PENDING_MODERATION,
      createdAt: new Date(),
    } as Listing;

    // Run moderation
    const moderation = this.moderationService.runModeration(newListing);
    newListing.moderation = moderation;

    // Auto-decide status
    if (moderation.decision === 'APPROVED') {
      newListing.status = LISTING_STATUS.APPROVED;
      newListing.approvedAt = new Date();
    } else if (moderation.decision === 'REJECTED') {
      newListing.status = LISTING_STATUS.REJECTED;
    }

    // Record payment
    this.paymentService.recordPayment({
      type: PAYMENT_TYPE.POST_LISTING,
      amount: 50000,
      listingId: newListing.id,
      userId: listing.sellerId,
      status: 'PAID',
      date: new Date(),
      description: `Phí đăng tin: ${listing.title}`,
    });

    listings.push(newListing);
    localStorage.setItem('listings', JSON.stringify(listings));
    return newListing;
  }

  approveListing(listingId: string, adminId: string): boolean {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]') as Listing[];
    const listing = listings.find((l) => l.id === listingId);

    if (!listing) return false;

    listing.status = LISTING_STATUS.APPROVED;
    listing.moderation.decision = 'APPROVED';
    listing.moderation.status = MODERATION_STATUS.MANUALLY_APPROVED;
    listing.moderation.reviewedBy = adminId;
    listing.moderation.reviewedAt = new Date();
    listing.approvedAt = new Date();

    localStorage.setItem('listings', JSON.stringify(listings));
    return true;
  }

  rejectListing(listingId: string, adminId: string): boolean {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]') as Listing[];
    const listing = listings.find((l) => l.id === listingId);

    if (!listing) return false;

    listing.status = LISTING_STATUS.REJECTED;
    listing.moderation.decision = 'REJECTED';
    listing.moderation.status = MODERATION_STATUS.MANUALLY_REJECTED;
    listing.moderation.reviewedBy = adminId;
    listing.moderation.reviewedAt = new Date();

    localStorage.setItem('listings', JSON.stringify(listings));
    return true;
  }

  reportListing(
    listingId: string,
    userId: string,
    reason: string,
    note: string
  ): boolean {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]') as Listing[];
    const listing = listings.find((l) => l.id === listingId);

    if (!listing) return false;

    if (!listing.reports) listing.reports = [];
    listing.reports.push({
      userId,
      reason,
      note,
      reportedAt: new Date(),
    });

    localStorage.setItem('listings', JSON.stringify(listings));
    return true;
  }

  requestBrokerTakeover(listingId: string, brokerId: string, sellerName: string): boolean {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]') as Listing[];
    const listing = listings.find((l) => l.id === listingId);

    if (!listing) return false;

    if (!listing.brokerRequests) listing.brokerRequests = [];
    listing.brokerRequests.push({
      brokerId,
      status: 'pending',
      requestedAt: new Date(),
      sellerName,
    });

    localStorage.setItem('listings', JSON.stringify(listings));
    return true;
  }

  acceptBrokerTakeover(listingId: string, brokerId: string): boolean {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]') as Listing[];
    const listing = listings.find((l) => l.id === listingId);

    if (!listing || !listing.brokerRequests) return false;

    const request = listing.brokerRequests.find((r) => r.brokerId === brokerId);
    if (!request) return false;

    request.status = 'accepted';
    request.respondedAt = new Date();
    listing.responsibleBrokerId = brokerId;

    // Record takeover fee
    this.paymentService.recordPayment({
      type: PAYMENT_TYPE.TAKEOVER_FEE,
      amount: 500000,
      listingId,
      brokerId,
      status: 'PAID',
      date: new Date(),
      description: `Phí hỗ trợ bán/cho thuê: ${listing.title}`,
    });

    localStorage.setItem('listings', JSON.stringify(listings));
    return true;
  }

  unassignBroker(listingId: string, brokerId: string): boolean {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]') as Listing[];
    const listing = listings.find((l) => l.id === listingId);

    if (!listing || listing.responsibleBrokerId !== brokerId) return false;

    listing.responsibleBrokerId = undefined;
    localStorage.setItem('listings', JSON.stringify(listings));
    return true;
  }

  updateListing(listing: Listing): boolean {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]') as Listing[];
    const index = listings.findIndex((l) => l.id === listing.id);
    if (index === -1) return false;
    listings[index] = listing;
    localStorage.setItem('listings', JSON.stringify(listings));
    return true;
  }

  getListing(id: string): Listing | null {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]') as Listing[];
    return listings.find((l) => l.id === id) || null;
  }

  getAllListings(): Listing[] {
    return JSON.parse(localStorage.getItem('listings') || '[]');
  }

  getApprovedListings(): Listing[] {
    const listings = this.getAllListings();
    return listings.filter((l) => l.status === LISTING_STATUS.APPROVED || l.status === LISTING_STATUS.ACTIVE);
  }

  getFavoriteIds(userId: string): string[] {
    const map = this.getFavoriteMap();
    return map[String(userId)] || [];
  }

  isFavorite(listingId: string, userId: string): boolean {
    return this.getFavoriteIds(userId).includes(listingId);
  }

  addFavorite(listingId: string, userId: string): boolean {
    const map = this.getFavoriteMap();
    const key = String(userId);
    const list = map[key] || [];
    if (list.includes(listingId)) return true;
    map[key] = [...list, listingId];
    this.saveFavoriteMap(map);
    return true;
  }

  removeFavorite(listingId: string, userId: string): boolean {
    const map = this.getFavoriteMap();
    const key = String(userId);
    const list = map[key] || [];
    map[key] = list.filter((id) => id !== listingId);
    this.saveFavoriteMap(map);
    return true;
  }

  toggleFavorite(listingId: string, userId: string): boolean {
    if (this.isFavorite(listingId, userId)) {
      this.removeFavorite(listingId, userId);
      return false;
    }
    this.addFavorite(listingId, userId);
    return true;
  }

  getFavoriteListings(userId: string): Listing[] {
    const favoriteIds = new Set(this.getFavoriteIds(userId));
    return this.getAllListings().filter((listing) => favoriteIds.has(listing.id));
  }
}

export const listingService = new ListingService();
export const paymentService = new PaymentService();
