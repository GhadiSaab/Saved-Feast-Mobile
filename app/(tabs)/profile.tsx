import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ProfileTabScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Settings state - these will be used in future settings implementation
  // const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  // const [emailNotifications, setEmailNotifications] = useState(true);
  // const [pushNotifications, setPushNotifications] = useState(true);
  // const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/(auth)/login');
          } catch (error) {
            console.error('Logout error:', error);
            router.replace('/(auth)/login');
          }
        },
      },
    ]);
  };

  const handleFavorites = () => {
    Alert.alert(
      'Favorites',
      'Your favorite meals will appear here. Like meals while browsing to save them for later!',
      [{ text: 'OK' }]
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications',
      'Manage your notification preferences to stay updated on orders, promotions, and new meals.',
      [{ text: 'OK' }]
    );
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'Need help? Contact our support team at support@savedfeast.com or call us at 1-800-SAVED-FEAST.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Contact Support',
          onPress: () => {
            // In a real app, this would open email or phone
            Alert.alert('Support', 'Opening support contact...');
          },
        },
      ]
    );
  };

  const handleTermsOfService = () => {
    router.push('/terms-of-service');
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const menuItems = [
    {
      icon: 'receipt-outline',
      title: 'My Orders',
      subtitle: 'View your order history and track current orders',
      onPress: () => router.push('/orders'),
      showChevron: true,
    },
    {
      icon: 'heart-outline',
      title: 'Favorites',
      subtitle: 'Your saved favorite meals',
      onPress: handleFavorites,
      showChevron: true,
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      onPress: handleNotifications,
      showChevron: true,
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences and customization',
      onPress: handleSettings,
      showChevron: true,
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: handleHelpSupport,
      showChevron: true,
    },
    {
      icon: 'document-text-outline',
      title: 'Terms of Service',
      subtitle: 'Read our terms and conditions',
      onPress: handleTermsOfService,
      showChevron: false,
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Privacy Policy',
      subtitle: 'Learn about our privacy practices',
      onPress: handlePrivacyPolicy,
      showChevron: false,
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.notAuthenticatedContainer}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="person-outline" size={48} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Welcome to SavedFeast
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Please log in to access your profile and manage your account.
            </Text>
            <Button
              title="Login"
              onPress={() => router.push('/(auth)/login')}
              variant="primary"
              size="large"
              style={styles.loginButton}
            />
            <Button
              title="Sign Up"
              onPress={() => router.push('/(auth)/signup')}
              variant="outline"
              size="large"
              style={styles.signupButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Profile
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/profile')}
            >
              <Ionicons name="pencil" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard} elevation={3}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user.first_name?.charAt(0)?.toUpperCase()}
                {user.last_name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user.first_name} {user.last_name}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.text }]}>
                {user.email}
              </Text>
            </View>
          </View>

          {/* Profile Details */}
          <View style={styles.profileDetails}>
            {user.phone && (
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={20} color={colors.text} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {user.phone}
                </Text>
              </View>
            )}
            {user.address && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={colors.text}
                />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {user.address}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard} elevation={3}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/orders')}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons name="receipt-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Orders
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={handleFavorites}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Favorites
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={handleNotifications}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Notifications
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Menu Items */}
        <Card style={styles.menuCard} elevation={3}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={colors.text}
                />
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.menuItemSubtitle,
                      { color: colors.text + '80' },
                    ]}
                  >
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              {item.showChevron && (
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.text}
                />
              )}
            </TouchableOpacity>
          ))}
        </Card>

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
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          size="large"
          style={styles.logoutButton}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  loginButton: {
    marginBottom: 12,
    width: '100%',
  },
  signupButton: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  editButton: {
    padding: 8,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  profileDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
  },
  quickActionsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  menuCard: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
  },
  appInfoCard: {
    marginBottom: 24,
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
  logoutButton: {
    marginBottom: 24,
  },
});
