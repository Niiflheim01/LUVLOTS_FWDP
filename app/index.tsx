import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to onboarding on first launch
  return <Redirect href="/(auth)" />;
}
