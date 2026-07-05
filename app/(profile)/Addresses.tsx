import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MapPin, Plus, Pencil, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { deleteAddress, getMyAddresses, setPickupAddress } from '@/lib/addresses';
import { logError } from '@/lib/observability';
import type { Address } from '@/types/marketplace';

export default function Addresses() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const pickupMode = mode === 'pickup';
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getMyAddresses();
      setAddresses(data);
    } catch (error) {
      logError(error, { area: 'Addresses.load' });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSelectPickup(id: string) {
    setSelecting(id);
    try {
      await setPickupAddress(id);
      router.back();
    } catch (error) {
      logError(error, { area: 'Addresses.handleSelectPickup' });
      Alert.alert('Could not set pickup address', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSelecting(null);
    }
  }

  function handleDelete(id: string) {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(id);
            setAddresses((prev) => prev.filter((a) => a.id !== id));
          } catch (error) {
            logError(error, { area: 'Addresses.handleDelete' });
            Alert.alert('Could not delete address', error instanceof Error ? error.message : 'Please try again.');
          }
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <ChevronLeft size={22} color="#fff" />
          </Pressable>
          <Text style={s.headerTitle}>{pickupMode ? 'Select Pickup Address' : 'My Addresses'}</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/(profile)/AddAddress',
                params: pickupMode ? { presetPickup: '1' } : {},
              })
            }
            style={s.addHeaderBtn}>
            <Plus size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 60 }} color="#4289AB" />
        ) : addresses.length === 0 ? (
          <View style={s.emptyWrap}>
            <MapPin size={64} color="#D1D5DB" />
            <Text style={s.emptyTitle}>No addresses yet</Text>
            <Text style={s.emptySubtitle}>Add a delivery address to get started</Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(profile)/AddAddress',
                  params: pickupMode ? { presetPickup: '1' } : {},
                })
              }
              style={s.emptyAddBtn}>
              <Plus size={16} color="#fff" />
              <Text style={s.emptyAddBtnText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {pickupMode ? (
              <Text style={s.pickupHint}>
                Choose which saved address buyers should see as this shop&apos;s pickup location.
              </Text>
            ) : null}
            {addresses.map((address) => (
              <Pressable
                key={address.id}
                disabled={!pickupMode || selecting !== null}
                onPress={() => handleSelectPickup(address.id)}
                style={[
                  s.card,
                  pickupMode && address.is_pickup ? s.cardSelected : null,
                ]}>
                <View style={s.cardRow}>
                  <View style={{ flex: 1 }}>
                    <View style={s.nameRow}>
                      <Text style={s.nameText}>{address.full_name}</Text>
                      <Text style={s.divider}>|</Text>
                      <Text style={s.phoneText}>{address.phone}</Text>
                    </View>
                    <Text style={s.addressLine}>{address.street}</Text>
                    {address.city || address.region ? (
                      <Text style={s.addressLine}>
                        {[address.city, address.region].filter(Boolean).join(', ')}
                      </Text>
                    ) : null}
                    {address.postal_code ? <Text style={s.addressLine}>{address.postal_code}</Text> : null}
                    <View style={s.badgeRow}>
                      {address.is_default && (
                        <View style={[s.badge, { borderColor: '#4289AB' }]}>
                          <Text style={[s.badgeText, { color: '#4289AB' }]}>Default</Text>
                        </View>
                      )}
                      {address.is_pickup && (
                        <View style={[s.badge, { borderColor: '#D9AC4E' }]}>
                          <Text style={[s.badgeText, { color: '#D9AC4E' }]}>Pickup</Text>
                        </View>
                      )}
                      {address.label ? (
                        <View style={[s.badge, { borderColor: '#D1D5DB' }]}>
                          <Text style={[s.badgeText, { color: '#6B7280' }]}>{address.label}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  {pickupMode ? (
                    selecting === address.id ? (
                      <ActivityIndicator color="#4289AB" />
                    ) : null
                  ) : (
                    <View style={s.actionRow}>
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: '/(profile)/AddAddress',
                            params: { editId: address.id },
                          })
                        }
                        hitSlop={8}>
                        <Pencil size={16} color="#4289AB" />
                      </Pressable>
                      <Pressable onPress={() => handleDelete(address.id)} hitSlop={8}>
                        <Trash2 size={16} color="#e74c3c" />
                      </Pressable>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
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
  addHeaderBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#374151',
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptyAddBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4289AB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyAddBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  card: {
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardSelected: { borderColor: '#4289AB' },
  pickupHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1F2937' },
  divider: { fontSize: 12, color: '#9CA3AF' },
  phoneText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280' },
  addressLine: { fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 20, color: '#6B7280' },
  badgeRow: { marginTop: 8, flexDirection: 'row', gap: 8 },
  badge: { borderRadius: 4, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontFamily: 'Poppins_400Regular', fontSize: 10 },
  actionRow: { flexDirection: 'row', gap: 12 },
});
