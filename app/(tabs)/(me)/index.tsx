import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { useAuth } from '@/lib/auth-context';
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  FileText,
  Heart,
  LogOut,
  Pencil,
  Settings,
  Store,
  MapPin,
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
} from 'lucide-react-native';

type MenuItemProps = {
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
  iconColor?: string;
  accent?: boolean;
};

function MenuItem({ label, Icon, onPress, iconColor = '#555', accent }: MenuItemProps) {
  return (
    <Pressable onPress={onPress} style={s.menuItem}>
      <View style={s.menuLeft}>
        <View style={[s.menuIcon, accent && { backgroundColor: '#FFF8E7' }]}>
          <Icon size={16} color={iconColor} />
        </View>
        <Text
          style={[
            s.menuLabel,
            accent && { fontFamily: 'Poppins_600SemiBold', color: '#B8860B' },
          ]}>
          {label}
        </Text>
      </View>
      <ChevronRight size={16} color="#CCC" />
    </Pressable>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <View style={s.sectionLabelWrap}>
      <Text style={s.sectionLabelText}>{label}</Text>
    </View>
  );
}

export default function MeScreen() {
  const { user, profile, signOut } = useAuth();
  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'LUVLOTS Member';
  const isSeller = profile?.role === 'seller' || profile?.role === 'admin';
  const isVerified = profile?.verification_status === 'verified' || profile?.verification_status === 'early_access';

  async function handleLogout() {
    try {
      await signOut();
    } catch {
      router.replace('/(auth)');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <Text style={s.headerTitle}>Me</Text>
            <Pressable
              onPress={() => router.push('/(profile)/Settings')}
              style={s.settingsBtn}>
              <Settings size={18} color="#fff" />
            </Pressable>
          </View>

          <View style={s.userRow}>
            <View style={{ position: 'relative' }}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={s.avatar} />
              ) : (
                <View style={[s.avatar, s.avatarPlaceholder]}>
                  <Text style={s.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <Pressable
                onPress={() => router.push('/(profile)/EditProfile')}
                style={s.editBadge}>
                <Pencil size={10} color="#4289AB" />
              </Pressable>
            </View>
            <View style={{ marginLeft: 14, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={s.userName}>{displayName}</Text>
                {isVerified ? <BadgeCheck size={16} color="#fff" fill="#4289AB" /> : null}
              </View>
              <Text style={s.userEmail}>{user?.email ?? ''}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Luvlist Featured Card */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Pressable onPress={() => router.push('/(main)/LuvlistScreen' as any)} style={s.luvItCard}>
            <LinearGradient
              colors={['#E91E63', '#FF5C8D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.luvItGrad}>
              <View style={s.luvItIconWrap}>
                <Heart size={20} color="#E91E63" fill="#E91E63" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.luvItTitle}>Luvlist</Text>
                <Text style={s.luvItSub}>Your saved items & Luvlist</Text>
              </View>
              <ChevronRight size={18} color="rgba(255,255,255,0.75)" />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Quick actions */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={s.purchasesCard}>
            <View style={s.purchasesRow}>
              <Pressable onPress={() => router.push('/(tabs)/(cart)' as any)} style={s.purchaseAction}>
                <View style={s.purchaseIconWrap}>
                  <ShoppingCart size={22} color="#4289AB" />
                </View>
                <Text style={s.purchaseLabel}>Cart</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/(tabs)/(order)' as any)} style={s.purchaseAction}>
                <View style={s.purchaseIconWrap}>
                  <ClipboardList size={22} color="#4289AB" />
                </View>
                <Text style={s.purchaseLabel}>My Orders</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/(profile)/Purchase-History')} style={s.purchaseAction}>
                <View style={s.purchaseIconWrap}>
                  <FileText size={22} color="#4289AB" />
                </View>
                <Text style={s.purchaseLabel}>Purchase History</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Activity Section */}
        <SectionLabel label="Activity" />
        <View style={s.cardGroup}>
          <MenuItem label="Notifications" Icon={Bell} onPress={() => router.push('/(profile)/Notifications')} iconColor="#4289AB" />
        </View>

        {/* Seller Section */}
        <SectionLabel label="Seller" />
        <View style={s.cardGroup}>
          {isSeller ? (
            <MenuItem label="My Shop" Icon={LayoutDashboard} onPress={() => router.push('/(seller-dashboard)' as any)} iconColor="#4289AB" />
          ) : (
            <MenuItem label="Start Selling" Icon={Store} onPress={() => router.push('/(seller-registration)/Welcome')} iconColor="#D9AC4E" accent />
          )}
        </View>

        {/* General Section */}
        <SectionLabel label="General" />
        <View style={s.cardGroup}>
          <MenuItem label="My Addresses" Icon={MapPin} onPress={() => router.push('/(profile)/Addresses')} iconColor="#4289AB" />
          <MenuItem label="Account Settings" Icon={Settings} onPress={() => router.push('/(profile)/Settings')} iconColor="#4289AB" />
        </View>

        {/* Logout */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}>
          <Pressable
            onPress={handleLogout}
            style={s.logoutBtn}>
            <LogOut size={16} color="#E53935" />
            <Text style={s.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: '#4289AB',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },
  settingsBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
  },
  userName: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: '#fff' },
  userEmail: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  sectionLabelWrap: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 10,
  },
  sectionLabelText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardGroup: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#333' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 14,
  },
  logoutText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#E53935' },
  // My Purchases
  purchasesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  purchasesRow: { flexDirection: 'row', justifyContent: 'space-around' },
  purchaseAction: { alignItems: 'center', gap: 6, flex: 1 },
  purchaseIconWrap: { position: 'relative', width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FA', alignItems: 'center', justifyContent: 'center' },
  purchaseLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#374151', textAlign: 'center' },
  // Luvlist
  luvItCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  luvItGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  luvItIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  luvItTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#fff' },
  luvItSub: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
});
