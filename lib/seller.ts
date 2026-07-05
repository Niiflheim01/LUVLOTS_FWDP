import { supabase } from '@/lib/supabase';

export type RegisterAsSellerInput = {
  shopName: string;
  shopEmail: string;
  shopPhone: string;
  businessType: 'individual' | 'business';
  idDocumentUrl?: string | null;
  pickupAddress?: Record<string, unknown> | null;
};

export async function registerAsSeller(input: RegisterAsSellerInput) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to become a seller.');

  // Flips profiles.role to 'seller' via a SECURITY DEFINER RPC (buyer ->
  // seller only, never self-elevatable to admin -- see
  // supabase/migrations/20260705000011_profiles_role_guard.sql).
  const { error: roleError } = await supabase.rpc('become_seller');
  if (roleError) throw roleError;

  // Real ID/KYC review isn't built yet -- the row starts at
  // verification_status='early_access' by default (see
  // 20260705000020_seller_verification.sql) so early sellers can list and
  // sell right away. The optional ID photo is stored for whenever manual
  // review ships.
  const { data, error } = await supabase
    .from('seller_profiles')
    .upsert(
      {
        id: userData.user.id,
        shop_name: input.shopName.trim(),
        shop_email: input.shopEmail.trim() || null,
        shop_phone: input.shopPhone.trim() || null,
        business_type: input.businessType,
        id_document_url: input.idDocumentUrl ?? null,
        pickup_address: input.pickupAddress ?? null,
      },
      { onConflict: 'id' },
    )
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
