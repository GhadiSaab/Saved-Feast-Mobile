import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from './ui/Button';
import { LoadingSpinner } from './LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  onAuthRequired?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  requireAuth = true,
  onAuthRequired,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isLoading } = useAuth();

  // Debug logging
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - isLoading:', isLoading);
  console.log('ProtectedRoute - requireAuth:', requireAuth);

  const _ = () => {
    if (onAuthRequired) {
      onAuthRequired();
    } else {
      Alert.alert(
        'Authentication Required',
        'Please log in to access this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') },
        ]
      );
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading..." fullScreen />;
  }

  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Authentication Required
        </Text>
        <Text style={[styles.message, { color: colors.text }]}>
          Please log in to access this feature.
        </Text>
        <Button
          title="Login"
          onPress={() => router.push('/(auth)/login')}
          variant="primary"
          style={styles.button}
        />
        <Button
          title="Sign Up"
          onPress={() => router.push('/(auth)/signup')}
          variant="outline"
          style={styles.button}
        />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  button: {
    marginBottom: 12,
    minWidth: 200,
  },
});
