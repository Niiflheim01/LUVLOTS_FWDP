export type UserRole = 'buyer' | 'seller' | 'admin' | 'moderator';

export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type ListingStatus = 'draft' | 'pending_review' | 'live' | 'sold' | 'archived' | 'rejected';
export type ListingType = 'instant_buy' | 'auction' | 'charity_auction';
export type ListingCondition = 'new' | 'like_new' | 'excellent' | 'good' | 'fair';

export type ListingImage = {
  id: string;
  listing_id: string;
  owner_id: string;
  storage_bucket: string;
  storage_path: string;
  public_url: string | null;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  designer_id: string | null;
  sustainable_brand_id: string | null;
  condition: ListingCondition | null;
  price: number;
  currency: string;
  listing_type: ListingType;
  status: ListingStatus;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  sold_at: string | null;
  moderation_notes: string | null;
  rejected_reason: string | null;
};

export type PaymentProvider = 'g8_pay';
export type PaymentStatus = 'created' | 'pending' | 'requires_action' | 'paid' | 'failed' | 'cancelled' | 'expired' | 'refunded';

export type PaymentAttempt = {
  id: string;
  order_id: string | null;
  buyer_id: string;
  seller_id: string | null;
  listing_id: string | null;
  provider: PaymentProvider;
  provider_transaction_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  checkout_url: string | null;
  provider_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};
