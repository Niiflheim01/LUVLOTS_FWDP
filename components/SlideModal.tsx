import React from 'react';
import { View } from 'react-native';
import Modal from 'react-native-modal';

type SlideModalProps = {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function SlideModal({ isVisible, onClose, children }: SlideModalProps) {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={{ justifyContent: 'flex-end', margin: 0 }}>
      <View style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#fff', padding: 24 }}>{children}</View>
    </Modal>
  );
}
