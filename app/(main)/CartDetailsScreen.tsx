import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingCart, Star, CheckCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';

export default function CartDetailsScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => setModalVisible(!isModalVisible);

  return (
    <LinearGradient
      colors={['#4289AB', '#8FBBD8']}
      start={{ x: 1, y: 0.1 }}
      end={{ x: 0.6, y: 0.3 }}
      style={cd.root}>
      <SafeAreaView style={{ flex: 1, gap: 16 }}>
        <View style={{ position: 'relative' }}>
          <View>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80' }}
              style={{ width: '100%', height: 240, borderRadius: 12 }}
              resizeMode="cover"
            />
            <View style={cd.bestSellerBadge}>
              <Star size={14} fill={'#F7D858'} stroke={'#F7D858'} />
              <Text style={cd.badgeText}>Best Seller Item</Text>
            </View>
          </View>
          <View>
            <Text style={cd.title}>Retro Jacket</Text>
            <Text style={cd.priceLabel}>
              Current Price <Text style={cd.priceValue}>$150.00</Text>
            </Text>
          </View>
        </View>

        <View style={cd.descCard}>
          <View style={cd.descHeader}>
            <Text style={cd.semibold}>Description</Text>
            <TouchableOpacity>
              <Text style={cd.baseText}>All Details</Text>
            </TouchableOpacity>
          </View>

          <Text style={cd.baseText}>
            Channel timeless style with this retro jacket, featuring classic designs and bold
            vintage flair. A perfect blend of nostalgia and modern comfort.
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={cd.smallSemibold}>Kathryn Bernardo</Text>
              <Text style={cd.mutedText}>Celebrity</Text>
            </View>
            <View>
              <Text style={cd.smallSemibold}>2022</Text>
              <Text style={cd.mutedText}>Year</Text>
            </View>
          </View>
        </View>

        <View>
          <View style={cd.descHeader}>
            <Text style={cd.xlSemibold}>More Items</Text>
            <TouchableOpacity>
              <Text style={cd.baseText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80' }} style={cd.thumbImg} />
            <Image source={{ uri: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80' }} style={cd.thumbImg} />
            <Image source={{ uri: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80' }} style={cd.thumbImg} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={toggleModal} style={cd.addToCartBtn}>
            <ShoppingCart stroke="white" size={16} />
            <Text style={{ color: '#fff', fontFamily: 'Poppins_400Regular' }}>Add To Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cd.buyNowBtn}>
            <Text style={{ textAlign: 'center', fontFamily: 'Poppins_400Regular' }}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        onSwipeComplete={toggleModal}
        swipeDirection="down">
        <View style={cd.modalContent}>
          <CheckCircle size={80} color="#4289AB" />

          <Text style={cd.modalTitle}>Your Item has been added to Cart!</Text>
          <Text style={cd.modalSubtitle}>
            Please confirm this in your cart to proceed to checkout.
          </Text>

          <TouchableOpacity style={cd.modalBtn} onPress={toggleModal}>
            <Text style={cd.modalBtnText}>Back to Item</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const cd = StyleSheet.create({
  root: { flex: 1, padding: 24 },
  bestSellerBadge: {
    position: 'absolute',
    right: 24,
    top: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 8,
  },
  badgeText: { fontFamily: 'Poppins_400Regular', fontSize: 13 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: '#000', textAlign: 'left' },
  priceLabel: { fontFamily: 'Poppins_400Regular', fontSize: 14 },
  priceValue: { fontFamily: 'Poppins_600SemiBold' },
  descCard: {
    gap: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  semibold: { fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  baseText: { fontFamily: 'Poppins_400Regular', fontSize: 14 },
  smallSemibold: { fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  mutedText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  xlSemibold: { fontFamily: 'Poppins_600SemiBold', fontSize: 20 },
  thumbImg: { width: 80, height: 80, borderRadius: 6 },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 9999,
    backgroundColor: '#000',
    padding: 12,
  },
  buyNowBtn: { flex: 1, borderRadius: 9999, backgroundColor: '#fff', padding: 12, justifyContent: 'center' },
  modalContent: { alignItems: 'center', gap: 16, borderRadius: 16, backgroundColor: '#fff', padding: 24 },
  modalTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, textAlign: 'center' },
  modalSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  modalBtn: { width: '100%', borderRadius: 9999, backgroundColor: '#000', paddingVertical: 12 },
  modalBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#fff', textAlign: 'center' },
});
