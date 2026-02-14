import {
  ApiCreateListingRequest,
  ApiListingContactResponse,
  ApiListingDetail,
  Listing,
  ListingStatus,
  ModerationStatus,
  ModerationResult,
  PaymentType,
  PropertyType,
  TransactionType,
} from '@/types';
import { API_BASE_URL, apiRequest, ApiError } from './api';
import { authService } from './auth';
import { MOCK_LISTINGS } from './mockData';

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

const PROPERTY_TYPE_MAP: Record<number, PropertyType> = {
  0: 'office',
  1: 'apartment',
  2: 'house',
  3: 'land',
};

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
    // Priority: 
    // 1. Explicit sellerName from API
    // 2. Current user's name if ID matches (optimistic update for own listings)
    // 3. Fallback to "User ID"
    let name = listing.sellerName;

    if (!name) {
      const currentUser = authService.getCurrentUser();
      if (currentUser && listing.responsibleUserId === currentUser.id) {
        name = currentUser.name;
      }
    }

    if (!name) {
      name = listing.responsibleUserId ? `User ${listing.responsibleUserId.slice(0, 6)}` : 'Người đăng';
    }

    // Map backend status to frontend ListingStatus
    let frontendStatus: ListingStatus = LISTING_STATUS.ACTIVE;
    if (listing.status) {
      const statusLower = listing.status.toLowerCase();
      if (statusLower.includes('pending') || statusLower.includes('review')) {
        frontendStatus = LISTING_STATUS.PENDING_MODERATION;
      } else if (statusLower.includes('reject')) {
        frontendStatus = LISTING_STATUS.REJECTED;
      } else if (statusLower.includes('draft')) {
        frontendStatus = LISTING_STATUS.DRAFT;
      } else if (statusLower.includes('done') || statusLower.includes('complete')) {
        frontendStatus = LISTING_STATUS.DONE;
      } else if (statusLower.includes('cancel')) {
        frontendStatus = LISTING_STATUS.CANCELLED;
      } else {
        frontendStatus = LISTING_STATUS.ACTIVE;
      }
    }

    // Determine moderation decision based on backend status
    let decision: 'APPROVED' | 'REJECTED' | 'NEED_REVIEW' = 'APPROVED';
    let moderationStatus: ModerationStatus = MODERATION_STATUS.AUTO_APPROVED;
    if (frontendStatus === LISTING_STATUS.REJECTED) {
      decision = 'REJECTED';
      moderationStatus = MODERATION_STATUS.MANUALLY_REJECTED;
    } else if (frontendStatus === LISTING_STATUS.PENDING_MODERATION) {
      decision = 'NEED_REVIEW';
      moderationStatus = MODERATION_STATUS.PENDING;
    }

    return {
      id: listing.id,
      sellerId: listing.responsibleUserId || '',
      sellerName: name,
      sellerPhone: listing.maskedPhone || '',
      responsibleBrokerId: listing.responsibleUserId,
      title: listing.title,
      type: PROPERTY_TYPE_MAP[listing.propertyType ?? 1] || 'apartment',
      transaction: (listing.transactionType as TransactionType) || 'buy',
      price: this.formatPrice(listing.priceAmount, listing.priceCurrency || 'VND'),
      area: listing.areaM2 ?? 0,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      city: listing.address?.city || '',
      district: listing.address?.district || '',
      address: listing.address?.street || '',
      description: listing.description || '',
      images: (listing.images || []).map((img) => this.resolveImageUrl(img.url)),
      status: frontendStatus,
      moderation: {
        status: moderationStatus,
        decision,
        riskScore: 0,
        flags: [],
        suggestions: [],
        reviewedAt: new Date(),
      },
      createdAt: listing.createdAt ? new Date(listing.createdAt) : new Date(),
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
      // Return mock data when API is unavailable
      return MOCK_LISTINGS.find((listing) => listing.id === id) || null;
    }
  }

  async fetchListings(): Promise<Listing[]> {
    try {
      const data = await apiRequest<ApiListingDetail[]>(`/api/search/listings`);
      return Array.isArray(data) ? data.map((item) => this.mapApiListing(item)) : [];
    } catch (error) {
      console.error('Error fetching listings:', error);
      // Return mock data when API is unavailable
      return MOCK_LISTINGS;
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

  getFavoriteIds(): string[] {
    // Return favorite IDs from cache (in production, this would be fetched from a user preferences endpoint)
    return Array.from(this.favoriteCache);
  }

  async reportListing(listingId: string, reason: string, note: string): Promise<void> {
    try {
      await apiRequest(`/api/listings/${listingId}/report`, {
        method: 'POST',
        body: { reason, note },
        auth: true,
      });
    } catch (error) {
      console.error('Error reporting listing:', error);
      throw error;
    }
  }

  // Admin Methods
  async getAllListings(): Promise<Listing[]> {
    try {
      const data = await apiRequest<ApiListingDetail[]>(`/api/listings`, {
        auth: true,
      });
      return Array.isArray(data) ? data.map((item) => this.mapApiListing(item)) : [];
    } catch (error) {
      console.error('Error fetching all listings:', error);
      return [];
    }
  }

  async approveListing(listingId: string, adminId: string): Promise<boolean> {
    try {
      await apiRequest(`/api/listings/${listingId}/approve`, {
        method: 'PATCH',
        body: { adminId },
        auth: true,
      });
      return true;
    } catch (error) {
      console.error('Error approving listing:', error);
      return false;
    }
  }

  async rejectListing(listingId: string, adminId: string, reason?: string): Promise<boolean> {
    try {
      await apiRequest(`/api/listings/${listingId}/reject`, {
        method: 'PATCH',
        body: { adminId, reason },
        auth: true,
      });
      return true;
    } catch (error) {
      console.error('Error rejecting listing:', error);
      return false;
    }
  }

  async updateListing(listing: Partial<Listing>): Promise<Listing | null> {
    try {
      if (!listing.id) throw new Error('Listing ID is required');
      const data = await apiRequest<ApiListingDetail>(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        body: listing,
        auth: true,
      });
      return this.mapApiListing(data);
    } catch (error) {
      console.error('Error updating listing:', error);
      return null;
    }
  }

  // Deprecated: Use fetchListing instead
  async getListing(id: string): Promise<Listing | null> {
    return this.fetchListing(id);
  }
}

export const listingService = new ListingService();

