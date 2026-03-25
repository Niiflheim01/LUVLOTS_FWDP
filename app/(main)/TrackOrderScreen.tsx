import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, {
  Rect,
  Path,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  G,
} from 'react-native-svg';
import {
  ArrowLeft,
  MapPin,
  Package,
  CheckCircle2,
  Truck,
  Clock,
  Phone,
  MessageCircle,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const MAP_H = 260;

/** SVG map that looks like a real city delivery tracking map */
function CityMap() {
  const W = width;
  const H = MAP_H;

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <SvgGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#4289AB" stopOpacity="1" />
          <Stop offset="1" stopColor="#2C6F91" stopOpacity="1" />
        </SvgGradient>
      </Defs>

      {/* ── Background land ── */}
      <Rect x={0} y={0} width={W} height={H} fill="#EAE6DF" />

      {/* ── Water / bay (bottom-left, Roxas Blvd area) ── */}
      <Rect x={0} y={H * 0.55} width={W * 0.22} height={H * 0.45} fill="#C4DDE8" />
      <Rect x={0} y={H * 0.62} width={W * 0.28} height={H * 0.38} fill="#C4DDE8" />

      {/* ── City blocks ── */}
      {/* Row 1 */}
      <Rect x={W*0.05} y={H*0.06} width={W*0.16} height={H*0.12} rx={2} fill="#D8D3C8" />
      <Rect x={W*0.25} y={H*0.06} width={W*0.18} height={H*0.12} rx={2} fill="#DEDAD0" />
      <Rect x={W*0.48} y={H*0.06} width={W*0.14} height={H*0.12} rx={2} fill="#D8D3C8" />
      <Rect x={W*0.67} y={H*0.06} width={W*0.22} height={H*0.12} rx={2} fill="#DEDAD0" />

      {/* Row 2 */}
      <Rect x={W*0.05} y={H*0.26} width={W*0.12} height={H*0.14} rx={2} fill="#DEDAD0" />
      <Rect x={W*0.21} y={H*0.26} width={W*0.20} height={H*0.14} rx={2} fill="#D8D3C8" />
      <Rect x={W*0.46} y={H*0.26} width={W*0.16} height={H*0.14} rx={2} fill="#DEDAD0" />
      <Rect x={W*0.67} y={H*0.26} width={W*0.14} height={H*0.14} rx={2} fill="#D8D3C8" />
      <Rect x={W*0.85} y={H*0.26} width={W*0.12} height={H*0.14} rx={2} fill="#DEDAD0" />

      {/* Row 3 */}
      <Rect x={W*0.28} y={H*0.50} width={W*0.16} height={H*0.18} rx={2} fill="#D8D3C8" />
      <Rect x={W*0.49} y={H*0.50} width={W*0.18} height={H*0.18} rx={2} fill="#DEDAD0" />
      <Rect x={W*0.72} y={H*0.50} width={W*0.14} height={H*0.18} rx={2} fill="#D8D3C8" />
      <Rect x={W*0.90} y={H*0.50} width={W*0.10} height={H*0.18} rx={2} fill="#DEDAD0" />

      {/* Row 4 — bottom */}
      <Rect x={W*0.30} y={H*0.78} width={W*0.18} height={H*0.14} rx={2} fill="#DEDAD0" />
      <Rect x={W*0.54} y={H*0.78} width={W*0.20} height={H*0.14} rx={2} fill="#D8D3C8" />
      <Rect x={W*0.78} y={H*0.78} width={W*0.18} height={H*0.14} rx={2} fill="#DEDAD0" />

      {/* ── Road grid — secondary (thin, white) ── */}
      {/* Horizontals */}
      <Line x1={0} y1={H*0.20} x2={W} y2={H*0.20} stroke="#fff" strokeWidth={5} />
      <Line x1={0} y1={H*0.43} x2={W} y2={H*0.43} stroke="#fff" strokeWidth={5} />
      <Line x1={0} y1={H*0.70} x2={W} y2={H*0.70} stroke="#fff" strokeWidth={5} />
      {/* Verticals */}
      <Line x1={W*0.20} y1={0} x2={W*0.20} y2={H} stroke="#fff" strokeWidth={5} />
      <Line x1={W*0.45} y1={0} x2={W*0.45} y2={H} stroke="#fff" strokeWidth={5} />
      <Line x1={W*0.66} y1={0} x2={W*0.66} y2={H} stroke="#fff" strokeWidth={5} />
      <Line x1={W*0.87} y1={0} x2={W*0.87} y2={H} stroke="#fff" strokeWidth={5} />

      {/* ── Main roads (wider, slightly yellow-white) ── */}
      {/* Roxas Blvd (diagonal left edge) */}
      <Line x1={W*0.10} y1={0} x2={W*0.22} y2={H} stroke="#F5F0E8" strokeWidth={11} />
      {/* Taft Ave (vertical center-left) */}
      <Line x1={W*0.36} y1={0} x2={W*0.36} y2={H} stroke="#F5F0E8" strokeWidth={11} />
      {/* Horizontal main */}
      <Line x1={0} y1={H*0.56} x2={W} y2={H*0.56} stroke="#F5F0E8" strokeWidth={11} />

      {/* ── Route line (delivery path) ── */}
      <Path
        d={`M ${W*0.62} ${H*0.18}
            L ${W*0.62} ${H*0.43}
            L ${W*0.36} ${H*0.43}
            L ${W*0.36} ${H*0.56}
            L ${W*0.22} ${H*0.56}`}
        stroke="#4289AB"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="10,6"
        fill="none"
      />

      {/* ── Road labels ── */}
      <SvgText
        x={W*0.09} y={H*0.54}
        fontSize={7} fill="#888" fontWeight="bold"
        rotation={-72} originX={W*0.09} originY={H*0.54}>
        Roxas Blvd
      </SvgText>
      <SvgText x={W*0.38} y={H*0.13} fontSize={7} fill="#888" fontWeight="bold">
        Taft Ave
      </SvgText>
      <SvgText x={W*0.52} y={H*0.54} fontSize={7} fill="#888" fontWeight="bold">
        P. Faura St
      </SvgText>

      {/* ── Truck marker (current location) ── */}
      <G x={W*0.62 - 18} y={H*0.18 - 44}>
        {/* Shadow */}
        <Circle cx={18} cy={52} r={6} fill="rgba(0,0,0,0.12)" />
        {/* Pin body */}
        <Path
          d="M18 0 C8 0 0 8 0 18 C0 30 18 44 18 44 C18 44 36 30 36 18 C36 8 28 0 18 0Z"
          fill="#4289AB"
        />
        {/* Icon bg circle */}
        <Circle cx={18} cy={17} r={12} fill="#2C6F91" />
        {/* Truck icon (simplified SVG path) */}
        <Path
          d="M9 21 L9 13 L18 13 L18 11 L22 11 L26 15 L26 21 Z M11 21 L11 19 L13 19 L13 21 Z M21 21 L21 19 L23 19 L23 21 Z"
          fill="#fff"
          strokeWidth={0}
        />
      </G>

      {/* ── Destination pin (delivery address) ── */}
      <G x={W*0.22 - 14} y={H*0.56 - 38}>
        {/* Shadow */}
        <Circle cx={14} cy={44} r={5} fill="rgba(0,0,0,0.12)" />
        {/* Pin body */}
        <Path
          d="M14 0 C6 0 0 6 0 14 C0 23 14 34 14 34 C14 34 28 23 28 14 C28 6 22 0 14 0Z"
          fill="#E74C3C"
        />
        <Circle cx={14} cy={13} r={7} fill="#C0392B" />
        <Circle cx={14} cy={13} r={3.5} fill="#fff" />
      </G>

      {/* ── Compass rose (top-right) ── */}
      <G x={W - 36} y={10}>
        <Circle cx={13} cy={13} r={13} fill="rgba(255,255,255,0.85)" />
        <SvgText x={13} y={9} fontSize={7} fill="#666" textAnchor="middle" fontWeight="bold">N</SvgText>
        <SvgText x={13} y={21} fontSize={7} fill="#aaa" textAnchor="middle">S</SvgText>
        <SvgText x={5} y={16} fontSize={7} fill="#aaa" textAnchor="middle">W</SvgText>
        <SvgText x={22} y={16} fontSize={7} fill="#aaa" textAnchor="middle">E</SvgText>
        {/* North arrow */}
        <Path d="M13 4 L11 10 L13 9 L15 10 Z" fill="#4289AB" />
      </G>

      {/* ── Scale bar (bottom-right) ── */}
      <G x={W - 80} y={H - 20}>
        <Rect x={0} y={5} width={60} height={3} rx={1} fill="#888" />
        <SvgText x={0} y={4} fontSize={7} fill="#666">0</SvgText>
        <SvgText x={52} y={4} fontSize={7} fill="#666">1km</SvgText>
      </G>
    </Svg>
  );
}

const STEPS = [
  {
    key: 'placed',
    label: 'Order Placed',
    sub: 'Mar 18, 2026 · 3:20 PM',
    icon: CheckCircle2,
    done: true,
  },
  {
    key: 'processing',
    label: 'Processing',
    sub: 'Mar 18, 2026 · 4:45 PM',
    icon: Package,
    done: true,
  },
  {
    key: 'shipped',
    label: 'Out for Delivery',
    sub: 'Expected today',
    icon: Truck,
    done: false,
    active: true,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    sub: 'Expected Mar 23, 2026',
    icon: MapPin,
    done: false,
  },
];

export default function TrackOrderScreen() {
  const params = useLocalSearchParams<{
    orderNum?: string;
    title?: string;
    address?: string;
    total?: string;
    imageUri?: string;
  }>();

  const orderNum = params.orderNum ?? 'LV-17322714';
  const title = params.title ?? "It's Showtime Jacket";
  const address = params.address ?? '123 Roxas Boulevard, Malate, Manila';
  const total = params.total ?? '12,150';
  const imageUri =
    params.imageUri ??
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80';

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={s.headerWrap}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
            <ArrowLeft size={20} color="#fff" />
          </Pressable>
          <Text style={s.headerTitle}>Track Order</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}>

        {/* SVG Map */}
        <Animated.View entering={FadeIn.duration(500)} style={s.mapWrap}>
          <CityMap />
          {/* ETA badge */}
          <View style={s.etaBadge}>
            <Clock size={13} color="#4289AB" />
            <Text style={s.etaText}>ETA: 2–3 days</Text>
          </View>
        </Animated.View>

        {/* Current status banner */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={s.statusBanner}>
          <View style={s.statusLeft}>
            <View style={s.statusDot} />
            <View>
              <Text style={s.statusLabel}>Out for Delivery</Text>
              <Text style={s.statusSub}>Your item is on its way</Text>
            </View>
          </View>
          <View style={s.riderActions}>
            <Pressable style={s.actionBtn} hitSlop={8}>
              <Phone size={15} color="#4289AB" />
            </Pressable>
            <Pressable style={s.actionBtn} hitSlop={8}>
              <MessageCircle size={15} color="#4289AB" />
            </Pressable>
          </View>
        </Animated.View>

        {/* Order card */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={s.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Image source={{ uri: imageUri }} style={s.productImg} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={s.productTitle} numberOfLines={1}>{title}</Text>
              <Text style={s.orderNumText}>{orderNum}</Text>
              <Text style={s.totalText}>₱{total}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
            <MapPin size={14} color="#4289AB" style={{ marginTop: 1 }} />
            <Text style={s.addressText} numberOfLines={2}>{address}</Text>
          </View>
        </Animated.View>

        {/* Delivery timeline */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={s.card}>
          <Text style={s.sectionTitle}>Delivery Updates</Text>
          <View style={{ marginTop: 16 }}>
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === STEPS.length - 1;
              return (
                <View key={step.key} style={{ flexDirection: 'row', gap: 14 }}>
                  <View style={{ alignItems: 'center', width: 32 }}>
                    <View
                      style={[
                        s.stepIcon,
                        step.done && s.stepIconDone,
                        (step as any).active && s.stepIconActive,
                      ]}>
                      <Icon
                        size={13}
                        color={step.done || (step as any).active ? '#fff' : '#C0C0C0'}
                      />
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          s.stepLine,
                          step.done && s.stepLineDone,
                        ]}
                      />
                    )}
                  </View>
                  <View style={{ paddingBottom: isLast ? 0 : 22, flex: 1 }}>
                    <Text
                      style={[
                        s.stepLabel,
                        step.done && s.stepLabelDone,
                        (step as any).active && s.stepLabelActive,
                      ]}>
                      {step.label}
                    </Text>
                    <Text style={s.stepSub}>{step.sub}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  headerWrap: {
    backgroundColor: '#4289AB',
  },
  header: {
    backgroundColor: '#4289AB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#fff',
  },
  mapWrap: {
    width: '100%',
    height: MAP_H,
    overflow: 'hidden',
    position: 'relative',
  },
  etaBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  etaText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#4289AB',
  },
  statusBanner: {
    backgroundColor: '#fff',
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4289AB',
  },
  statusLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#1A2C3D',
  },
  statusSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  riderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#4289AB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF5FB',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  productImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F4F8',
  },
  productTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A2C3D',
  },
  orderNumText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  totalText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#4289AB',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F4F8',
    marginVertical: 12,
  },
  addressText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1A2C3D',
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: {
    backgroundColor: '#4289AB',
  },
  stepIconActive: {
    backgroundColor: '#2C6F91',
    shadowColor: '#4289AB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 2,
  },
  stepLineDone: {
    backgroundColor: '#4289AB',
  },
  stepLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 7,
  },
  stepLabelDone: {
    color: '#4289AB',
  },
  stepLabelActive: {
    color: '#2C6F91',
  },
  stepSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
