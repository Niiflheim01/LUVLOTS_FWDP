import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

type ProfileNavCardProps = {
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
};

export default function ProfileNavCard({ label, Icon }: ProfileNavCardProps) {
  return (
    <View style={s.card}>
      <View style={s.iconBox}>
        <Icon size={20} color="black" />
      </View>
      <View style={s.labelWrap}>
        <Text style={s.label}>{label}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
    backgroundColor: '#4289AB',
    padding: 24,
  },
  iconBox: {
    position: 'absolute',
    left: 24,
    borderRadius: 8,
    backgroundColor: '#FDE047',
    padding: 12,
  },
  labelWrap: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#000',
  },
});
