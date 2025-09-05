import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  // Settings state
  const [,] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleBack = () => {
    router.back();
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'This feature will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported and sent to your email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert(
              'Export Started',
              'Your data export has been initiated.'
            );
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data and free up storage space.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            Alert.alert('Cache Cleared', 'All cached data has been cleared.');
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Notifications',
      items: [
        {
          title: 'Push Notifications',
          subtitle: 'Receive notifications about orders and updates',
          type: 'switch',
          value: pushNotifications,
          onValueChange: setPushNotifications,
        },
        {
          title: 'Email Notifications',
          subtitle: 'Receive order confirmations and updates via email',
          type: 'switch',
          value: emailNotifications,
          onValueChange: setEmailNotifications,
        },
        {
          title: 'Marketing Emails',
          subtitle: 'Receive promotional offers and newsletters',
          type: 'switch',
          value: marketingEmails,
          onValueChange: setMarketingEmails,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          title: 'Location Services',
          subtitle: 'Allow app to access your location for nearby restaurants',
          type: 'switch',
          value: locationServices,
          onValueChange: setLocationServices,
        },
        {
          title: 'Biometric Authentication',
          subtitle: 'Use Face ID or Touch ID to sign in',
          type: 'switch',
          value: biometricAuth,
          onValueChange: setBiometricAuth,
        },
        {
          title: 'Change Password',
          subtitle: 'Update your account password',
          type: 'button',
          onPress: handleChangePassword,
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          title: 'Auto Refresh',
          subtitle: 'Automatically refresh content when app opens',
          type: 'switch',
          value: autoRefresh,
          onValueChange: setAutoRefresh,
        },
        {
          title: 'Clear Cache',
          subtitle: 'Free up storage space by clearing cached data',
          type: 'button',
          onPress: handleClearCache,
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          title: 'Export Data',
          subtitle: 'Download a copy of your data',
          type: 'button',
          onPress: handleExportData,
        },
        {
          title: 'Delete Account',
          subtitle: 'Permanently delete your account and all data',
          type: 'button',
          onPress: handleDeleteAccount,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Settings
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* User Info */}
        <Card style={styles.userCard} elevation={3}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.first_name?.charAt(0)?.toUpperCase()}
                {user?.last_name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={[styles.userEmail, { color: colors.text }]}>
                {user?.email}
              </Text>
            </View>
          </View>
        </Card>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} style={styles.sectionCard} elevation={3}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            {section.items.map((item, itemIndex) => (
              <View
                key={itemIndex}
                style={[
                  styles.settingItem,
                  itemIndex < section.items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: colors.text + '80' },
                    ]}
                  >
                    {item.subtitle}
                  </Text>
                </View>
                {item.type === 'switch' ? (
                  <Switch
                    value={(item as any).value || false}
                    onValueChange={(item as any).onValueChange || (() => {})}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={(item as any).value ? '#FFFFFF' : '#FFFFFF'}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={item.onPress || (() => {})}
                    style={[
                      styles.settingButton,
                      (item as any).destructive && {
                        backgroundColor: '#FF3B30',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.settingButtonText,
                        {
                          color: (item as any).destructive
                            ? '#FFFFFF'
                            : colors.primary,
                        },
                      ]}
                    >
                      {(item as any).destructive ? 'Delete' : 'Change'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </Card>
        ))}

        {/* App Info */}
        <Card style={styles.appInfoCard} elevation={3}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            App Information
          </Text>
          <View style={styles.appInfoRow}>
            <Text style={[styles.appInfoLabel, { color: colors.text }]}>
              Version
            </Text>
            <Text style={[styles.appInfoValue, { color: colors.text }]}>
              1.0.0
            </Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={[styles.appInfoLabel, { color: colors.text }]}>
              Build
            </Text>
            <Text style={[styles.appInfoValue, { color: colors.text }]}>
              2024.1
            </Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={[styles.appInfoLabel, { color: colors.text }]}>
              Platform
            </Text>
            <Text style={[styles.appInfoValue, { color: colors.text }]}>
              iOS
            </Text>
          </View>
        </Card>

        {/* Legal Links */}
        <Card style={styles.legalCard} elevation={3}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Legal
          </Text>
          <TouchableOpacity style={styles.legalItem}>
            <Text style={[styles.legalText, { color: colors.primary }]}>
              Terms of Service
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalItem}>
            <Text style={[styles.legalText, { color: colors.primary }]}>
              Privacy Policy
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalItem}>
            <Text style={[styles.legalText, { color: colors.primary }]}>
              Cookie Policy
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  userCard: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  settingButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  appInfoCard: {
    marginBottom: 16,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  appInfoLabel: {
    fontSize: 16,
  },
  appInfoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  legalCard: {
    marginBottom: 24,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  legalText: {
    fontSize: 16,
  },
});
