import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Upload, User, Building2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type BusinessType = 'individual' | 'business';

export default function BusinessInfo() {
  const [businessType, setBusinessType] = useState<BusinessType>('individual');

  function handleSubmit() {
    router.push('/(seller-registration)/Success');
  }

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
          <View style={bi.stepRow}>
            {/* Step 1 — Complete */}
            <View style={bi.stepCenter}>
              <View style={[bi.stepCircle, { backgroundColor: '#fff', borderColor: '#fff' }]}>
                <Text style={[bi.stepNum, { color: '#4289AB' }]}>✓</Text>
              </View>
              <Text style={[bi.stepLabel, { color: 'rgba(255,255,255,0.7)' }]}>Shop Info</Text>
            </View>

            {/* Line */}
            <View style={[bi.stepLine, { backgroundColor: '#fff' }]} />

            {/* Step 2 — Active */}
            <View style={bi.stepCenter}>
              <View style={[bi.stepCircle, { backgroundColor: '#fff', borderColor: '#fff' }]}>
                <Text style={[bi.stepNum, { color: '#4289AB' }]}>2</Text>
              </View>
              <Text style={[bi.stepLabel, { color: '#fff' }]}>Business Info</Text>
            </View>
          </View>

          {/* Business Type */}
          <View style={bi.formCard}>
            <Text style={bi.sectionLabel}>Business Type</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setBusinessType('individual')}
                style={[
                  bi.typeCard,
                  businessType === 'individual'
                    ? { borderColor: '#4289AB', backgroundColor: 'rgba(66,137,171,0.05)' }
                    : { borderColor: '#E5E7EB' },
                ]}>
                <User size={28} color={businessType === 'individual' ? '#4289AB' : '#6B7280'} />
                <Text
                  style={[
                    bi.typeLabel,
                    { color: businessType === 'individual' ? '#4289AB' : '#6B7280' },
                  ]}>
                  Individual
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setBusinessType('business')}
                style={[
                  bi.typeCard,
                  businessType === 'business'
                    ? { borderColor: '#4289AB', backgroundColor: 'rgba(66,137,171,0.05)' }
                    : { borderColor: '#E5E7EB' },
                ]}>
                <Building2 size={28} color={businessType === 'business' ? '#4289AB' : '#6B7280'} />
                <Text
                  style={[
                    bi.typeLabel,
                    { color: businessType === 'business' ? '#4289AB' : '#6B7280' },
                  ]}>
                  Business
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Government ID Upload (Optional) */}
          <View style={[bi.formCard, { marginTop: 12 }]}>
            <Text style={bi.sectionLabel}>
              Government ID <Text style={{ color: '#D1D5DB' }}>(optional)</Text>
            </Text>
            <Text style={[bi.sectionLabel, { marginBottom: 12 }]}>
              Upload a valid ID for faster verification
            </Text>
            <Pressable style={bi.uploadBox}>
              <Upload size={24} color="#ccc" />
              <Text style={bi.uploadText}>Tap to upload</Text>
            </Pressable>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={bi.bottomRow}>
          <Pressable style={bi.backBtn} onPress={() => router.back()}>
            <Text style={bi.backText}>Back</Text>
          </Pressable>
          <Pressable style={bi.submitBtn} onPress={handleSubmit}>
            <Text style={bi.submitText}>Submit</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const bi = StyleSheet.create({
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
  stepLine: { flex: 1, height: 2, marginHorizontal: 8 },
  formCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sectionLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginBottom: 12 },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 12,
  },
  typeLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 4 },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    paddingVertical: 32,
  },
  uploadText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 8 },
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
  submitBtn: {
    flex: 1,
    borderRadius: 9999,
    backgroundColor: '#fff',
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#4289AB' },
});
