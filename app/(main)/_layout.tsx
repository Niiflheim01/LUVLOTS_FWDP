import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="BiddingScreen" />
      <Stack.Screen name="AuctionDetailScreen" />
      <Stack.Screen name="ProductScreen" />
      <Stack.Screen name="MessagesScreen" />
      <Stack.Screen name="LuvlistScreen" />
      <Stack.Screen name="LiveSellingScreen" />
      <Stack.Screen name="CharityDetailScreen" />
      <Stack.Screen name="VouchersScreen" />
      <Stack.Screen name="BecomeAPartnerScreen" />
    </Stack>
  );
}
