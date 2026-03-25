import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Image, ImageSourcePropType, Pressable, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface SellerCardProps {
  name: string;
  type: string;
  source: ImageSourcePropType;
}

export default function SellerCard({ name, type, source }: SellerCardProps) {
  const router = useRouter();

  return (
    <View style={s.card}>
      <View style={s.leftRow}>
        <Image source={source} style={s.avatar} />
        <View>
          <Text style={s.name}>{name}</Text>
          <Text style={s.type}>{type}</Text>
        </View>
      </View>
      <Pressable
        onPress={() => router.push('/1')}
        style={s.viewBtn}>
        <Text style={s.viewBtnText}>View Store</Text>
        <ChevronRight size={18} color="#333" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 16,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  name: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#000',
  },
  type: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217,217,217,0.5)',
    borderRadius: 8,
    padding: 8,
  },
  viewBtnText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#333',
  },
});
