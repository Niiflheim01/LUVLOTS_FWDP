import { router } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  MapPin,
  Bell,
  Shield,
  CreditCard,
} from 'lucide-react-native';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SettingsRowProps = {
  label: string;
  value?: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
};

function SettingsRow({ label, value, Icon, onPress }: SettingsRowProps) {
  return (
    <Pressable onPress={onPress} style={st.row}>
      <View style={st.rowLeft}>
        <View style={st.rowIconWrap}>
          <Icon size={16} color="#4289AB" />
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

export default function Settings() {
  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => router.replace('/(auth)'),
      },
    ]);
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
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 16 }} />

        <SectionHeader label="My Account" />
        <View style={st.cardGroup}>
          <SettingsRow label="Account & Security" Icon={Lock} onPress={() =>
            Alert.alert('Account & Security', 'Manage your password, 2-factor authentication, and linked accounts.')
          } />
          <SettingsRow label="My Addresses" Icon={MapPin} onPress={() => router.push('/(profile)/Addresses')} />
          <SettingsRow label="Bank Accounts / Cards" Icon={CreditCard} onPress={() =>
            Alert.alert('Bank Accounts / Cards', 'Link a bank account or credit/debit card to receive payouts and make payments.')
          } />
        </View>

        <SectionHeader label="Settings" />
        <View style={st.cardGroup}>
          <SettingsRow label="Notification Settings" Icon={Bell} onPress={() => router.push('/(profile)/Notifications' as any)} />
          <SettingsRow label="Privacy Settings" Icon={Shield} onPress={() =>
            Alert.alert('Privacy Settings', 'Control who can see your profile, bids, and activity on LUVLOTS.')
          } />
          <SettingsRow label="Language" value="English" Icon={Globe} onPress={() =>
            Alert.alert('Language', 'Select your preferred language.', [
              { text: 'English', onPress: () => {} },
              { text: 'Filipino', onPress: () => {} },
              { text: 'Cancel', style: 'cancel' },
            ])
          } />
        </View>

        <SectionHeader label="Support" />
        <View style={st.cardGroup}>
          <SettingsRow label="Help Centre" Icon={HelpCircle} onPress={() =>
            Alert.alert('Help Centre', 'For support, email us at help@luvlots.com or visit our FAQ.', [{ text: 'OK' }])
          } />
          <SettingsRow label="About" Icon={Info} onPress={() =>
            Alert.alert('About LUVLOTS', 'Version 1.0.0\n\nThe premier celebrity pre-loved auction marketplace in the Philippines.', [{ text: 'OK' }])
          } />
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
