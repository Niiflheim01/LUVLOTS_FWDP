import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react-native';
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

import React, { useState } from 'react';
import {
  Pressable,
  View,
  Text,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Password() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isDisabled = email.length === 0 || password.length === 0;

  function handleLogin() {
    router.replace('/(tabs)/(store)');
  }

  function handleForgotPassword() {
    router.push('/(auth)/Forgot');
  }

  return (
    <LinearGradient
      colors={['#4289AB', '#8FBBD8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={{ paddingTop: 60 }}>
              <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 28, color: '#fff' }}>
                Log In
              </Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
                Welcome back to LUVLOTS
              </Text>

              {/* White Card */}
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 24,
                marginTop: 28,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
              }}>
                {/* Email field */}
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#333', marginBottom: 8 }}>
                  Email
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: email ? '#4289AB' : '#E0E0E0',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 50,
                  backgroundColor: '#FAFAFA',
                  marginBottom: 16,
                }}>
                  <Mail size={18} color={email ? '#4289AB' : '#999'} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#BCBCBC"
                    style={{ flex: 1, marginLeft: 10, fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#333' }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </View>

                {/* Password field */}
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#333', marginBottom: 8 }}>
                  Password
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: password ? '#4289AB' : '#E0E0E0',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 50,
                  backgroundColor: '#FAFAFA',
                }}>
                  <Lock size={18} color={password ? '#4289AB' : '#999'} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#BCBCBC"
                    style={{ flex: 1, marginLeft: 10, fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#333' }}
                    secureTextEntry={!showPassword}
                    returnKeyType="send"
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                    {showPassword ? <EyeOff size={18} color="#999" /> : <Eye size={18} color="#999" />}
                  </Pressable>
                </View>

                <Pressable onPress={handleForgotPassword} style={{ alignSelf: 'flex-end', marginTop: 12 }}>
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#4289AB' }}>
                    Forgot Password?
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleLogin}
                  disabled={isDisabled}
                  style={{
                    backgroundColor: isDisabled ? '#B0D4E8' : '#4289AB',
                    borderRadius: 12,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                  }}>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#fff' }}>
                    Log In
                  </Text>
                </Pressable>
              </View>

              {/* OR Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 12 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' }} />
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  or continue with
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' }} />
              </View>

              {/* Social Login Buttons */}
              <View style={{ gap: 10, marginTop: 16 }}>
                <Pressable
                  onPress={handleLogin}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 })}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, backgroundColor: '#fff', gap: 12 }}>
                    <GoogleIcon size={20} />
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#333' }}>
                      Continue with Google
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={handleLogin}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, borderRadius: 14, shadowColor: '#1877F2', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 })}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, backgroundColor: '#1877F2', gap: 12 }}>
                    <FacebookIcon size={20} />
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#fff' }}>
                      Continue with Facebook
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* Sign Up Link */}
              <Pressable
                onPress={() => router.push('/(auth)/SignUp')}
                style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  Don't have an account?{' '}
                  <Text style={{ fontFamily: 'Poppins_700Bold', color: '#fff', textDecorationLine: 'underline' }}>
                    Sign Up
                  </Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
