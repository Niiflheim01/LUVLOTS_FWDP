import React, { useState } from 'react';
import { View, Pressable, ScrollView, Text, StyleSheet } from 'react-native';
import { Bell, MessageSquare, Truck, CreditCard } from 'lucide-react-native';

type Notification = {
  id: string;
  type: 'delivery' | 'transaction' | 'message' | 'update' | 'reply';
  title: string;
  description: string;
  time: string;
  unread?: boolean;
};

const todayNotifications: Notification[] = [
  {
    id: '1',
    type: 'delivery',
    title: 'Delivery Movement Alert',
    description: 'Estimated Arrival is 3 Days After.',
    time: '12:19 AM',
    unread: true,
  },
  {
    id: '2',
    type: 'transaction',
    title: 'Transaction Alert',
    description: 'Your payment is pending.',
    time: '12:19 AM',
    unread: true,
  },
  {
    id: '3',
    type: 'message',
    title: 'Message Alert',
    description: 'A seller has messaged you about your item.',
    time: '12:19 AM',
    unread: true,
  },
];

const earlierNotifications: Notification[] = [
  {
    id: '4',
    type: 'delivery',
    title: 'Delivery Movement Alert',
    description: 'Estimated Arrival is 3 Days After.',
    time: '12:19 AM',
  },
  {
    id: '5',
    type: 'delivery',
    title: 'Delivery Movement Alert',
    description: 'Estimated Arrival is 3 Days After.',
    time: '12:19 AM',
  },
  {
    id: '6',
    type: 'message',
    title: 'Message Alert',
    description: 'A seller has messaged you about your item.',
    time: '12:19 AM',
  },
  {
    id: '7',
    type: 'transaction',
    title: 'Transaction Alert',
    description: 'Your payment has been received by the seller.',
    time: '12:19 AM',
  },
];

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'delivery':
      return <Truck size={18} color="#4289AB" />;
    case 'transaction':
      return <CreditCard size={18} color="#D9AC4E" />;
    case 'message':
      return <MessageSquare size={18} color="#5998B9" />;
    default:
      return <Bell size={18} color="#4289AB" />;
  }
};

type Filter = 'all' | 'transaction' | 'reply' | 'update' | 'delivery' | 'message';

const tabs: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Transactions', value: 'transaction' },
  { label: 'Replies', value: 'reply' },
  { label: 'Updates', value: 'update' },
];

const FilterTabs = ({
  activeFilter,
  setFilter,
}: {
  activeFilter: Filter;
  setFilter: (f: Filter) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ marginBottom: 12 }}
    contentContainerStyle={{ gap: 8 }}>
    {tabs.map((tab) => (
      <Pressable
        key={tab.value}
        onPress={() => setFilter(tab.value)}
        style={[
          nt.chip,
          { backgroundColor: activeFilter === tab.value ? '#4289AB' : '#fff', borderColor: activeFilter === tab.value ? '#4289AB' : '#E0E0E0' },
        ]}>
        <Text
          style={[
            nt.chipText,
            { color: activeFilter === tab.value ? '#fff' : '#666' },
          ]}>
          {tab.label}
        </Text>
      </Pressable>
    ))}
  </ScrollView>
);

const NotificationItem = ({ item }: { item: Notification }) => (
  <View style={nt.notifCard}>
    <View style={nt.iconWrap}>{getIcon(item.type)}</View>
    <View style={{ flex: 1 }}>
      <View style={nt.notifHeader}>
        <Text style={nt.notifTitle}>{item.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={nt.notifTime}>{item.time}</Text>
          {item.unread && <View style={nt.dot} />}
        </View>
      </View>
      <Text style={nt.notifDesc}>{item.description}</Text>
    </View>
  </View>
);

export default function Notifications() {
  const [filter, setFilter] = useState<Filter>('all');

  const filterNotifications = (items: Notification[]) => {
    if (filter === 'all') return items;
    return items.filter((item) => item.type === filter);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <View style={nt.filterWrap}>
        <FilterTabs activeFilter={filter} setFilter={setFilter} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {filterNotifications(todayNotifications).length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={nt.sectionLabel}>Today</Text>
            <View style={{ gap: 8 }}>
              {filterNotifications(todayNotifications).map((item) => (
                <NotificationItem key={item.id} item={item} />
              ))}
            </View>
          </View>
        )}

        {filterNotifications(earlierNotifications).length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={nt.sectionLabel}>Earlier</Text>
            <View style={{ gap: 8 }}>
              {filterNotifications(earlierNotifications).map((item) => (
                <NotificationItem key={item.id} item={item} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const nt = StyleSheet.create({
  filterWrap: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chip: { borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#E0E0E0' },
  chipText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 12,
  },
  iconWrap: {
    marginTop: 2,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
  },
  notifHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  notifTitle: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1F2937' },
  notifTime: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9CA3AF' },
  dot: { height: 8, width: 8, borderRadius: 4, backgroundColor: '#D9AC4E' },
  notifDesc: { fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 16, color: '#6B7280', marginTop: 2 },
  sectionLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
});
