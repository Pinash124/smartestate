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

// Payment Service (Deprecated - use backend API)
// export class PaymentService {

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

  // API Methods
  async addFavorite(listingId: string): Promise<boolean> {
    try {
      await apiRequest(`/api/users/me/favorites/${listingId}`, {
        method: 'POST',
        auth: true,
      });
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }

  async removeFavorite(listingId: string): Promise<boolean> {
    try {
      await apiRequest(`/api/users/me/favorites/${listingId}`, {
        method: 'DELETE',
        auth: true,
      });
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }

  async toggleFavorite(listingId: string): Promise<boolean> {
    const oldIsFav = this.isFavorite(listingId);
    if (oldIsFav) {
      return this.removeFavorite(listingId);
    }
    return this.addFavorite(listingId);
  }

  async getFavoriteListings(page: number = 1, pageSize: number = 20): Promise<Listing[]> {
    try {
      const response = await apiRequest<any>(`/api/users/me/favorites?page=${page}&pageSize=${pageSize}`, {
        auth: true,
      });
      const items = response?.items || response || [];
      return Array.isArray(items) ? items.map((item: ApiListingDetail) => this.mapApiListing(item)) : [];
    } catch (error) {
      console.error('Error fetching favorite listings:', error);
      return [];
    }
  }

  // Local cache for favorites (check if favorite)
  private favoriteCache: Set<string> = new Set();

  isFavorite(listingId: string): boolean {
    return this.favoriteCache.has(listingId);
  }

  setFavoriteCache(listingIds: string[]): void {
    this.favoriteCache = new Set(listingIds);
  }
}

export const listingService = new ListingService();
export const paymentService = new PaymentService();
