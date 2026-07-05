import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, Radio } from 'lucide-react-native';

export default function LiveSellingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <LinearGradient colors={['#1A365D', '#2C5F8A']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <ChevronLeft size={22} color="#fff" />
            </Pressable>
            <Text style={s.headerTitle}>Live Selling</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={s.body}>
        <View style={s.iconWrap}>
          <Radio size={32} color="#E53935" />
        </View>
        <Text style={s.title}>Coming Soon</Text>
        <Text style={s.subtitle}>
          Live-streamed selling is on its way. Sellers will soon be able to go live and sell in real time.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },
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
});
