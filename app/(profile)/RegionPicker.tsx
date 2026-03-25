import { router } from 'expo-router';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const REGIONS = [
  { letter: 'M', name: 'Metro Manila', cities: ['Quezon City', 'Manila', 'Makati', 'Pasig', 'Taguig', 'Mandaluyong', 'Paranaque', 'Caloocan'] },
  { letter: 'I', name: 'Ilocos Region', cities: ['Vigan', 'Laoag', 'San Fernando', 'Batac'] },
  { letter: 'II', name: 'Cagayan Valley', cities: ['Tuguegarao', 'Cauayan', 'Ilagan'] },
  { letter: 'III', name: 'Central Luzon', cities: ['Angeles', 'Olongapo', 'San Fernando', 'Malolos', 'Meycauayan'] },
  { letter: 'IV-A', name: 'CALABARZON', cities: ['Antipolo', 'Bacoor', 'Calamba', 'Lucena', 'Dasmariñas'] },
  { letter: 'V', name: 'Bicol Region', cities: ['Naga', 'Legazpi', 'Sorsogon', 'Masbate'] },
  { letter: 'VI', name: 'Western Visayas', cities: ['Iloilo City', 'Bacolod', 'Roxas City'] },
  { letter: 'VII', name: 'Central Visayas', cities: ['Cebu City', 'Mandaue', 'Lapu-Lapu', 'Dumaguete'] },
  { letter: 'VIII', name: 'Eastern Visayas', cities: ['Tacloban', 'Ormoc', 'Calbayog'] },
  { letter: 'IX', name: 'Zamboanga Peninsula', cities: ['Zamboanga City', 'Dipolog', 'Pagadian'] },
  { letter: 'X', name: 'Northern Mindanao', cities: ['Cagayan de Oro', 'Iligan', 'Ozamiz'] },
  { letter: 'XI', name: 'Davao Region', cities: ['Davao City', 'Panabo', 'Tagum', 'Digos'] },
  { letter: 'XII', name: 'SOCCSKSARGEN', cities: ['General Santos', 'Koronadal', 'Cotabato City'] },
  { letter: 'XIII', name: 'Caraga', cities: ['Butuan', 'Surigao City', 'Bayugan'] },
];

export default function RegionPicker() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = REGIONS.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cities.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  function handleSelectCity(_regionName: string, _city: string) {
    router.back();
  }

  function handleSelectRegion(_regionName: string) {
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={rp.header}>
          <Pressable onPress={() => router.back()} style={rp.backBtn}>
            <ChevronLeft size={22} color="#fff" />
          </Pressable>
          <Text style={rp.headerTitle}>Select Region</Text>
          <View style={{ width: 34 }} />
        </View>
      </SafeAreaView>

      <View style={rp.searchWrap}>
        <MapPin size={16} color="#4289AB" />
        <TextInput
          placeholder="Search region or city..."
          placeholderTextColor="#AAA"
          value={search}
          onChangeText={setSearch}
          style={rp.searchInput}
        />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Use Current Location */}
        <Pressable style={rp.locBtn} onPress={() => router.back()}>
          <View style={rp.locIcon}>
            <MapPin size={16} color="#4289AB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={rp.locTitle}>Use My Current Location</Text>
            <Text style={rp.locSub}>Automatically detect your area</Text>
          </View>
        </Pressable>

        {/* Region Label */}
        <View style={rp.labelBar}>
          <Text style={rp.labelText}>All Regions</Text>
        </View>

        {filtered.map((region) => (
          <View key={region.name}>
            <Pressable
              onPress={() => setExpanded(expanded === region.name ? null : region.name)}
              style={rp.regionRow}>
              <View style={rp.regionLetterBadge}>
                <Text style={rp.regionLetterText}>{region.letter}</Text>
              </View>
              <Text style={rp.regionName}>{region.name}</Text>
              <Text style={rp.chevron}>{expanded === region.name ? '▲' : '▼'}</Text>
            </Pressable>

            {expanded === region.name && (
              <View style={rp.citiesContainer}>
                {region.cities.map((city) => (
                  <Pressable
                    key={city}
                    onPress={() => handleSelectCity(region.name, city)}
                    style={rp.cityRow}>
                    <Text style={rp.cityText}>{city}</Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => handleSelectRegion(region.name)}
                  style={rp.allRegionBtn}>
                  <Text style={rp.allRegionText}>All of {region.name}</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const rp = StyleSheet.create({
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8EFF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#333',
  },
  locBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#EFF6FA',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#D0E8F5',
  },
  locIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4289AB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1F2937' },
  locSub: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  labelBar: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F4F8',
  },
  labelText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    gap: 12,
  },
  regionLetterBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionLetterText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#4289AB',
  },
  regionName: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#1F2937', flex: 1 },
  chevron: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9CA3AF' },
  citiesContainer: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cityRow: {
    paddingHorizontal: 64,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cityText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#4B5563' },
  allRegionBtn: {
    paddingHorizontal: 64,
    paddingVertical: 12,
  },
  allRegionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#4289AB',
  },
});
