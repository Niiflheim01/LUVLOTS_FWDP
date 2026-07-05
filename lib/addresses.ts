import { supabase } from '@/lib/supabase';
import type { Address, AddressLabel } from '@/types/marketplace';

export type AddressInput = {
  fullName: string;
  phone: string;
  region?: string | null;
  city?: string | null;
  postalCode?: string | null;
  street: string;
  label?: AddressLabel;
  isDefault?: boolean;
  isPickup?: boolean;
};

export async function getMyAddresses() {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Address[];
}

export async function getAddressById(id: string) {
  const { data, error } = await supabase.from('addresses').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Address;
}

export async function getDefaultPickupAddress() {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('is_pickup', true)
    .maybeSingle();

  if (error) throw error;
  return data as Address | null;
}

function toRow(input: AddressInput, userId: string) {
  return {
    user_id: userId,
    full_name: input.fullName.trim(),
    phone: input.phone.trim(),
    region: input.region ?? null,
    city: input.city ?? null,
    postal_code: input.postalCode ?? null,
    street: input.street.trim(),
    label: input.label ?? 'Home',
    is_default: input.isDefault ?? false,
    is_pickup: input.isPickup ?? false,
  };
}

export async function createAddress(input: AddressInput) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to save an address.');

  const { data, error } = await supabase
    .from('addresses')
    .insert(toRow(input, userData.user.id))
    .select('*')
    .single();

  if (error) throw error;
  return data as Address;
}

export async function updateAddress(id: string, input: AddressInput) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to update an address.');

  const { data, error } = await supabase
    .from('addresses')
    .update(toRow(input, userData.user.id))
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Address;
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Marks an existing address as the pickup address without touching its
 * other fields. The addresses_enforce_single_default trigger
 * (20260705000022_addresses.sql) unsets is_pickup on any previous holder,
 * so this is safe to call directly.
 */
export async function setPickupAddress(id: string) {
  const { data, error } = await supabase
    .from('addresses')
    .update({ is_pickup: true })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Address;
}
