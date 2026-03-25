import { View, Image, Pressable, Text, StyleSheet, Share } from 'react-native';
import { useState } from 'react';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Share2, ChevronLeft, CheckCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function DonationItem() {
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => setModalVisible(!isModalVisible);

  return (
    <LinearGradient
      colors={['#4289AB', '#6DAFC8', '#8FBBD8']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.navBtn}>
            <ChevronLeft size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerRight}>
            <Pressable style={styles.navBtn}>
              <Heart size={18} color="#fff" />
            </Pressable>
            <Pressable style={styles.navBtn} onPress={() => Share.share({ message: 'Support Save The Earth on luvlots Charity! Every donation counts.', title: 'Save The Earth' })}>
              <Share2 size={18} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Image */}
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80' }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.card}>
          <Text style={styles.cardTitle}>Save The Earth</Text>

          <View style={styles.cardRow}>
            <Text style={styles.label}>Description</Text>
            <Pressable>
              <Text style={styles.linkText}>All Details</Text>
            </Pressable>
          </View>

          <Text style={styles.description}>
            Protecting Mother Earth means caring for our environment and natural
            resources. Simple actions like reducing waste...
          </Text>

          {/* Organizer */}
          <View style={styles.organizerRow}>
            <View style={styles.organizerAvatar}>
              <Text style={styles.organizerInitial}>GP</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.organizerName}>Greenpeace</Text>
              <Text style={styles.verifiedText}>Verified Organizer</Text>
            </View>
            <Text style={styles.yearText}>2022</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <Text style={styles.label}>Progress</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>Raised: ₱10,000</Text>
              <Text style={styles.progressText}>Target: ₱50,000</Text>
            </View>
          </View>
        </Animated.View>

        {/* Donate Button */}
        <View style={styles.bottomBar}>
          <Pressable onPress={toggleModal}>
            <LinearGradient
              colors={['#3A7CA5', '#5BA4C4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.donateButton}>
              <Text style={styles.donateButtonText}>Donate Now</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Success Modal */}
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={toggleModal}
          onSwipeComplete={toggleModal}
          swipeDirection="down">
          <View style={styles.modal}>
            <CheckCircle size={72} color="#4289AB" />
            <Text style={styles.modalTitle}>Your Item has been added to Cart!</Text>
            <Text style={styles.modalSubtitle}>
              Please confirm this in your cart to proceed to checkout.
            </Text>
            <Pressable onPress={toggleModal} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Back to Item</Text>
            </Pressable>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginHorizontal: 0,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#222',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#333',
  },
  linkText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4289AB',
    textDecorationLine: 'underline',
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#666',
    lineHeight: 21,
    marginBottom: 16,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    marginBottom: 16,
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerInitial: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#fff',
  },
  organizerName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#333',
  },
  verifiedText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#4CAF50',
  },
  yearText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#999',
  },
  progressSection: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#999',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  donateButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donateButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#fff',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 14,
  },
  modalImage: {
    width: 120,
    height: 120,
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#222',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4289AB',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#fff',
  },
});
