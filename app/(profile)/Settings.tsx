import { router } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  LogOut,
  MapPin,
  Bell,
  User,
  KeyRound,
  BadgeCheck,
  Store,
  LayoutDashboard,
  HelpCircle,
  FileText,
  Pencil,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth-context';
import { logError } from '@/lib/observability';

type SettingsRowProps = {
  label: string;
  value?: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
  accentColor?: string;
};

function SettingsRow({ label, value, Icon, onPress, accentColor }: SettingsRowProps) {
  return (
    <Pressable onPress={onPress} style={st.row}>
      <View style={st.rowLeft}>
        <View style={[st.rowIconWrap, accentColor ? { backgroundColor: `${accentColor}18` } : null]}>
          <Icon size={16} color={accentColor ?? '#4289AB'} />
        </View>
        <Text style={st.rowLabel}>{label}</Text>
      </View>
      <View style={st.rowRight}>
        {value ? <Text style={st.rowValue}>{value}</Text> : null}
        <ChevronRight size={16} color="#D1D5DB" />
      </View>
    </Pressable>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={st.sectionHeader}>
      <Text style={st.sectionText}>{label}</Text>
    </View>
  );
}

function verificationLabel(status?: string) {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'early_access':
      return 'Early Access';
    case 'pending':
      return 'Pending Review';
    case 'rejected':
      return 'Get Verified';
    default:
      return 'Not Verified';
  }
}

export default function Settings() {
  const { user, profile, resetPassword, signOut } = useAuth();
  const [sendingReset, setSendingReset] = useState(false);

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'LUVLOTS Member';
  const isSeller = profile?.role === 'seller' || profile?.role === 'admin';
  const isVerified = profile?.verification_status === 'verified' || profile?.verification_status === 'early_access';

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            router.replace('/(auth)');
          }
        },
      },
    ]);
  }

  async function handleChangePassword() {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      await resetPassword(user.email);
      Alert.alert('Check your email', `We sent a password reset link to ${user.email}.`);
    } catch (error) {
      logError(error, { area: 'Settings.handleChangePassword' });
      Alert.alert('Could not send reset link', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={st.header}>
          <Pressable onPress={() => router.back()} style={st.backBtn}>
            <ChevronLeft size={22} color="#fff" />
          </Pressable>
          <Text style={st.headerTitle}>Settings</Text>
          <View style={{ width: 34 }} />
        </View>

        <Pressable onPress={() => router.push('/(profile)/EditProfile')} style={st.identityRow}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={st.avatar} />
          ) : (
            <View style={[st.avatar, st.avatarPlaceholder]}>
              <Text style={st.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={st.identityName}>{displayName}</Text>
              {isVerified ? <BadgeCheck size={15} color="#fff" fill="#4289AB" /> : null}
            </View>
            <Text style={st.identityEmail}>{user?.email ?? ''}</Text>
          </View>
          <View style={st.identityEditBadge}>
            <Pencil size={12} color="#fff" />
          </View>
        </Pressable>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <SectionHeader label="Account" />
        <View style={st.cardGroup}>
          <SettingsRow label="Edit Profile" Icon={User} onPress={() => router.push('/(profile)/EditProfile')} />
          <SettingsRow label="My Addresses" Icon={MapPin} onPress={() => router.push('/(profile)/Addresses')} />
          <SettingsRow label="Notifications" Icon={Bell} onPress={() => router.push('/(profile)/Notifications' as any)} />
          <SettingsRow
            label="Change Password"
            Icon={KeyRound}
            onPress={handleChangePassword}
            value={sendingReset ? 'Sending...' : undefined}
          />
        </View>

        <SectionHeader label="Verification" />
        <View style={st.cardGroup}>
          <SettingsRow
            label="Celebrity / Influencer Badge"
            value={verificationLabel(profile?.verification_status)}
            Icon={BadgeCheck}
            onPress={() => router.push('/(profile)/GetVerified' as any)}
            accentColor="#D9AC4E"
          />
        </View>

        <SectionHeader label="Selling" />
        <View style={st.cardGroup}>
          {isSeller ? (
            <SettingsRow label="My Shop Dashboard" Icon={LayoutDashboard} onPress={() => router.push('/(seller-dashboard)' as any)} />
          ) : (
            <SettingsRow label="Start Selling" Icon={Store} onPress={() => router.push('/(seller-registration)/Welcome')} accentColor="#D9AC4E" />
          )}
        </View>

        <SectionHeader label="Support" />
        <View style={st.cardGroup}>
          <SettingsRow
            label="Help Center"
            Icon={HelpCircle}
            onPress={() =>
              Alert.alert('Help Center', 'Need a hand? Email support@luvlots.app and our team will get back to you shortly.')
            }
          />
          <SettingsRow
            label="Terms & Privacy Policy"
            Icon={FileText}
            onPress={() => Alert.alert('Terms & Privacy Policy', 'LUVLOTS Terms of Service and Privacy Policy are available at luvlots.app/legal.')}
          />
          <SettingsRow
            label="About"
            Icon={Info}
            onPress={() =>
              Alert.alert('About LUVLOTS', 'Version 1.0.0\n\nThe premier celebrity pre-loved marketplace in the Philippines.', [{ text: 'OK' }])
            }
          />
        </View>

        <View style={{ marginTop: 24, paddingHorizontal: 16, paddingBottom: 40 }}>
          <Pressable style={st.logoutBtn} onPress={handleLogout}>
            <LogOut size={18} color="#E53935" />
            <Text style={st.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
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
    textAlign: 'center',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 4,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  avatarPlaceholder: { backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },
  identityName: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#fff' },
  identityEmail: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  identityEditBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  cardGroup: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EFF6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#1F2937' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowValue: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoutBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
  },
  logoutText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#E53935' },
});
