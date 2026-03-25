import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CircleCheckBig } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Success() {
  return (
    <LinearGradient
      colors={['#4289AB', '#8FBBD8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}>
      <SafeAreaView style={sc.safe}>
        <View style={sc.center}>
          {/* Success Icon */}
          <View style={sc.iconWrap}>
            <CircleCheckBig size={64} color="white" />
          </View>

          <Text style={sc.title}>You're now a seller!</Text>
          <Text style={sc.desc}>
            Congratulations! Your seller account has been created. Start listing
            your items and reach millions of buyers on LUVLOTS.
          </Text>
        </View>

        {/* CTA */}
        <View style={{ paddingBottom: 24 }}>
          <Pressable
            style={sc.ctaBtn}
            onPress={() => router.replace('/(seller-dashboard)' as any)}>
            <Text style={sc.ctaText}>Go to Seller Dashboard</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const sc = StyleSheet.create({
  safe: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: {
    marginBottom: 24,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 24,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#fff',
  },
  desc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 12,
  },
  ctaBtn: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#4289AB',
  },
});
