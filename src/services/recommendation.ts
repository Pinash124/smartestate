import { Listing, RecommendedListing, RecommendationReason, UserPreferences } from '@/types';

import { listingService } from './listing';

export class AIRecommendationService {
  // Store user preferences (could be saved to backend later)
  async submitPreferences(preferences: UserPreferences): Promise<void> {
    try {
      // TODO: Add backend API endpoint for storing user preferences
      // await apiRequest(`/api/users/me/preferences`, {
      //   method: 'POST',
      //   body: preferences,
      //   auth: true,
      // });
      console.log('Preferences submitted:', preferences);
    } catch (error) {
      console.error('Error submitting preferences:', error);
      throw error;
    }
  }

  // Get recommendations - currently uses search API filtered by user preferences
  async getRecommendations(preferences: UserPreferences, topN: number = 10): Promise<RecommendedListing[]> {
    try {
      // Use search API with filters based on user preferences
      const listings = await listingService.fetchListings();
      
      const scored = listings
        .map((listing) => ({
          listing,
          score: this.scoreListingForUser(listing, preferences),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topN);

      return scored.map((item) => ({
        listing: item.listing,
        score: item.score,
        reasons: this.getScoreReasons(item.listing, preferences),
      }));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  scoreListingForUser(listing: Listing, preferences: UserPreferences): number {
    let score = 0;

    // Location: 30 points max
    if (preferences.cities) {
      if (preferences.cities.includes(listing.city)) {
        score += 30;
      } else if (preferences.cities.some((c) => listing.address.includes(c))) {
        score += 25;
      }
    }

    // Property Type: 20 points
    if (preferences.propertyTypes?.includes(listing.type)) {
      score += 20;
    }

    // Transaction Type: 15 points
    if (preferences.transaction && preferences.transaction === listing.transaction) {
      score += 15;
    }

    // Price: 20 points (with 10% tolerance)
    if (preferences.priceRange) {
      const listingPrice = this.parsePrice(listing.price);
      const range = preferences.priceRange.split('-').map((p) => this.parsePrice(p.trim()));
      if (range.length === 2) {
        const [min, max] = range;
        const tolerance = (max - min) * 0.1;
        if (listingPrice >= min - tolerance && listingPrice <= max + tolerance) {
          score += 20;
        }
      }
    }

    // Area: 10 points
    if (preferences.minArea && listing.area >= preferences.minArea) {
      score += 10;
    }

    // Bedrooms: 5 points
    if (preferences.minBedrooms && listing.bedrooms && listing.bedrooms >= preferences.minBedrooms) {
      score += 5;
    }

    // Quality factors: 10 points
    if (listing.images && listing.images.length >= 3) {
      score += 5;
    }
    if (listing.description && listing.description.length >= 100) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  private parsePrice(priceStr: string): number {
    const str = priceStr.toLowerCase().trim();
    if (str.includes('tỷ')) {
      return parseFloat(str) * 1000000000;
    } else if (str.includes('triệu')) {
      return parseFloat(str) * 1000000;
    }
    return parseFloat(str) || 0;
  }

  private getScoreReasons(listing: Listing, preferences: UserPreferences): RecommendationReason[] {
    const reasons: RecommendationReason[] = [];

    if (preferences.cities?.includes(listing.city)) {
      reasons.push({ icon: '📍', text: `Đúng thành phố ${listing.city}` });
    }

    if (preferences.propertyTypes?.includes(listing.type)) {
      const typeLabel = this.getPropertyTypeLabel(listing.type);
      reasons.push({ icon: '🏠', text: `Loại ${typeLabel} phù hợp` });
    }

    if (preferences.transaction === listing.transaction) {
      const label = listing.transaction === 'buy' ? 'Mua' : 'Cho thuê';
      reasons.push({ icon: '💼', text: `Giao dịch ${label}` });
    }

    if (listing.images && listing.images.length >= 3) {
      reasons.push({ icon: '📸', text: `Có ${listing.images.length} ảnh chất lượng` });
    }

    if (listing.description && listing.description.length >= 100) {
      reasons.push({ icon: '📝', text: 'Mô tả chi tiết' });
    }

    return reasons;
  }

  private getPropertyTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      apartment: 'căn hộ',
      house: 'nhà riêng',
      land: 'đất nền',
      office: 'văn phòng',
    };
    return labels[type] || type;
  }
}

export const recommendationService = new AIRecommendationService();
