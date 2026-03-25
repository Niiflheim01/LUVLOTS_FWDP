import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShopInfo() {
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const maxShopName = 30;

  return (
    <LinearGradient
      colors={['#4289AB', '#8FBBD8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <ScrollView
          style={{ flex: 1, marginTop: 56 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Progress Stepper */}
          <View style={si.stepRow}>
            {/* Step 1 — Active */}
            <View style={si.stepCenter}>
              <View style={[si.stepCircle, { backgroundColor: '#fff', borderColor: '#fff' }]}>
                <Text style={[si.stepNum, { color: '#4289AB' }]}>1</Text>
              </View>
              <Text style={[si.stepLabel, { color: '#fff' }]}>Shop Info</Text>
            </View>

            {/* Line */}
            <View style={si.stepLine} />

            {/* Step 2 — Inactive */}
            <View style={si.stepCenter}>
              <View style={[si.stepCircle, { borderColor: 'rgba(255,255,255,0.3)' }]}>
                <Text style={[si.stepNum, { color: 'rgba(255,255,255,0.5)' }]}>2</Text>
              </View>
              <Text style={[si.stepLabel, { color: 'rgba(255,255,255,0.5)' }]}>Business Info</Text>
            </View>
          </View>

          {/* Form — Shop Name */}
          <View style={si.formCard}>
            <View style={si.fieldBorder}>
              <View style={si.fieldHeader}>
                <Text style={si.fieldLabel}>
                  Shop Name <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <Text style={si.charCount}>{shopName.length}/{maxShopName}</Text>
              </View>
              <TextInput
                value={shopName}
                onChangeText={(t) => setShopName(t.slice(0, maxShopName))}
                placeholder="Enter your shop name"
                placeholderTextColor="#ccc"
                style={si.input}
              />
            </View>
          </View>

          {/* Pickup Address, Email, Phone */}
          <View style={[si.formCard, { marginTop: 12 }]}>
            {/* Pickup Address */}
            <Pressable style={[si.fieldBorder, si.addressRow]}>
              <Text style={si.fieldText}>
                Pickup Address <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#4289AB' }}>Set</Text>
                <ChevronRight size={16} color="#ccc" />
              </View>
            </Pressable>

            {/* Email */}
            <View style={si.fieldBorder}>
              <Text style={si.fieldLabel}>
                Email <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#ccc"
                style={si.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone Number */}
            <View style={si.field}>
              <Text style={si.fieldLabel}>
                Phone Number <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#ccc"
                style={si.input}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={si.bottomRow}>
          <Pressable
            style={si.backBtn}
            onPress={() => router.back()}>
            <Text style={si.backText}>Back</Text>
          </Pressable>
          <Pressable
            style={si.nextBtn}
            onPress={() => router.push('/(seller-registration)/BusinessInfo')}>
            <Text style={si.nextText}>Next</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const si = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingVertical: 24,
  },
  stepCenter: { alignItems: 'center' },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontFamily: 'Poppins_700Bold', fontSize: 12 },
  stepLabel: { fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 4 },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  fieldBorder: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  field: { paddingHorizontal: 16, paddingVertical: 14 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  charCount: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#D1D5DB' },
  fieldText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#1F2937' },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#1F2937',
    marginTop: 4,
    paddingVertical: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
  backBtn: {
    flex: 1,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 14,
    alignItems: 'center',
  },
  backText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#fff' },
  nextBtn: {
    flex: 1,
    borderRadius: 9999,
    backgroundColor: '#fff',
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#4289AB' },
});
