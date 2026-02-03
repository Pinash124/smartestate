/**
 * AI Recommendation Engine
 * Scores listings based on user preferences
 */

class AIRecommendationService {
  static submitPreferences(userId, preferences) {
    const prefs = {
      id: Date.now(),
      userId,
      ...preferences,
      createdAt: new Date().toISOString()
    };

    const allPrefs = JSON.parse(localStorage.getItem('user_preferences') || '[]');
    allPrefs.push(prefs);
    localStorage.setItem('user_preferences', JSON.stringify(allPrefs));

    return prefs;
  }

  static getRecommendations(userId, topN = 10) {
    // Get user preferences
    const allPrefs = JSON.parse(localStorage.getItem('user_preferences') || '[]');
    const userPref = allPrefs.find(p => p.userId === userId);

    if (!userPref) {
      return { recommendations: [], message: 'Vui lòng điền thông tin sở thích để nhận gợi ý' };
    }

    // Get approved and active listings
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const activeListings = listings.filter(l => 
      (l.status === LISTING_STATUS.APPROVED || l.status === LISTING_STATUS.ACTIVE) &&
      l.moderation.decision !== MODERATION_STATUS.AUTO_REJECTED
    );

    // Score each listing
    const scored = activeListings.map(listing => {
      const score = this.scoreListingForUser(listing, userPref);
      return { listing, score, reasons: this.getScoreReasons(listing, userPref, score) };
    });

    // Sort by score and return top N
    return {
      recommendations: scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topN),
      totalMatches: scored.filter(s => s.score > 0).length
    };
  }

  static scoreListingForUser(listing, userPref) {
    let score = 0;

    // Location matching (30 points)
    if (userPref.preferredCities && userPref.preferredCities.includes(listing.city)) {
      score += 30;
    } else if (userPref.preferredDistricts && userPref.preferredDistricts.includes(listing.district)) {
      score += 25;
    }

    // Property type matching (20 points)
    if (userPref.propertyTypes && userPref.propertyTypes.includes(listing.type)) {
      score += 20;
    }

    // Transaction type matching (15 points)
    if (userPref.transactionType === listing.transactionType) {
      score += 15;
    }

    // Price matching (20 points)
    const userBudget = this.parsePriceRange(userPref.priceRange);
    const listingPrice = this.parsePriceRange(listing.price);
    if (listingPrice >= userBudget.min && listingPrice <= userBudget.max) {
      score += 20;
    } else if (Math.abs(listingPrice - userBudget.max) < userBudget.max * 0.1) {
      score += 10; // 10% tolerance
    }

    // Area matching (10 points)
    if (userPref.minArea && listing.area >= userPref.minArea) {
      score += 10;
    }

    // Bedrooms matching (5 points)
    if (userPref.minBedrooms && listing.bedrooms >= userPref.minBedrooms) {
      score += 5;
    }

    // Quality factors (10 points)
    if (listing.images && listing.images.length >= 3) {
      score += 5;
    }
    if (listing.description && listing.description.length > 100) {
      score += 5;
    }

    return score;
  }

  static parsePriceRange(priceStr) {
    if (!priceStr) return { min: 0, max: Infinity };
    
    // Simple parser for price ranges like "3-5 tỷ" or "10-20 triệu"
    const isInTy = priceStr.includes('tỷ');
    const regex = /(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)/;
    const match = priceStr.match(regex);

    if (match) {
      let min = parseFloat(match[1].replace(',', '.'));
      let max = parseFloat(match[2].replace(',', '.'));

      if (isInTy) {
        min *= 1000000000;
        max *= 1000000000;
      } else {
        min *= 1000000;
        max *= 1000000;
      }

      return { min, max };
    }

    return { min: 0, max: Infinity };
  }

  static getScoreReasons(listing, userPref, score) {
    const reasons = [];

    if (userPref.preferredCities && userPref.preferredCities.includes(listing.city)) {
      reasons.push('📍 Địa điểm phù hợp');
    }

    if (userPref.propertyTypes && userPref.propertyTypes.includes(listing.type)) {
      reasons.push('🏠 Loại bất động sản phù hợp');
    }

    if (userPref.transactionType === listing.transactionType) {
      reasons.push('📋 Loại giao dịch phù hợp');
    }

    if (listing.images && listing.images.length >= 3) {
      reasons.push('📸 Có nhiều ảnh');
    }

    if (listing.description && listing.description.length > 100) {
      reasons.push('📝 Mô tả chi tiết');
    }

    return reasons;
  }
}
