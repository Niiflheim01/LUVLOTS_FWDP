import { Stack } from 'expo-router';

export default function SellerDashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Products" />
      <Stack.Screen name="Orders" />
      <Stack.Screen name="Analytics" />
      <Stack.Screen name="AddProduct" />
    </Stack>
  );
}
