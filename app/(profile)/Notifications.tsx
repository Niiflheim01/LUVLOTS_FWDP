import React, { useCallback, useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Bell } from 'lucide-react-native';

import { getMyNotifications, markNotificationRead } from '@/lib/notifications';
import { logError } from '@/lib/observability';

type Notification = Awaited<ReturnType<typeof getMyNotifications>>[number];

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (error) {
      logError(error, { area: 'Notifications.load' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handlePress(item: Notification) {
    if (item.read_at) return;
    setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)));
    try {
      await markNotificationRead(item.id);
    } catch (error) {
      logError(error, { area: 'Notifications.markRead' });
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4289AB" />
      ) : notifications.length === 0 ? (
        <View style={nt.emptyState}>
          <Bell size={48} color="#D1D5DB" />
          <Text style={nt.emptyText}>You're all caught up — no notifications yet.</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 8 }} showsVerticalScrollIndicator={false}>
          {notifications.map((item) => (
            <Pressable key={item.id} onPress={() => handlePress(item)} style={nt.notifCard}>
              <View style={nt.iconWrap}>
                <Bell size={18} color="#4289AB" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={nt.notifHeader}>
                  <Text style={nt.notifTitle}>{item.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={nt.notifTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    {!item.read_at && <View style={nt.dot} />}
                  </View>
                </View>
                {item.body ? <Text style={nt.notifDesc}>{item.body}</Text> : null}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const nt = StyleSheet.create({
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
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
});
