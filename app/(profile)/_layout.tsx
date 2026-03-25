import { Stack, router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#4289AB',
        },
        headerTintColor: 'white',
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={{ borderRadius: 20, padding: 4 }}>
            <ChevronLeft size={28} color="white" />
          </Pressable>
        ),
        headerTitleStyle: {
          color: 'white',
          fontWeight: '700',
          fontFamily: 'Poppins_600SemiBold',
          fontSize: 17,
        },
      }}>
      <Stack.Screen name="Profile" options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" options={{ headerShown: false }} />
      <Stack.Screen name="Settings" options={{ headerShown: false }} />
      <Stack.Screen name="Addresses" options={{ headerShown: false }} />
      <Stack.Screen name="AddAddress" options={{ headerShown: false }} />
      <Stack.Screen name="RegionPicker" options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="Purchase-History" options={{ title: 'Purchase History' }} />
      <Stack.Screen name="Auction-Calendar" options={{ title: 'Auction Calendar' }} />
      <Stack.Screen name="Winnings" options={{ title: 'My Winnings' }} />
    </Stack>
  );
}
