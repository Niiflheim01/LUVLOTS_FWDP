import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import ProductCard from '@/components/ProductCard';

export default function AuctionCalendar() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}>
        {/* Calendar Card */}
        <View style={ac.calCard}>
          <Calendar
            onDayPress={(_day) => {}}
            theme={{
              todayTextColor: '#4289AB',
              selectedDayBackgroundColor: '#4289AB',
              arrowColor: '#4289AB',
              textDayFontFamily: 'Poppins_400Regular',
              textMonthFontFamily: 'Poppins_600SemiBold',
              textDayHeaderFontFamily: 'Poppins_400Regular',
            }}
          />
        </View>

        {/* Upcoming Auctions */}
        <View style={ac.card}>
          <Text style={ac.heading}>Upcoming Auctions This Month</Text>
          <ProductCard
            name="Classic Concert Guitar"
            price="500.00"
            status="upcoming"
            imageUri="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&q=80"
            sellerId="4"
            description="Concert-grade acoustic guitar."
            category="Music"
          />
          <ProductCard
            name="Diamond Ring"
            price="45000.00"
            status="upcoming"
            imageUri="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&q=80"
            sellerId="5"
            description="18k gold diamond ring from Ivana Alawi's personal jewelry collection."
            category="Jewelry"
          />
          <ProductCard
            name="KathNiel Collab Bracelet"
            price="2800.00"
            status="upcoming"
            imageUri="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&q=80"
            sellerId="3"
            description="Limited KathNiel collaboration bracelet by Kathryn Bernardo."
            category="Jewelry"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const ac = StyleSheet.create({
  calCard: { overflow: 'hidden', borderRadius: 12, backgroundColor: '#fff', padding: 12 },
  card: { borderRadius: 12, backgroundColor: '#fff', padding: 16 },
  heading: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1F2937', marginBottom: 4 },
});
