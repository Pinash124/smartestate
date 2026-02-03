/**
 * AI Moderation & Listing Management System
 * Handles AI moderation, listing lifecycle, payments, and broker workflow
 */

// Listing Status Constants
const LISTING_STATUS = {
  DRAFT: 'draft',
  PENDING_MODERATION: 'pending_moderation',
  APPROVED: 'approved',
  ACTIVE: 'active',
  DONE: 'done',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

const MODERATION_STATUS = {
  PENDING: 'pending',
  NEED_REVIEW: 'need_review',
  AUTO_APPROVED: 'auto_approved',
  AUTO_REJECTED: 'auto_rejected',
  MANUALLY_APPROVED: 'manually_approved',
  MANUALLY_REJECTED: 'manually_rejected'
};

const PAYMENT_TYPE = {
  POST_LISTING: 'post_listing',
  PUSH_LISTING: 'push_listing',
  BROKER_MEMBERSHIP: 'broker_membership',
  TAKEOVER_FEE: 'takeover_fee'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// AI Moderation Service
class AIModerationService {
  // Run AI moderation on listing
  static runModeration(listing) {
    const flags = [];
    const scores = {};
    let riskScore = 0;

    // Check title quality
    if (!listing.title || listing.title.length < 10) {
      flags.push({ type: 'title_too_short', severity: 'low' });
      riskScore += 2;
    }
    if (listing.title && listing.title.length > 100) {
      flags.push({ type: 'title_too_long', severity: 'low' });
      riskScore += 1;
    }

    // Check description quality
    if (!listing.description || listing.description.length < 50) {
      flags.push({ type: 'description_too_short', severity: 'medium' });
      riskScore += 5;
    }
    if (listing.description && this.containsForbiddenWords(listing.description)) {
      flags.push({ type: 'forbidden_content', severity: 'high' });
      riskScore += 15;
    }

    // Check images
    if (!listing.images || listing.images.length === 0) {
      flags.push({ type: 'no_images', severity: 'medium' });
      riskScore += 8;
    }
    if (listing.images && listing.images.length > 30) {
      flags.push({ type: 'too_many_images', severity: 'low' });
      riskScore += 2;
    }

    // Check price validity
    if (!listing.price || listing.price === '') {
      flags.push({ type: 'missing_price', severity: 'high' });
      riskScore += 10;
    }

    // Check location
    if (!listing.address || listing.address.length < 5) {
      flags.push({ type: 'incomplete_location', severity: 'medium' });
      riskScore += 5;
    }

    // Check for duplicate listing
    if (this.isDuplicateListing(listing)) {
      flags.push({ type: 'potential_duplicate', severity: 'high' });
      riskScore += 12;
    }

    // Generate suggestions
    const suggestions = this.generateSuggestions(flags, listing);

    // Determine decision
    let decision = MODERATION_STATUS.AUTO_APPROVED;
    if (riskScore >= 20) {
      decision = MODERATION_STATUS.NEED_REVIEW;
    } else if (riskScore >= 30) {
      decision = MODERATION_STATUS.AUTO_REJECTED;
    }

    return {
      decision,
      riskScore,
      flags,
      suggestions,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'system'
    };
  }

  static containsForbiddenWords(text) {
    const forbiddenWords = ['spam', 'scam', 'fraud', 'illegal', 'drugs'];
    return forbiddenWords.some(word => text.toLowerCase().includes(word));
  }

  static isDuplicateListing(listing) {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    return listings.some(l => 
      l.id !== listing.id && 
      l.sellerId === listing.sellerId && 
      l.title === listing.title && 
      l.address === listing.address
    );
  }

  static generateSuggestions(flags, listing) {
    const suggestions = [];

    if (flags.some(f => f.type === 'title_too_short')) {
      suggestions.push('Tiêu đề quá ngắn. Hãy cung cấp thêm chi tiết.');
    }
    if (flags.some(f => f.type === 'description_too_short')) {
      suggestions.push('Mô tả quá ngắn. Hãy cung cấp mô tả chi tiết hơn (tối thiểu 50 ký tự).');
    }
    if (flags.some(f => f.type === 'no_images')) {
      suggestions.push('Không có ảnh. Hãy thêm ít nhất 1 ảnh để tăng tỉ lệ view.');
    }
    if (flags.some(f => f.type === 'missing_price')) {
      suggestions.push('Giá chưa được cung cấp.');
    }

    return suggestions;
  }
}

// Payment Service
class PaymentService {
  static recordPayment(payment) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const newPayment = {
      id: Date.now(),
      ...payment,
      createdAt: new Date().toISOString(),
      status: payment.status || PAYMENT_STATUS.PENDING
    };

    payments.push(newPayment);
    localStorage.setItem('payments', JSON.stringify(payments));
    return newPayment;
  }

  static getPaymentsByUser(userId) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    return payments.filter(p => p.userId === userId);
  }

  static getRevenueByDateRange(startDate, endDate) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const start = new Date(startDate);
    const end = new Date(endDate);

    return payments
      .filter(p => {
        const date = new Date(p.createdAt);
        return date >= start && date <= end && p.status === PAYMENT_STATUS.COMPLETED;
      })
      .reduce((acc, p) => {
        const type = p.type;
        if (!acc[type]) acc[type] = { count: 0, total: 0 };
        acc[type].count++;
        acc[type].total += p.amount;
        return acc;
      }, {});
  }
}

// Listing Service
class ListingService {
  static createListing(listing) {
    // Run AI moderation
    const moderation = AIModerationService.runModeration(listing);

    const newListing = {
      id: Date.now(),
      ...listing,
      status: LISTING_STATUS.PENDING_MODERATION,
      moderation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      favorites: 0,
      responsibleBrokerId: null,
      brokerTakeoverStatus: null,
      reports: [],
      payments: []
    };

    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    listings.push(newListing);
    localStorage.setItem('listings', JSON.stringify(listings));

    // Record payment for posting listing
    if (listing.sellerId) {
      PaymentService.recordPayment({
        userId: listing.sellerId,
        type: PAYMENT_TYPE.POST_LISTING,
        amount: 0,
        listingId: newListing.id,
        status: PAYMENT_STATUS.COMPLETED
      });
    }

    return newListing;
  }

  static updateListing(listingId, updates) {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listing = listings.find(l => l.id === listingId);

    if (!listing) return null;

    const updated = { ...listing, ...updates, updatedAt: new Date().toISOString() };

    // Run moderation again if content changed
    if (updates.title || updates.description || updates.images) {
      updated.moderation = AIModerationService.runModeration(updated);
      updated.status = LISTING_STATUS.PENDING_MODERATION;
    }

    const index = listings.findIndex(l => l.id === listingId);
    listings[index] = updated;
    localStorage.setItem('listings', JSON.stringify(listings));

    return updated;
  }

  static updateListingStatus(listingId, status) {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listing = listings.find(l => l.id === listingId);

    if (!listing) return null;

    listing.status = status;
    listing.updatedAt = new Date().toISOString();

    const index = listings.findIndex(l => l.id === listingId);
    listings[index] = listing;
    localStorage.setItem('listings', JSON.stringify(listings));

    return listing;
  }

  static approveListing(listingId, decidedBy) {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listing = listings.find(l => l.id === listingId);

    if (!listing) return null;

    listing.status = LISTING_STATUS.APPROVED;
    listing.moderation.decision = MODERATION_STATUS.MANUALLY_APPROVED;
    listing.moderation.reviewedBy = decidedBy;
    listing.moderation.reviewedAt = new Date().toISOString();
    listing.updatedAt = new Date().toISOString();

    const index = listings.findIndex(l => l.id === listingId);
    listings[index] = listing;
    localStorage.setItem('listings', JSON.stringify(listings));

    return listing;
  }

  static rejectListing(listingId, reason, decidedBy) {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listing = listings.find(l => l.id === listingId);

    if (!listing) return null;

    listing.status = LISTING_STATUS.REJECTED;
    listing.moderation.decision = MODERATION_STATUS.MANUALLY_REJECTED;
    listing.moderation.rejectionReason = reason;
    listing.moderation.reviewedBy = decidedBy;
    listing.moderation.reviewedAt = new Date().toISOString();
    listing.updatedAt = new Date().toISOString();

    const index = listings.findIndex(l => l.id === listingId);
    listings[index] = listing;
    localStorage.setItem('listings', JSON.stringify(listings));

    return listing;
  }

  static getListingsByStatus(status) {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    return listings.filter(l => l.status === status);
  }

  static getApprovedAndActiveListing() {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    return listings.filter(l => (l.status === LISTING_STATUS.APPROVED || l.status === LISTING_STATUS.ACTIVE) && l.moderation.decision !== MODERATION_STATUS.AUTO_REJECTED);
  }

  static reportListing(listingId, userId, reason, note) {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listing = listings.find(l => l.id === listingId);

    if (!listing) return null;

    const report = {
      id: Date.now(),
      userId,
      reason,
      note,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    listing.reports.push(report);
    listing.updatedAt = new Date().toISOString();

    const index = listings.findIndex(l => l.id === listingId);
    listings[index] = listing;
    localStorage.setItem('listings', JSON.stringify(listings));

    return report;
  }

  static requestBrokerTakeover(listingId, brokerId) {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listing = listings.find(l => l.id === listingId);

    if (!listing) return null;

    listing.brokerTakeoverStatus = {
      brokerId,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    const index = listings.findIndex(l => l.id === listingId);
    listings[index] = listing;
    localStorage.setItem('listings', JSON.stringify(listings));

    return listing;
  }

  static acceptBrokerTakeover(listingId, brokerId) {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listing = listings.find(l => l.id === listingId);

    if (!listing || listing.brokerTakeoverStatus?.brokerId !== brokerId) return null;

    listing.responsibleBrokerId = brokerId;
    listing.brokerTakeoverStatus.status = 'accepted';
    listing.brokerTakeoverStatus.acceptedAt = new Date().toISOString();
    listing.updatedAt = new Date().toISOString();

    // Record takeover fee payment
    PaymentService.recordPayment({
      userId: brokerId,
      type: PAYMENT_TYPE.TAKEOVER_FEE,
      amount: 100000, // Default fee 100k
      listingId,
      status: PAYMENT_STATUS.PENDING
    });

    const index = listings.findIndex(l => l.id === listingId);
    listings[index] = listing;
    localStorage.setItem('listings', JSON.stringify(listings));

    return listing;
  }

  static rejectBrokerTakeover(listingId, brokerId) {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listing = listings.find(l => l.id === listingId);

    if (!listing || listing.brokerTakeoverStatus?.brokerId !== brokerId) return null;

    listing.brokerTakeoverStatus.status = 'rejected';
    listing.brokerTakeoverStatus.rejectedAt = new Date().toISOString();
    listing.updatedAt = new Date().toISOString();

    const index = listings.findIndex(l => l.id === listingId);
    listings[index] = listing;
    localStorage.setItem('listings', JSON.stringify(listings));

    return listing;
  }

  static unassignBroker(listingId) {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listing = listings.find(l => l.id === listingId);

    if (!listing) return null;

    listing.responsibleBrokerId = null;
    listing.brokerTakeoverStatus = null;
    listing.updatedAt = new Date().toISOString();

    const index = listings.findIndex(l => l.id === listingId);
    listings[index] = listing;
    localStorage.setItem('listings', JSON.stringify(listings));

    return listing;
  }
}
