import { Stack, router } from 'expo-router';
import { Pressable } from 'react-native';
import { View, Image } from 'react-native';
import { ChevronLeftIcon } from 'lucide-react-native';

export default function DonationLayout() {
  return (
     <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerBackVisible: false,
        headerTransparent: true,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ marginRight: 16, borderRadius: 12, backgroundColor: '#000', padding: 8 }}>
            <ChevronLeftIcon size={24} color={'white'} />
          </Pressable>
        ),
      }}></Stack>
  );
}
