import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="BiddingScreen" />
      <Stack.Screen name="ProductScreen" />
      <Stack.Screen name="MessagesScreen" />
      <Stack.Screen name="WishlistScreen" />
      <Stack.Screen name="CartDetailsScreen" />
      <Stack.Screen name="CharityScreen" />
      <Stack.Screen name="CheckoutScreen" />
      <Stack.Screen name="LiveSellingScreen" />
      <Stack.Screen name="CharityDetailScreen" />
      <Stack.Screen name="TrackOrderScreen" />
    </Stack>
  );
}
