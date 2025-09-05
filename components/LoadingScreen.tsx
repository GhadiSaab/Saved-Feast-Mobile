import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View
          style={[styles.iconContainer, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="leaf" size={48} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>SavedFeast</Text>
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
        <View style={styles.spinner}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
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
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  spinner: {
    transform: [{ rotate: '0deg' }],
  },
});
