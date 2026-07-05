import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Star } from 'lucide-react-native';

export default function SellersScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <LinearGradient colors={['#1A365D', '#2C5F8A']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <Text style={s.headerTitle}>Celebrity Sellers</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={s.body}>
        <View style={s.iconWrap}>
          <Star size={32} color="#D9AC4E" />
        </View>
        <Text style={s.title}>Coming Soon</Text>
        <Text style={s.subtitle}>
          We're onboarding verified celebrity sellers to LUVLOTS. Once partner storefronts go live,
          you'll be able to browse and shop directly from your favorite stars here.
        </Text>
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
    backgroundColor: '#FFF8E7',
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
});
