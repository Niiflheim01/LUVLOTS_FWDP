import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createAddress, getAddressById, updateAddress } from '@/lib/addresses';
import { logError } from '@/lib/observability';
import { onRegionSelected } from '@/lib/region-selection';
import type { AddressLabel } from '@/types/marketplace';

export default function AddAddress() {
  const { editId, presetPickup } = useLocalSearchParams<{ editId?: string; presetPickup?: string }>();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [street, setStreet] = useState('');
  const [isDefault, setIsDefault] = useState(!presetPickup);
  const [isPickup, setIsPickup] = useState(Boolean(presetPickup));
  const [label, setLabel] = useState<AddressLabel>('Home');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(Boolean(editId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onRegionSelected((selection) => {
      setRegion(selection.region);
      setCity(selection.city);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!editId) return;
    getAddressById(editId)
      .then((address) => {
        setFullName(address.full_name);
        setPhone(address.phone);
        setRegion(address.region ?? '');
        setCity(address.city ?? '');
        setPostalCode(address.postal_code ?? '');
        setStreet(address.street);
        setLabel(address.label);
        setIsDefault(address.is_default);
        setIsPickup(address.is_pickup);
      })
      .catch((error) => logError(error, { area: 'AddAddress.loadExisting' }))
      .finally(() => setLoading(false));
  }, [editId]);

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Please provide Full Name';
    if (!phone.trim()) newErrors.phone = 'Please provide Phone Number';
    if (!street.trim()) newErrors.street = 'Please provide Street Address';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setSaving(true);
    try {
      const input = { fullName, phone, region, city, postalCode, street, label, isDefault, isPickup };
      if (editId) {
        await updateAddress(editId, input);
      } else {
        await createAddress(input);
      }
      Alert.alert('Success', 'Address has been saved.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      logError(error, { area: 'AddAddress.handleSubmit' });
      Alert.alert('Could not save address', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F8FA', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#4289AB" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={a.header}>
          <Pressable onPress={() => router.back()} style={a.backBtn}>
            <ChevronLeft size={22} color="#fff" />
          </Pressable>
          <Text style={a.headerTitle}>{editId ? 'Edit Address' : 'Add New Address'}</Text>
          <View style={{ width: 34 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Address Section */}
        <View style={a.section}>
          <Text style={a.sectionTitle}>Contact Information</Text>

          <View style={{ marginBottom: 4 }}>
            <TextInput
              value={fullName}
              onChangeText={(t) => { setFullName(t); setErrors((e) => ({ ...e, fullName: '' })); }}
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
              style={a.input}
            />
            {errors.fullName ? <Text style={a.errorText}>{errors.fullName}</Text> : null}
          </View>

          <View style={{ marginBottom: 4 }}>
            <TextInput
              value={phone}
              onChangeText={(t) => { setPhone(t); setErrors((e) => ({ ...e, phone: '' })); }}
              placeholder="Phone Number"
              placeholderTextColor="#9CA3AF"
              style={a.input}
              keyboardType="phone-pad"
            />
            {errors.phone ? <Text style={a.errorText}>{errors.phone}</Text> : null}
          </View>
        </View>

        <View style={[a.section, { marginTop: 12 }]}>
          <Text style={a.sectionTitle}>Location</Text>

          <Pressable
            onPress={() => router.push('/(profile)/RegionPicker')}
            style={a.regionRow}>
            <Text style={[a.regionText, region ? { color: '#1F2937' } : { color: '#9CA3AF' }]}>
              {region ? `${city ? `${city}, ` : ''}${region}` : 'Region, Province, City, Barangay'}
            </Text>
            <ChevronRight size={16} color="#ccc" />
          </Pressable>

          <TextInput
            value={postalCode}
            onChangeText={setPostalCode}
            placeholder="Postal Code"
            placeholderTextColor="#9CA3AF"
            style={a.input}
            keyboardType="numeric"
          />

          <View style={{ marginBottom: 4 }}>
            <TextInput
              value={street}
              onChangeText={(t) => { setStreet(t); setErrors((e) => ({ ...e, street: '' })); }}
              placeholder="Street Name, Building, House No."
              placeholderTextColor="#9CA3AF"
              style={a.input}
            />
            {errors.street ? <Text style={a.errorText}>{errors.street}</Text> : null}
          </View>
        </View>

        {/* Toggles Section */}
        <View style={[a.section, { marginTop: 12 }]}>
          <Text style={a.sectionTitle}>Options</Text>

          <View style={a.toggleRow}>
            <Text style={a.toggleLabel}>Set as Default Address</Text>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: '#d1d5db', true: '#5998B9' }}
              thumbColor="white"
            />
          </View>

          <View style={a.toggleRow}>
            <Text style={a.toggleLabel}>Set as Pickup Address</Text>
            <Switch
              value={isPickup}
              onValueChange={setIsPickup}
              trackColor={{ false: '#d1d5db', true: '#5998B9' }}
              thumbColor="white"
            />
          </View>

          <View style={a.labelRow}>
            <Text style={a.toggleLabel}>Label As:</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['Home', 'Work', 'Other'] as const).map((l) => (
                <Pressable
                  key={l}
                  onPress={() => setLabel(l)}
                  style={[
                    a.labelChip,
                    label === l
                      ? { borderColor: '#4289AB', backgroundColor: '#EFF6FA' }
                      : { borderColor: '#D1D5DB' },
                  ]}>
                  <Text style={[a.labelChipText, { color: label === l ? '#4289AB' : '#6B7280' }]}>
                    {l}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={a.footer}>
        <TouchableOpacity style={[a.submitBtn, saving && { opacity: 0.7 }]} activeOpacity={0.8} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={a.submitText}>Save Address</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const a = StyleSheet.create({
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
  section: {
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
  sectionTitle: { marginBottom: 12, fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1F2937' },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#1F2937',
  },
  errorText: { marginTop: 2, fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#EF4444' },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  regionText: { fontFamily: 'Poppins_400Regular', fontSize: 13 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12,
  },
  toggleLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#1F2937' },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  labelChip: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 6 },
  labelChipText: { fontFamily: 'Poppins_400Regular', fontSize: 12 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingBottom: 34,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  submitBtn: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#4289AB',
    paddingVertical: 14,
  },
  submitText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#fff' },
});
