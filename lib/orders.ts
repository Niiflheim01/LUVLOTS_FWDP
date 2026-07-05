import { supabase } from '@/lib/supabase';

export async function createOrderFromListings(listingIds: string[]) {
  if (listingIds.length === 0) {
    throw new Error('Select at least one item to check out.');
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to check out.');

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ buyer_id: userData.user.id, status: 'pending' })
    .select('*')
    .single();
  if (orderError) throw orderError;

  // order_items.unit_price/currency/seller_id are snapshotted server-side
  // from the live listing by a trigger -- this insert cannot smuggle a
  // tampered price through.
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .insert(listingIds.map((listingId) => ({ order_id: order.id, listing_id: listingId })))
    .select('*');

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id);
    throw itemsError;
  }

  const total = items.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0);

  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({ subtotal: total, total })
    .eq('id', order.id)
    .select('*')
    .single();

  if (updateError) throw updateError;

  return { order: updatedOrder, items };
}

export async function getMySalesOrderItems() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in.');

  const { data: items, error } = await supabase
    .from('order_items')
    .select('*, orders(id, status, created_at, buyer_id), listings(title, cover_image_url)')
    .eq('seller_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!items || items.length === 0) return [];

  const buyerIds = [...new Set(items.map((item) => item.orders?.buyer_id).filter(Boolean))] as string[];
  const { data: buyers } = await supabase
    .from('public_profiles')
    .select('id, username, full_name, avatar_url')
    .in('id', buyerIds);

  const buyerById = new Map((buyers ?? []).map((b) => [b.id, b]));

  return items.map((item) => ({
    ...item,
    buyer: item.orders?.buyer_id ? buyerById.get(item.orders.buyer_id) ?? null : null,
  }));
}

export async function getMyOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, listings(title, cover_image_url))')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
