import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Mail, ArrowRight } from 'lucide-react-native';
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

export default function Forgot() {
  const [email, setEmail] = useState('');
  const isDisabled = email.trim().length === 0;

  function handleNextPress() {
    router.push({
      pathname: '/(auth)/Confirm-Password',
      params: { email: email.trim() },
    });
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
                <Mail size={32} color="white" strokeWidth={1.5} />
              </Animated.View>

              {/* Title */}
              <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={styles.title}>
                Forgot Password?
              </Animated.Text>

              {/* Subtitle */}
              <Animated.Text entering={FadeInDown.delay(300).duration(600)} style={styles.subtitle}>
                No worries! Enter your email address and we'll send you a link to reset your password.
              </Animated.Text>

              {/* Email input */}
              <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.inputWrapper}>
                <Mail size={20} color="rgba(255,255,255,0.6)" style={{ marginLeft: 18 }} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="send"
                  onSubmitEditing={handleNextPress}
                />
              </Animated.View>

              {/* Submit button */}
              <Animated.View entering={FadeInDown.delay(500).duration(600)} style={{ width: '100%' }}>
                <Pressable
                  onPress={handleNextPress}
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
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                    <ArrowRight size={18} color="white" />
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              {/* Back to login */}
              <Animated.View entering={FadeInDown.delay(600).duration(600)}>
                <Pressable onPress={() => router.back()} hitSlop={8}>
                  <Text style={styles.backText}>
                    ← Back to <Text style={{ fontFamily: 'Poppins_700Bold' }}>Log In</Text>
                  </Text>
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
    gap: 20,
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
    paddingHorizontal: 10,
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
    paddingRight: 18,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: 'white',
  },
  button: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonGradient: {
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: 'white',
    letterSpacing: 0.5,
  },
  backText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
});
