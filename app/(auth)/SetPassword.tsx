import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Lock, Eye, EyeOff, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function RequirementRow({ label, met }: { label: string; met: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: met ? '#4CAF50' : '#E0E0E0',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {met && <Check size={10} color="#fff" />}
      </View>
      <Text
        style={{
          fontFamily: 'Poppins_400Regular',
          fontSize: 12,
          color: met ? '#4CAF50' : '#999',
        }}>
        {label}
      </Text>
    </View>
  );
}

export default function SetPassword() {
  const { identifier } = useLocalSearchParams<{ identifier: string }>();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const hasMinLength = password.length >= 8 && password.length <= 16;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const isValid = hasMinLength && hasUpperCase && hasLowerCase;
  const isDisabled = password.length === 0 || !isValid;

  function handleSignUp() {
    if (!isValid) {
      setError('Please meet all password requirements.');
      return;
    }
    router.replace('/(tabs)/(store)');
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
            <View style={{ paddingTop: 80 }}>
              <Text
                style={{
                  fontFamily: 'Poppins_700Bold',
                  fontSize: 26,
                  color: '#fff',
                }}>
                Create Account
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins_400Regular',
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.6)',
                  marginTop: 4,
                }}>
                Set a secure password for your account
              </Text>

              {/* White Card */}
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 20,
                  padding: 24,
                  marginTop: 32,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 5,
                }}>
                <Text
                  style={{
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: 13,
                    color: '#333',
                    marginBottom: 8,
                  }}>
                  Password
                </Text>
                <View
                  style={{
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
                    onChangeText={(text) => {
                      setPassword(text);
                      setError('');
                    }}
                    placeholder="Create a password"
                    placeholderTextColor="#BCBCBC"
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      fontFamily: 'Poppins_400Regular',
                      fontSize: 14,
                      color: '#333',
                    }}
                    secureTextEntry={!showPassword}
                    returnKeyType="send"
                    onSubmitEditing={handleSignUp}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                    {showPassword ? (
                      <EyeOff size={18} color="#999" />
                    ) : (
                      <Eye size={18} color="#999" />
                    )}
                  </Pressable>
                </View>

                {/* Requirements */}
                <View style={{ marginTop: 14 }}>
                  <RequirementRow label="8–16 characters" met={hasMinLength} />
                  <RequirementRow label="One uppercase letter" met={hasUpperCase} />
                  <RequirementRow label="One lowercase letter" met={hasLowerCase} />
                </View>

                {error ? (
                  <Text
                    style={{
                      fontFamily: 'Poppins_400Regular',
                      fontSize: 12,
                      color: '#E53935',
                      marginTop: 8,
                    }}>
                    {error}
                  </Text>
                ) : null}

                {/* Sign Up Button */}
                <Pressable
                  onPress={handleSignUp}
                  disabled={isDisabled}
                  style={{
                    backgroundColor: isDisabled ? '#B0D4E8' : '#4289AB',
                    borderRadius: 12,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 24,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins_600SemiBold',
                      fontSize: 15,
                      color: '#fff',
                    }}>
                    Sign Up
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
