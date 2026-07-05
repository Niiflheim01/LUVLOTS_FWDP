import { supabase } from '@/lib/supabase';

export type SubmitPartnerApplicationInput = {
  orgName: string;
  orgType: string;
  registrationNumber: string;
  taxNumber?: string;
  mission: string;
  focusAreas: string[];
  website?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  facebook?: string;
  instagram?: string;
};

export async function submitPartnerApplication(input: SubmitPartnerApplicationInput) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to submit an application.');

  const { data, error } = await supabase
    .from('partner_applications')
    .insert({
      submitted_by: userData.user.id,
      org_name: input.orgName.trim(),
      org_type: input.orgType.trim(),
      registration_number: input.registrationNumber.trim(),
      tax_number: input.taxNumber?.trim() || null,
      mission: input.mission.trim(),
      focus_areas: input.focusAreas,
      website: input.website?.trim() || null,
      contact_name: input.contactName.trim(),
      contact_email: input.contactEmail.trim(),
      contact_phone: input.contactPhone.trim(),
      facebook: input.facebook?.trim() || null,
      instagram: input.instagram?.trim() || null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
