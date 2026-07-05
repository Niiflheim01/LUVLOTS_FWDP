import { router } from 'expo-router';
import { ChevronLeft, Star, Sparkles, Upload, BadgeCheck, Clock3 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth-context';
import { logError } from '@/lib/observability';
import { pickVerificationImage, requestVerification, uploadVerificationDocument } from '@/lib/verification';
import type { VerificationType } from '@/types/marketplace';

export default function GetVerified() {
  const { profile, refreshProfile } = useAuth();
  const [type, setType] = useState<VerificationType>('celebrity');
  const [handle, setHandle] = useState('');
  const [evidenceUri, setEvidenceUri] = useState<string | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const status = profile?.verification_status ?? 'none';
  const alreadyRequested = status !== 'none' && status !== 'rejected';

  async function handlePickEvidence() {
    setUploadingEvidence(true);
    try {
      const picked = await pickVerificationImage();
      if (picked) setEvidenceUri(picked.uri);
    } catch (error) {
      logError(error, { area: 'GetVerified.handlePickEvidence' });
      Alert.alert('Could not add photo', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setUploadingEvidence(false);
    }
  }

  async function handleSubmit() {
    if (!handle.trim()) {
      Alert.alert('Missing information', 'Please add a social handle or link so we can recognize you.');
      return;
    }

    setSubmitting(true);
    try {
      let documentPath: string | undefined;
      if (evidenceUri) {
        documentPath = await uploadVerificationDocument(evidenceUri, 'verification');
      }
      await requestVerification({ type, note: handle, documentPath });
      await refreshProfile();
      Alert.alert(
        "You're Early Access Verified!",
        "Full manual review is still rolling out, so we've granted your badge right away. It'll show up on your profile and listings immediately.",
        [{ text: 'Great', onPress: () => router.back() }],
      );
    } catch (error) {
      logError(error, { area: 'GetVerified.handleSubmit' });
      Alert.alert('Could not submit request', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <SafeAreaView style={{ backgroundColor: '#1A365D' }} edges={['top']}>
        <View style={gv.header}>
          <Pressable onPress={() => router.back()} style={gv.backBtn}>
            <ChevronLeft size={22} color="#fff" />
          </Pressable>
          <Text style={gv.headerTitle}>Get Verified</Text>
          <View style={{ width: 34 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {alreadyRequested ? (
          <View style={gv.statusCard}>
            <View style={gv.statusIconWrap}>
              <BadgeCheck size={28} color="#4289AB" />
            </View>
            <Text style={gv.statusTitle}>
              {status === 'verified' ? "You're Verified" : status === 'pending' ? 'Review In Progress' : "You're Early Access Verified"}
            </Text>
            <Text style={gv.statusSub}>
              {status === 'verified'
                ? 'Your celebrity/influencer badge is live on your profile.'
                : status === 'pending'
                  ? "We're reviewing your request. This won't take long."
                  : "Full manual ID review isn't live yet, so we granted your badge early. It'll show on your profile and listings now."}
            </Text>
            {profile?.verification_type ? (
              <View style={gv.typeChip}>
                <Text style={gv.typeChipText}>{profile.verification_type === 'celebrity' ? 'Celebrity' : 'Influencer'}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <>
            <View style={gv.introCard}>
              <View style={gv.introIconWrap}>
                <Star size={22} color="#D9AC4E" fill="#D9AC4E" />
              </View>
              <Text style={gv.introTitle}>Stand out with a verified badge</Text>
              <Text style={gv.introSub}>
                Celebrities and influencers get a badge on their profile and listings so buyers know they're the real deal.
              </Text>
              <View style={gv.earlyAccessNote}>
                <Clock3 size={13} color="#B8860B" />
                <Text style={gv.earlyAccessNoteText}>
                  Full ID verification is still being built. For now, requests are approved instantly as "Early Access" --
                  a real review queue will follow once it ships.
                </Text>
              </View>
            </View>

            <View style={gv.card}>
              <Text style={gv.label}>I am a...</Text>
              <View style={gv.typeRow}>
                <Pressable onPress={() => setType('celebrity')} style={[gv.typeCard, type === 'celebrity' && gv.typeCardActive]}>
                  <Sparkles size={18} color={type === 'celebrity' ? '#4289AB' : '#9CA3AF'} />
                  <Text style={[gv.typeCardLabel, type === 'celebrity' && gv.typeCardLabelActive]}>Celebrity</Text>
                </Pressable>
                <Pressable onPress={() => setType('influencer')} style={[gv.typeCard, type === 'influencer' && gv.typeCardActive]}>
                  <Star size={18} color={type === 'influencer' ? '#4289AB' : '#9CA3AF'} />
                  <Text style={[gv.typeCardLabel, type === 'influencer' && gv.typeCardLabelActive]}>Influencer</Text>
                </Pressable>
              </View>

              <Text style={gv.label}>Social Handle or Link *</Text>
              <TextInput
                value={handle}
                onChangeText={setHandle}
                placeholder="e.g. @yourname on Instagram/TikTok"
                placeholderTextColor="#C4C4C4"
                style={gv.input}
                autoCapitalize="none"
              />

              <Text style={gv.label}>Supporting Photo (optional)</Text>
              <Pressable style={gv.uploadBox} onPress={handlePickEvidence} disabled={uploadingEvidence}>
                {evidenceUri ? (
                  <Image source={{ uri: evidenceUri }} style={gv.uploadPreview} />
                ) : uploadingEvidence ? (
                  <ActivityIndicator color="#9CA3AF" />
                ) : (
                  <>
                    <Upload size={22} color="#9CA3AF" />
                    <Text style={gv.uploadText}>Tap to add a screenshot or photo</Text>
                  </>
                )}
              </Pressable>
            </View>

            <Pressable onPress={handleSubmit} disabled={submitting} style={[gv.submitBtn, submitting && { opacity: 0.7 }]}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={gv.submitBtnText}>Submit Request</Text>}
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const gv = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 12 },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#fff', textAlign: 'center' },

  introCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 12 },
  introIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFF8E7', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  introTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#1A365D', textAlign: 'center' },
  introSub: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 6, lineHeight: 18 },
  earlyAccessNote: { flexDirection: 'row', gap: 8, backgroundColor: '#FFF8E7', borderRadius: 10, padding: 12, marginTop: 14 },
  earlyAccessNoteText: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#8A6D1D', lineHeight: 16 },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4B5563', marginTop: 14, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeCard: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  typeCardActive: { borderColor: '#4289AB', backgroundColor: '#EFF6FA' },
  typeCardLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#9CA3AF' },
  typeCardLabelActive: { color: '#4289AB' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333' },
  uploadBox: { alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#D1D5DB', paddingVertical: 24, overflow: 'hidden' },
  uploadText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  uploadPreview: { width: '100%', height: 140, borderRadius: 10 },

  submitBtn: { backgroundColor: '#4289AB', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  submitBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#fff' },

  statusCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' },
  statusIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EFF6FA', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  statusTitle: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: '#1A365D', textAlign: 'center' },
  statusSub: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 18 },
  typeChip: { marginTop: 14, backgroundColor: '#EFF6FA', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  typeChipText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4289AB' },
});
