import { supabase } from '@/lib/supabase';

export async function getMyLuvlistItems() {
  const { data, error } = await supabase
    .from('luvlist_items')
    .select('id, listing_id, created_at, listings(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addToLuvlist(listingId: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('Please sign in to add items to your Luvlist.');

  const { error } = await supabase.from('luvlist_items').upsert(
    {
      user_id: userData.user.id,
      listing_id: listingId,
    },
    { onConflict: 'user_id,listing_id' },
  );

  if (error) throw error;
}

export async function removeFromLuvlist(listingId: string) {
  const { error } = await supabase
    .from('luvlist_items')
    .delete()
    .eq('listing_id', listingId);

  if (error) throw error;
}
