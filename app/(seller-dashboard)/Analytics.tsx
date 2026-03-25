import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  DollarSign,
  Users,
  Star,
  Package,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');

type PeriodKey = '7d' | '30d' | '90d' | '12m';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: '12m', label: '12 Months' },
];

const KPI_DATA = [
  { label: 'Revenue', value: '₱48,200', change: '+12.5%', positive: true, icon: DollarSign, color: '#10B981' },
  { label: 'Orders', value: '42', change: '+8.3%', positive: true, icon: ShoppingCart, color: '#4289AB' },
  { label: 'Visitors', value: '2,140', change: '-3.2%', positive: false, icon: Eye, color: '#6B7FD7' },
  { label: 'Conversion', value: '4.2%', change: '+0.8%', positive: true, icon: TrendingUp, color: '#F59E0B' },
];

const TOP_PRODUCTS = [
  { rank: 1, name: 'Signed Tour Jacket', sold: 12, revenue: '₱54,000', trend: '+18%', positive: true },
  { rank: 2, name: 'Luxury Handbag', sold: 8, revenue: '₱96,000', trend: '+25%', positive: true },
  { rank: 3, name: 'Vintage Vinyl Record', sold: 25, revenue: '₱70,000', trend: '+5%', positive: true },
  { rank: 4, name: 'Celebrity Sunglasses', sold: 8, revenue: '₱28,000', trend: '-12%', positive: false },
  { rank: 5, name: 'Concert Poster', sold: 30, revenue: '₱45,000', trend: '+8%', positive: true },
];

const PERFORMANCE_METRICS = [
  { label: 'Shop Rating', value: '4.9/5.0', icon: Star, color: '#F59E0B', desc: 'Based on 156 reviews' },
  { label: 'Response Rate', value: '98%', icon: Users, color: '#10B981', desc: 'Avg reply: 2 hours' },
  { label: 'Ship On Time', value: '95%', icon: Package, color: '#4289AB', desc: 'Last 30 days' },
  { label: 'Cancel Rate', value: '1.2%', icon: TrendingDown, color: '#EF4444', desc: 'Below 2% — Good' },
];

const REVENUE_BARS = [
  { day: 'Mon', value: 0.6 },
  { day: 'Tue', value: 0.8 },
  { day: 'Wed', value: 0.45 },
  { day: 'Thu', value: 0.95 },
  { day: 'Fri', value: 0.7 },
  { day: 'Sat', value: 1.0 },
  { day: 'Sun', value: 0.55 },
];

export default function Analytics() {
  const [activePeriod, setActivePeriod] = useState<PeriodKey>('30d');

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      {/* Header */}
      <LinearGradient colors={['#1A365D', '#2C5F8A']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <ChevronLeft size={22} color="#fff" />
            </Pressable>
            <Text style={s.headerTitle}>Shop Analytics</Text>
            <Pressable style={s.calBtn}>
              <Calendar size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Period selector */}
          <View style={s.periodRow}>
            {PERIODS.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => setActivePeriod(p.key)}
                style={[s.periodPill, activePeriod === p.key && s.periodPillActive]}>
                <Text style={[s.periodText, activePeriod === p.key && s.periodTextActive]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* KPI Grid */}
        <View style={s.kpiGrid}>
          {KPI_DATA.map((kpi, idx) => (
            <Animated.View key={kpi.label} entering={FadeInDown.delay(idx * 80).duration(400)} style={s.kpiCard}>
              <View style={[s.kpiIconWrap, { backgroundColor: kpi.color + '15' }]}>
                <kpi.icon size={18} color={kpi.color} />
              </View>
              <Text style={s.kpiValue}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
              <View style={s.kpiChangeRow}>
                {kpi.positive ? (
                  <ArrowUpRight size={12} color="#10B981" />
                ) : (
                  <ArrowDownRight size={12} color="#EF4444" />
                )}
                <Text style={[s.kpiChange, { color: kpi.positive ? '#10B981' : '#EF4444' }]}>
                  {kpi.change}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Revenue chart */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)} style={s.chartCard}>
          <View style={s.chartHeader}>
            <View>
              <Text style={s.chartTitle}>Revenue Overview</Text>
              <Text style={s.chartSubtitle}>This week's daily breakdown</Text>
            </View>
            <View style={s.chartTotal}>
              <Text style={s.chartTotalValue}>₱12,840</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <ArrowUpRight size={10} color="#10B981" />
                <Text style={s.chartTotalChange}>+12.5%</Text>
              </View>
            </View>
          </View>

          {/* Simple bar chart */}
          <View style={s.barChart}>
            {REVENUE_BARS.map((bar) => (
              <View key={bar.day} style={s.barCol}>
                <View style={s.barTrack}>
                  <LinearGradient
                    colors={['#4289AB', '#6DB8D8']}
                    style={[s.barFill, { height: `${bar.value * 100}%` }]}
                  />
                </View>
                <Text style={s.barLabel}>{bar.day}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Shop Performance */}
        <Animated.View entering={FadeInDown.delay(450).duration(500)}>
          <View style={s.sectionHeader}>
            <BarChart2 size={16} color="#1A365D" />
            <Text style={s.sectionTitle}>Shop Performance</Text>
          </View>
          <View style={s.perfGrid}>
            {PERFORMANCE_METRICS.map((metric, idx) => (
              <View key={metric.label} style={s.perfCard}>
                <View style={s.perfTop}>
                  <View style={[s.perfIcon, { backgroundColor: metric.color + '15' }]}>
                    <metric.icon size={16} color={metric.color} />
                  </View>
                  <Text style={s.perfValue}>{metric.value}</Text>
                </View>
                <Text style={s.perfLabel}>{metric.label}</Text>
                <Text style={s.perfDesc}>{metric.desc}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Top Products */}
        <Animated.View entering={FadeInDown.delay(550).duration(500)}>
          <View style={s.sectionHeader}>
            <TrendingUp size={16} color="#1A365D" />
            <Text style={s.sectionTitle}>Top Products</Text>
          </View>
          <View style={s.topProductsCard}>
            {/* Table header */}
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, { width: 28 }]}>#</Text>
              <Text style={[s.tableHeaderText, { flex: 1 }]}>Product</Text>
              <Text style={[s.tableHeaderText, { width: 50, textAlign: 'center' }]}>Sold</Text>
              <Text style={[s.tableHeaderText, { width: 80, textAlign: 'right' }]}>Revenue</Text>
              <Text style={[s.tableHeaderText, { width: 55, textAlign: 'right' }]}>Trend</Text>
            </View>

            {TOP_PRODUCTS.map((product) => (
              <View key={product.rank} style={s.tableRow}>
                <View style={s.rankBadge}>
                  <Text style={[s.rankText, product.rank <= 3 && { color: '#D9AC4E' }]}>{product.rank}</Text>
                </View>
                <Text style={s.tableName} numberOfLines={1}>{product.name}</Text>
                <Text style={s.tableSold}>{product.sold}</Text>
                <Text style={s.tableRevenue}>{product.revenue}</Text>
                <View style={{ width: 55, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                  {product.positive ? (
                    <ArrowUpRight size={10} color="#10B981" />
                  ) : (
                    <ArrowDownRight size={10} color="#EF4444" />
                  )}
                  <Text style={[s.tableTrend, { color: product.positive ? '#10B981' : '#EF4444' }]}>
                    {product.trend}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },
  calBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },

  periodRow: { flexDirection: 'row', gap: 8, marginTop: 14, paddingHorizontal: 16 },
  periodPill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  periodPillActive: { backgroundColor: '#fff' },
  periodText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  periodTextActive: { color: '#1A365D' },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  kpiCard: { width: (SCREEN_W - 42) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  kpiIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiValue: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#1A365D' },
  kpiLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  kpiChangeRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 6 },
  kpiChange: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },

  chartCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  chartTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1A365D' },
  chartSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  chartTotal: { alignItems: 'flex-end' },
  chartTotalValue: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: '#4289AB' },
  chartTotalChange: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#10B981' },

  barChart: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', height: 120 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { width: '100%', height: 100, backgroundColor: '#F3F4F6', borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9CA3AF' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12 },
  sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1A365D' },

  perfGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  perfCard: { width: (SCREEN_W - 42) / 2, backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  perfTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  perfIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  perfValue: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: '#1A365D' },
  perfLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#374151' },
  perfDesc: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9CA3AF', marginTop: 2 },

  topProductsCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tableHeaderText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#9CA3AF' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  rankBadge: { width: 28, alignItems: 'center' },
  rankText: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: '#9CA3AF' },
  tableName: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#374151' },
  tableSold: { width: 50, textAlign: 'center', fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151' },
  tableRevenue: { width: 80, textAlign: 'right', fontFamily: 'Poppins_700Bold', fontSize: 13, color: '#4289AB' },
  tableTrend: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
});
