import { Redirect } from 'expo-router';

export default function MainIndex() {
  // Redirect to the main tabs when landing on (main)
  return <Redirect href="/(tabs)/(store)" />;
}
