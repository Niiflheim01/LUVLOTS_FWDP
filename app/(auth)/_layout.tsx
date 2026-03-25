import { Stack, router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

export default function AuthLayout() {
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
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          animation: 'none',
        }}
      />
      <Stack.Screen
        name="Onboarding"
        options={{
          headerShown: false,
          animation: 'none',
        }}
      />
      <Stack.Screen
        name="SignUp"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Password"
        options={{
          title: 'Log In',
        }}
      />
      <Stack.Screen
        name="SetPassword"
        options={{
          title: 'Sign Up',
        }}
      />
      <Stack.Screen
        name="Forgot"
        options={{
          title: 'Forgot Password',
        }}
      />
      <Stack.Screen
        name="Confirm-Password"
        options={{
          title: 'Reset Password',
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
