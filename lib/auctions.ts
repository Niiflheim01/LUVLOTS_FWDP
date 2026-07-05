import { supabase } from '@/lib/supabase';
import type { Bid, Listing, ListingCondition } from '@/types/marketplace';
import type { LiveListing } from '@/lib/listings';

export type CreateAuctionInput = {
  title: string;
  description: string;
  categoryId?: string | null;
  condition?: ListingCondition;
  startingPrice: number;
  minIncrement: number;
  reservePrice?: number | null;
  durationHours: number;
  charity?: boolean;
};

export async function createAuctionDraft(input: CreateAuctionInput) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to create an auction.');

  const auctionEndsAt = new Date(Date.now() + input.durationHours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: userData.user.id,
      title: input.title.trim(),
      description: input.description.trim() || null,
      category_id: input.categoryId ?? null,
      condition: input.condition ?? 'excellent',
      price: input.startingPrice,
      currency: 'PHP',
      listing_type: input.charity ? 'charity_auction' : 'auction',
      status: 'draft',
      auction_ends_at: auctionEndsAt,
      auction_min_increment: input.minIncrement,
      auction_reserve_price: input.reservePrice ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Listing;
}

/**
 * There's no scheduled job runner in this project, so expired auctions are
 * closed lazily the first time anyone loads the feed/detail screen -- see
 * close_expired_auctions() in 20260705000021_auctions.sql. Best-effort: a
 * failure here shouldn't block browsing.
 */
async function closeExpiredAuctions() {
  try {
    await supabase.rpc('close_expired_auctions');
  } catch {
    // best-effort housekeeping, ignore failures
  }
}

export async function getLiveAuctions(options?: { limit?: number }) {
  await closeExpiredAuctions();

  const { data: listings, error } = await supabase
    .from('listings')
    .select('*, categories(name)')
    .eq('status', 'live')
    .in('listing_type', ['auction', 'charity_auction'])
    .order('auction_ends_at', { ascending: true })
    .limit(options?.limit ?? 30);

  if (error) throw error;
  if (!listings || listings.length === 0) return [] as LiveListing[];

  const sellerIds = [...new Set(listings.map((l) => l.seller_id))];
  const { data: sellers } = await supabase
    .from('public_profiles')
    .select('id, username, full_name, avatar_url')
    .in('id', sellerIds);

  const sellerById = new Map((sellers ?? []).map((s) => [s.id, s]));

  return listings.map((listing) => ({
    ...listing,
    seller: sellerById.get(listing.seller_id) ?? null,
  })) as LiveListing[];
}

export async function getAuctionById(id: string) {
  await closeExpiredAuctions();

  const { data, error } = await supabase
    .from('listings')
    .select('*, categories(name)')
    .eq('id', id)
    .single();

  if (error) throw error;

  const { data: seller } = await supabase
    .from('public_profiles')
    .select('id, username, full_name, avatar_url')
    .eq('id', data.seller_id)
    .maybeSingle();

  const { data: images } = await supabase
    .from('listing_images')
    .select('*')
    .eq('listing_id', id)
    .order('sort_order');

  const { data: bids } = await supabase
    .from('bids')
    .select('*')
    .eq('listing_id', id)
    .order('amount', { ascending: false })
    .limit(20);

  const bidderIds = [...new Set((bids ?? []).map((b) => b.bidder_id))];
  const { data: bidders } = bidderIds.length
    ? await supabase.from('public_profiles').select('id, username, full_name, avatar_url').in('id', bidderIds)
    : { data: [] as { id: string; username: string | null; full_name: string | null; avatar_url: string | null }[] };

  const bidderById = new Map((bidders ?? []).map((b) => [b.id, b]));

  return {
    ...data,
    seller,
    images: images ?? [],
    bids: ((bids ?? []) as Bid[]).map((bid) => ({ ...bid, bidder: bidderById.get(bid.bidder_id) ?? null })),
  };
}

export async function placeBid(listingId: string, amount: number) {
  const { data, error } = await supabase.rpc('place_bid', {
    p_listing_id: listingId,
    p_amount: amount,
  });

  if (error) throw error;
  return data as Bid;
}

export async function getMyWonAuctions() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to view your winnings.');

  const { data: myBids, error: bidsError } = await supabase
    .from('bids')
    .select('id, listing_id')
    .eq('bidder_id', userData.user.id);

  if (bidsError) throw bidsError;
  const myBidIds = new Set((myBids ?? []).map((b) => b.id));
  const listingIds = [...new Set((myBids ?? []).map((b) => b.listing_id))];
  if (listingIds.length === 0) return [] as LiveListing[];

  const { data: listings, error } = await supabase
    .from('listings')
    .select('*, categories(name)')
    .in('id', listingIds)
    .eq('status', 'sold')
    .in('listing_type', ['auction', 'charity_auction']);

  if (error) throw error;
  if (!listings) return [] as LiveListing[];

  // current_bid_id is the single winning bid -- only keep listings where
  // that specific bid was placed by this user (not just any bid on it).
  const won = listings.filter((l) => l.current_bid_id && myBidIds.has(l.current_bid_id));
  if (won.length === 0) return [] as LiveListing[];

  const sellerIds = [...new Set(won.map((l) => l.seller_id))];
  const { data: sellers } = await supabase
    .from('public_profiles')
    .select('id, username, full_name, avatar_url')
    .in('id', sellerIds);
  const sellerById = new Map((sellers ?? []).map((s) => [s.id, s]));

  return won.map((listing) => ({ ...listing, seller: sellerById.get(listing.seller_id) ?? null })) as LiveListing[];
}
