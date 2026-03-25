import { router } from 'expo-router';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfile() {
  const [shopName, setShopName] = useState('Apl.de.ap');
  const [description, setDescription] = useState('');
  const [updateFollowers, setUpdateFollowers] = useState(true);

  function handleSave() {
    Alert.alert('Saved', 'Profile updated successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={ep.header}>
          <Pressable onPress={() => router.back()} style={ep.backBtn}>
            <ChevronLeft size={22} color="#fff" />
          </Pressable>
          <Text style={ep.headerTitle}>Edit Profile</Text>
          <Pressable onPress={handleSave} style={ep.saveHeaderBtn}>
            <Text style={ep.saveHeaderText}>Save</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Profile Photo */}
        <Pressable style={ep.photoRow}>
          <Text style={ep.labelText}>Profile Photo</Text>
          <View style={{ position: 'relative' }}>
            <Image
              source={require('@/assets/images/seller.png')}
              style={{ width: 56, height: 56, borderRadius: 28 }}
            />
            <View style={ep.cameraBadge}>
              <Camera size={10} color="white" />
            </View>
          </View>
          <ChevronRight size={16} color="#ccc" />
        </Pressable>

        {/* Name */}
        <View style={ep.fieldCard}>
          <Text style={ep.fieldLabel}>Name</Text>
          <TextInput
            value={shopName}
            onChangeText={setShopName}
            style={ep.input}
          />
        </View>

        {/* Bio */}
        <View style={ep.fieldCard}>
          <View style={ep.fieldHeader}>
            <Text style={ep.fieldLabel}>Bio</Text>
            <Text style={ep.charCount}>{description.length}/500</Text>
          </View>
          <TextInput
            value={description}
            onChangeText={(t) => setDescription(t.slice(0, 500))}
            placeholder="Tell us about yourself"
            placeholderTextColor="#ccc"
            style={ep.input}
            multiline
          />
        </View>

        {/* Contact Info */}
        <View style={[ep.sectionCard, { marginTop: 12 }]}>
          <Pressable style={ep.contactRow}>
            <Text style={ep.labelText}>Phone</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={ep.contactValue}>**********10</Text>
              <ChevronRight size={16} color="#ccc" />
            </View>
          </Pressable>
          <Pressable style={[ep.contactRow, { borderBottomWidth: 0 }]}>
            <Text style={ep.labelText}>Email</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={ep.contactValue}>em*****@gmail.com</Text>
              <ChevronRight size={16} color="#ccc" />
            </View>
          </Pressable>
        </View>

        {/* Update Followers */}
        <View style={[ep.fieldCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <Text style={ep.labelText}>Update your followers</Text>
          <Switch
            value={updateFollowers}
            onValueChange={setUpdateFollowers}
            trackColor={{ false: '#d1d5db', true: '#5998B9' }}
            thumbColor="white"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const ep = StyleSheet.create({
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
  saveHeaderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  saveHeaderText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#fff',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 9999,
    backgroundColor: '#4289AB',
    padding: 4,
  },
  fieldCard: {
    marginBottom: 12,
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
  fieldHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  charCount: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#D1D5DB' },
  input: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#1F2937', paddingVertical: 2 },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  labelText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#1F2937' },
  contactValue: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
});
