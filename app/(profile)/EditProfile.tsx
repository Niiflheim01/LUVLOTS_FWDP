import { router } from 'expo-router';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth-context';
import { logError } from '@/lib/observability';
import { pickAvatarImage, updateMyProfile, uploadAvatar } from '@/lib/profile';

export default function EditProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleChangeAvatar() {
    setUploadingAvatar(true);
    try {
      const picked = await pickAvatarImage();
      if (!picked) return;
      const url = await uploadAvatar(picked.uri);
      setAvatarUrl(url);
      await updateMyProfile({ avatarUrl: url });
      await refreshProfile();
    } catch (error) {
      logError(error, { area: 'EditProfile.handleChangeAvatar' });
      Alert.alert('Could not update photo', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateMyProfile({ fullName, bio });
      await refreshProfile();
      Alert.alert('Saved', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      logError(error, { area: 'EditProfile.handleSave' });
      Alert.alert('Could not save', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={ep.header}>
          <Pressable onPress={() => router.back()} style={ep.backBtn}>
            <ChevronLeft size={22} color="#fff" />
          </Pressable>
          <Text style={ep.headerTitle}>Edit Profile</Text>
          <Pressable onPress={handleSave} disabled={saving} style={ep.saveHeaderBtn}>
            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={ep.saveHeaderText}>Save</Text>}
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Profile Photo */}
        <Pressable style={ep.photoRow} onPress={handleChangeAvatar} disabled={uploadingAvatar}>
          <Text style={ep.labelText}>Profile Photo</Text>
          <View style={{ position: 'relative' }}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 56, height: 56, borderRadius: 28 }} />
            ) : (
              <View style={ep.avatarPlaceholder}>
                <Text style={ep.avatarInitial}>{(fullName || user?.email || '?').charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={ep.cameraBadge}>
              {uploadingAvatar ? <ActivityIndicator size="small" color="#fff" /> : <Camera size={10} color="white" />}
            </View>
          </View>
          <ChevronRight size={16} color="#ccc" />
        </Pressable>

        {/* Name */}
        <View style={ep.fieldCard}>
          <Text style={ep.fieldLabel}>Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            placeholderTextColor="#ccc"
            style={ep.input}
          />
        </View>

        {/* Bio */}
        <View style={ep.fieldCard}>
          <View style={ep.fieldHeader}>
            <Text style={ep.fieldLabel}>Bio</Text>
            <Text style={ep.charCount}>{bio.length}/500</Text>
          </View>
          <TextInput
            value={bio}
            onChangeText={(t) => setBio(t.slice(0, 500))}
            placeholder="Tell us about yourself"
            placeholderTextColor="#ccc"
            style={ep.input}
            multiline
          />
        </View>

        {/* Contact Info (read-only, managed via account settings) */}
        <View style={[ep.sectionCard, { marginTop: 12 }]}>
          <View style={ep.contactRow}>
            <Text style={ep.labelText}>Email</Text>
            <Text style={ep.contactValue}>{user?.email ?? '—'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const ep = StyleSheet.create({
  header: {
    backgroundColor: '#4289AB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  saveHeaderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  saveHeaderText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#fff',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4289AB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#fff',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 9999,
    backgroundColor: '#4289AB',
    padding: 4,
  },
  fieldCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  charCount: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#D1D5DB' },
  input: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#1F2937', paddingVertical: 2 },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  labelText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#1F2937' },
  contactValue: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
});
