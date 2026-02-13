// User types
export type UserRole = 'guest' | 'user' | 'seller' | 'broker' | 'admin';

export interface UserProfile {
  avatar: string;
  phone?: string;
  address?: string;
}

export interface User {
  id: string;
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
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface BrokerRequest {
  brokerId: string;
  brokerName?: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
  sellerName: string;
}

export interface ListingReport {
  userId: string;
  reason: string;
  note: string;
  reportedAt: Date;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  responsibleId?: string;
  isBrokerManaged?: boolean;
  takeoverFeeStatus?: 'unpaid' | 'paid';
  responsibleBrokerId?: string;
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
  updatedAt?: Date;
  approvedAt?: Date;
  completedAt?: Date;
}

// Payment types
export type PaymentType = 'post_listing' | 'push_listing' | 'broker_fee' | 'takeover_fee';

export interface Payment {
  id: number;
  type: PaymentType;
  amount: number;
  listingId: string;
  userId?: string;
  brokerId?: string;
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
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
  readAt?: Date;
}

export interface Conversation {
  id: string | number;
  participants: string[];
  listingId: string;
  lastMessage?: ChatMessage;
  lastMessageAt?: Date;
  createdAt: Date;
}

export type ApiUserRole = 'Admin' | 'Seller' | 'Broker' | 'User';

export interface ApiAuthLoginResponse {
  userId: string;
  email: string;
  role: ApiUserRole;
  token: string;
}

export interface ApiAuthRegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface ApiAddress {
  city: string;
  district: string;
  street: string;
}

export interface ApiListingImage {
  url: string;
  caption?: string;
}

export interface ApiListingDetail {
  id: string;
  title: string;
  description?: string;
  priceAmount: number;
  priceCurrency: string;
  maskedPhone?: string;
  images?: ApiListingImage[];
  responsibleUserId?: string;
  sellerName?: string;
}

export interface ApiListingContactResponse {
  phone: string;
}

export interface ApiCreateListingRequest {
  title: string;
  description: string;
  propertyType: number;
  priceAmount: number;
  priceCurrency: string;
  areaM2: number;
  address: ApiAddress;
}
