import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TermsOfServiceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Terms of Service</ThemedText>
          <ThemedText style={styles.lastUpdated}>Last updated: March 2025</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>1. Acceptance of Terms</ThemedText>
          <ThemedText style={styles.text}>
            By accessing and using the SavedFeast mobile application, you accept and agree to be bound by the terms and provision of this agreement.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>2. Description of Service</ThemedText>
          <ThemedText style={styles.text}>
            SavedFeast is a food delivery platform that connects users with local restaurants to order meals for pickup. Our service allows users to browse available meals, place orders, and manage their food preferences.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>3. User Accounts</ThemedText>
          <ThemedText style={styles.text}>
            You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>4. Ordering and Payment</ThemedText>
          <ThemedText style={styles.text}>
            All orders are subject to availability. Prices are subject to change without notice. Payment is processed at the time of order placement. We reserve the right to refuse or cancel any order.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>5. Pickup and Delivery</ThemedText>
          <ThemedText style={styles.text}>
            Orders must be picked up within the specified time window. We are not responsible for orders not picked up within the designated time. Food quality and safety are the responsibility of the restaurant.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>6. Cancellation Policy</ThemedText>
          <ThemedText style={styles.text}>
            Orders may be cancelled up to 30 minutes before the pickup time. Late cancellations may result in charges. Refunds are processed according to our refund policy.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>7. User Conduct</ThemedText>
          <ThemedText style={styles.text}>
            You agree not to use the service for any unlawful purpose or to solicit others to perform unlawful acts. You must not harass, abuse, or harm other users or restaurant staff.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>8. Intellectual Property</ThemedText>
          <ThemedText style={styles.text}>
            The content, features, and functionality of the SavedFeast app are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>9. Limitation of Liability</ThemedText>
          <ThemedText style={styles.text}>
            We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service or any products ordered through it.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>10. Changes to Terms</ThemedText>
          <ThemedText style={styles.text}>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified terms.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>11. Contact Information</ThemedText>
          <ThemedText style={styles.text}>
            If you have any questions about these Terms of Service, please contact us at support@savedfeast.com
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
});
