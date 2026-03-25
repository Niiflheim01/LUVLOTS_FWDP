import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ConfirmPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isDisabled = !passwordsMatch;

  function handleSubmit() {
    router.replace('/(auth)/SignUp');
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
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Icon */}
              <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.iconCircle}>
                <ShieldCheck size={32} color="white" strokeWidth={1.5} />
              </Animated.View>

              {/* Title */}
              <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={styles.title}>
                Reset Password
              </Animated.Text>

              {/* Subtitle */}
              <Animated.Text entering={FadeInDown.delay(300).duration(600)} style={styles.subtitle}>
                Create a new secure password for your account.
              </Animated.Text>

              {/* New Password */}
              <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.inputWrapper}>
                <Lock size={20} color="rgba(255,255,255,0.6)" style={{ marginLeft: 18 }} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="New password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                  style={{ marginRight: 18 }}>
                  {showPassword ? (
                    <EyeOff size={20} color="rgba(255,255,255,0.6)" />
                  ) : (
                    <Eye size={20} color="rgba(255,255,255,0.6)" />
                  )}
                </Pressable>
              </Animated.View>

              {/* Confirm Password */}
              <Animated.View
                entering={FadeInDown.delay(500).duration(600)}
                style={[
                  styles.inputWrapper,
                  confirmPassword.length > 0 && !passwordsMatch && {
                    borderColor: 'rgba(229, 57, 53, 0.7)',
                  },
                  passwordsMatch && {
                    borderColor: 'rgba(76, 175, 80, 0.7)',
                  },
                ]}>
                <Lock size={20} color="rgba(255,255,255,0.6)" style={{ marginLeft: 18 }} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.input}
                  secureTextEntry={!showConfirm}
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit}
                />
                <Pressable
                  onPress={() => setShowConfirm(!showConfirm)}
                  hitSlop={8}
                  style={{ marginRight: 18 }}>
                  {showConfirm ? (
                    <EyeOff size={20} color="rgba(255,255,255,0.6)" />
                  ) : (
                    <Eye size={20} color="rgba(255,255,255,0.6)" />
                  )}
                </Pressable>
              </Animated.View>

              {confirmPassword.length > 0 && !passwordsMatch && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}

              {/* Submit button */}
              <Animated.View entering={FadeInDown.delay(600).duration(600)} style={{ width: '100%' }}>
                <Pressable
                  onPress={handleSubmit}
                  disabled={isDisabled}
                  style={({ pressed }) => [
                    styles.button,
                    { opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
                  ]}>
                  <LinearGradient
                    colors={['#3A7CA5', '#5BA4C4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}>
                    <Text style={styles.buttonText}>Reset Password</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 100,
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 28,
    height: 56,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: 'white',
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#FFCDD2',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: -4,
  },
  button: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginTop: 8,
  },
  buttonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: 'white',
    letterSpacing: 0.5,
  },
});
