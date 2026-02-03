// User types
export type UserRole = 'guest' | 'user' | 'seller' | 'broker' | 'admin';

export interface UserProfile {
  avatar: string;
  phone?: string;
  address?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

// Listing types
export type ListingStatus = 
  | 'draft' 
  | 'pending_moderation' 
  | 'approved' 
  | 'active' 
  | 'done' 
  | 'cancelled' 
  | 'rejected';

export type ModerationStatus = 
  | 'pending' 
  | 'need_review' 
  | 'auto_approved' 
  | 'auto_rejected' 
  | 'manually_approved' 
  | 'manually_rejected';

export type PropertyType = 'apartment' | 'house' | 'land' | 'office';
export type TransactionType = 'buy' | 'rent';

export interface ModerationResult {
  status: ModerationStatus;
  decision: 'APPROVED' | 'REJECTED' | 'NEED_REVIEW';
  riskScore: number;
  flags: string[];
  suggestions: string[];
  reviewedBy?: number;
  reviewedAt?: Date;
}

export interface BrokerRequest {
  brokerId: number;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
  sellerName: string;
}

export interface ListingReport {
  userId: number;
  reason: string;
  note: string;
  reportedAt: Date;
}

export interface Listing {
  id: number;
  sellerId: number;
  sellerName: string;
  sellerPhone: string;
  responsibleBrokerId?: number;
  title: string;
  type: PropertyType;
  transaction: TransactionType;
  price: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  city: string;
  district: string;
  address: string;
  description: string;
  images: string[];
  status: ListingStatus;
  moderation: ModerationResult;
  brokerRequests?: BrokerRequest[];
  reports?: ListingReport[];
  createdAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
}

// Payment types
export type PaymentType = 'post_listing' | 'push_listing' | 'broker_fee' | 'takeover_fee';

export interface Payment {
  id: number;
  type: PaymentType;
  amount: number;
  listingId: number;
  userId?: number;
  brokerId?: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
  date: Date;
  description: string;
}

// Recommendation types
export interface UserPreferences {
  transaction?: TransactionType;
  propertyTypes?: PropertyType[];
  cities?: string[];
  priceRange?: string;
  minArea?: number;
  minBedrooms?: number;
}

export interface RecommendationReason {
  icon: string;
  text: string;
}

export interface RecommendedListing {
  listing: Listing;
  score: number;
  reasons: RecommendationReason[];
}
// Chat types
export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: Date;
  readAt?: Date;
}

export interface Conversation {
  id: number;
  participants: number[];
  listingId: number;
  lastMessage?: ChatMessage;
  lastMessageAt?: Date;
  createdAt: Date;
}