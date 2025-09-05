import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Privacy Policy</ThemedText>
          <ThemedText style={styles.lastUpdated}>
            Last updated: March 2025
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            1. Information We Collect
          </ThemedText>
          <ThemedText style={styles.text}>
            We collect information you provide directly to us, such as when you
            create an account, place an order, or contact us. This may include
            your name, email address, phone number, and payment information.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            2. How We Use Your Information
          </ThemedText>
          <ThemedText style={styles.text}>
            We use the information we collect to provide, maintain, and improve
            our services, process your orders, communicate with you, and
            personalize your experience.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            3. Information Sharing
          </ThemedText>
          <ThemedText style={styles.text}>
            We do not sell, trade, or otherwise transfer your personal
            information to third parties without your consent, except as
            described in this policy or as required by law.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>4. Data Security</ThemedText>
          <ThemedText style={styles.text}>
            We implement appropriate security measures to protect your personal
            information against unauthorized access, alteration, disclosure, or
            destruction.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            5. Location Services
          </ThemedText>
          <ThemedText style={styles.text}>
            We may collect location information to help you find nearby
            restaurants and provide location-based services. You can control
            location permissions in your device settings.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            6. Cookies and Tracking
          </ThemedText>
          <ThemedText style={styles.text}>
            We use cookies and similar technologies to enhance your experience,
            analyze usage patterns, and provide personalized content and
            advertisements.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            7. Third-Party Services
          </ThemedText>
          <ThemedText style={styles.text}>
            Our app may contain links to third-party services. We are not
            responsible for the privacy practices of these external services.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            8. Children&apos;s Privacy
          </ThemedText>
          <ThemedText style={styles.text}>
            Our service is not intended for children under 13. We do not
            knowingly collect personal information from children under 13.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>9. Your Rights</ThemedText>
          <ThemedText style={styles.text}>
            You have the right to access, update, or delete your personal
            information. You may also opt out of certain communications and data
            collection practices.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            10. Changes to This Policy
          </ThemedText>
          <ThemedText style={styles.text}>
            We may update this privacy policy from time to time. We will notify
            you of any material changes by posting the new policy in the app.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>11. Contact Us</ThemedText>
          <ThemedText style={styles.text}>
            If you have any questions about this Privacy Policy, please contact
            us at privacy@savedfeast.com
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
