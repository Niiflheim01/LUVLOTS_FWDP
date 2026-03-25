import { useState } from 'react';
import { View, Text, Image, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, Settings } from 'lucide-react-native';
import EditBidModal from './EditBidModal';

type Props = {
  title: string;
  price: number;
  image: any;
  timeRemaining?: string;
  ended?: boolean;
  won?: boolean;
  onLike?: () => void;
  onOptions?: () => void;
};

export default function AuctionCard({
  title,
  price,
  image,
  timeRemaining,
  ended,
  won,
  onLike,
  onOptions,
}: Props) {
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <View style={s.container}>
      <Image source={image} style={s.image} resizeMode="cover" />

      {timeRemaining && !ended && (
        <View style={s.timeBadge}>
          <Text style={s.timeBadgeText}>{timeRemaining}</Text>
        </View>
      )}

      {ended && (
        <View style={s.timeBadge}>
          <Text style={s.timeBadgeText}>Auction Ended</Text>
        </View>
      )}

      <View style={s.actionRow}>
        <Pressable onPress={onLike} style={s.actionBtn}>
          <Heart size={16} stroke="black" />
        </Pressable>
        <Pressable onPress={onOptions} style={s.actionBtn}>
          <Settings size={16} stroke="black" />
        </Pressable>
      </View>

      <View style={s.infoBar}>
        <View>
          <Text style={s.infoTitle}>{title}</Text>
          <Text style={s.infoPrice}>₱{price.toFixed(2)}</Text>
        </View>

        {ended ? (
          won ? (
            <View style={s.wonBadge}>
              <Text style={s.wonText}>You've won this bid!</Text>
            </View>
          ) : null
        ) : (
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={s.editBtn}>
            <Text style={s.editBtnText}>Edit Bid</Text>
          </TouchableOpacity>
        )}
      </View>
      <EditBidModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  timeBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeBadgeText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#fff',
  },
  actionRow: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 8,
  },
  infoBar: {
    marginTop: -48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: '#000',
    padding: 16,
  },
  infoTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  infoPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  wonBadge: {
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  wonText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#166534',
  },
  editBtn: {
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#000',
  },
});
