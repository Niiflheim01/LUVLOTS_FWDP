import { Stack, router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

export default function SellerRegistrationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTransparent: true,
        headerTitleAlign: 'center',
        headerTintColor: 'white',
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={{ borderRadius: 9999, padding: 4 }}>
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
      <Stack.Screen
        name="Welcome"
        options={{
          title: 'Welcome to LUVLOTS!',
        }}
      />
      <Stack.Screen
        name="ShopInfo"
        options={{
          title: 'Shop Information',
        }}
      />
      <Stack.Screen
        name="BusinessInfo"
        options={{
          title: 'Business Information',
        }}
      />
      <Stack.Screen
        name="Success"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
