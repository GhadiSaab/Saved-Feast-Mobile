import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { register, isLoading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const handleSignup = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !passwordConfirmation.trim()
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      // Navigation will be handled by AuthGuard
    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error.message || 'Please check your information and try again'
      );
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Logo and Title */}
          <View style={styles.logoSection}>
            <View
              style={[
                styles.logoContainer,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="leaf" size={48} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Join SavedFeast
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Create your account to start saving food and money
            </Text>
          </View>

          {/* Signup Form */}
          <Card style={styles.formCard} elevation={3}>
            {/* Name Fields */}
            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.text}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="First name"
                  placeholderTextColor={colors.text + '80'}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.text}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Last name"
                  placeholderTextColor={colors.text + '80'}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email address"
                placeholderTextColor={colors.text + '80'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color={colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Phone number (optional)"
                placeholderTextColor={colors.text + '80'}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCorrect={false}
              />
            </View>

            {/* Address */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Address (optional)"
                placeholderTextColor={colors.text + '80'}
                value={address}
                onChangeText={setAddress}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.text + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Password Confirmation */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm password"
                placeholderTextColor={colors.text + '80'}
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                secureTextEntry={!showPasswordConfirmation}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() =>
                  setShowPasswordConfirmation(!showPasswordConfirmation)
                }
              >
                <Ionicons
                  name={
                    showPasswordConfirmation ? 'eye-off-outline' : 'eye-outline'
                  }
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <Button
              title="Create Account"
              onPress={handleSignup}
              variant="primary"
              size="large"
              loading={isLoading}
              style={styles.signupButton}
            />
          </Card>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={[styles.loginText, { color: colors.text }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                Sign in here
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text }]}>
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  formCard: {
    marginBottom: 32,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 4,
  },
  signupButton: {
    marginTop: 8,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 18,
  },
});
