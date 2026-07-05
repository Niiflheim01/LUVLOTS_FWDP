import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { HandHeart, ChevronRight } from 'lucide-react-native';

export default function CharityScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <LinearGradient colors={['#1A365D', '#2C5F8A']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <Text style={s.headerTitle}>Charity Auctions</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={s.body}>
        <View style={s.iconWrap}>
          <HandHeart size={32} color="#E53935" />
        </View>
        <Text style={s.title}>Coming Soon</Text>
        <Text style={s.subtitle}>
          We're partnering with verified charities to bring auctions that give back. Once our
          first partner organizations are onboard, live charity auctions will appear here.
        </Text>

        <Pressable onPress={() => router.push('/(main)/BecomeAPartnerScreen' as any)} style={s.partnerBtn}>
          <Text style={s.partnerBtnText}>Apply to Become a Partner</Text>
          <ChevronRight size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#fff', marginTop: 12 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#1A365D', marginBottom: 10 },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  partnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E53935',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginTop: 24,
  },
  partnerBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#fff',
  },
});
