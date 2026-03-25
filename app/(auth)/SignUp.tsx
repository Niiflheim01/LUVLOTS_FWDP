import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Eye, EyeOff, Mail, User, Lock } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <Image
      source={require('@/assets/images/icons/facebook.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const isDisabled =
    email.trim().length === 0 || username.trim().length === 0 || password.length < 8;

  function handleSignUp() {
    router.replace('/(tabs)/(store)');
  }

  function handleGoToLogin() {
    router.push('/(auth)/Password');
  }

  function handleSocialSignUp(provider: string) {
    router.replace('/(tabs)/(store)');
  }

  return (
    <LinearGradient
      colors={['#4289AB', '#6DAFC8', '#8FBBD8']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Logo + Brand */}
            <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.logoArea}>
              <Image
                source={require('@/assets/images/Logo_noBG.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.brandTitle}>Create Account</Text>
              <Text style={styles.brandSubtitle}>Join the star-studded marketplace.</Text>
            </Animated.View>

            {/* Email Input */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <View style={styles.inputContainer}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>
            </Animated.View>

            {/* Username Input */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <View style={styles.inputContainer}>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.input}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>
            </Animated.View>

            {/* Password Input */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <View style={styles.inputContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password (min 8 characters)"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.input}
                  secureTextEntry
                  returnKeyType="send"
                  onSubmitEditing={handleSignUp}
                />
              </View>
            </Animated.View>

            {/* Sign Up Button */}
            <Animated.View entering={FadeInDown.delay(500).duration(500)}>
              <Pressable
                onPress={handleSignUp}
                disabled={isDisabled}
                style={({ pressed }) => [
                  styles.signUpButton,
                  isDisabled && { opacity: 0.5 },
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.15)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signUpButtonGradient}>
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* OR Divider */}
            <Animated.View entering={FadeInDown.delay(550).duration(500)} style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            {/* Social Sign Up Buttons */}
            <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.socialContainer}>
              <Pressable
                onPress={() => handleSocialSignUp('google')}
                style={styles.socialButton}>
                <GoogleIcon size={20} />
                <Text style={styles.socialText}>Continue with Google</Text>
              </Pressable>

              <Pressable
                onPress={() => handleSocialSignUp('facebook')}
                style={styles.socialButtonFacebook}>
                <FacebookIcon size={20} />
                <Text style={styles.socialTextFacebook}>Continue with Facebook</Text>
              </Pressable>
            </Animated.View>

            {/* Already have account */}
            <Animated.View entering={FadeInDown.delay(700).duration(500)}>
              <Pressable onPress={handleGoToLogin} style={styles.loginLink}>
                <Text style={styles.loginLinkText}>
                  Already have an account?{' '}
                  <Text style={{ fontFamily: 'Poppins_700Bold', textDecorationLine: 'underline' }}>
                    Log In
                  </Text>
                </Text>
              </Pressable>
            </Animated.View>

            {/* Terms */}
            <View style={styles.terms}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={{ textDecorationLine: 'underline', color: '#fff' }}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={{ textDecorationLine: 'underline', color: '#fff' }}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  logoArea: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  brandTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#fff',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 14,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 28,
    height: 52,
    paddingHorizontal: 22,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  signUpButton: {
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 4,
  },
  signUpButtonGradient: {
    height: 52,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  signUpButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 16,
  },
  socialContainer: {
    gap: 12,
    width: '100%',
    alignSelf: 'stretch',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  socialButtonFacebook: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#1877F2',
    gap: 12,
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  socialText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#333',
  },
  socialTextFacebook: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  loginLinkText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  terms: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  termsText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
