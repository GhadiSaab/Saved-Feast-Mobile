import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
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
import { LoadingSpinner } from '@/components/LoadingSpinner';
import api from '@/lib/api';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const {
    user: authUser,
    isAuthenticated,
    isLoading: authLoading,
    refreshUser,
    logout,
  } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Load user data when component mounts or auth state changes
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading user data in profile screen...');

        if (!isAuthenticated || !authUser) {
          console.log('Not authenticated, redirecting to login');
          router.replace('/(auth)/login');
          return;
        }

        // Use auth context user data
        setUser(authUser);
        setFormData({
          first_name: authUser.first_name || '',
          last_name: authUser.last_name || '',
          email: authUser.email || '',
          phone: authUser.phone || '',
          address: authUser.address || '',
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadUserData();
    }
  }, [authUser, isAuthenticated, authLoading]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      console.log('Saving profile...');

      const response = await api.post('/user/profile', {
        name: `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email,
      });

      const updatedUser = response.data.user;
      setUser(updatedUser);
      setIsEditing(false);

      // Refresh user data in auth context
      await refreshUser();

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Profile save error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleRefresh = async () => {
    try {
      console.log('Refreshing profile...');
      await refreshUser();
      Alert.alert('Success', 'Profile refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert('Error', 'Failed to refresh profile');
    }
  };

  const menuItems = [
    {
      icon: 'receipt-outline',
      title: 'My Orders',
      onPress: () => router.push('/orders'),
    },
    {
      icon: 'heart-outline',
      title: 'Favorites',
      onPress: () =>
        Alert.alert('Coming Soon', 'Favorites feature will be available soon!'),
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      onPress: () =>
        Alert.alert(
          'Coming Soon',
          'Notifications settings will be available soon!'
        ),
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      onPress: () =>
        Alert.alert('Coming Soon', 'Settings will be available soon!'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () =>
        Alert.alert('Coming Soon', 'Help & Support will be available soon!'),
    },
    {
      icon: 'document-text-outline',
      title: 'Terms of Service',
      onPress: () =>
        Alert.alert('Coming Soon', 'Terms of Service will be available soon!'),
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Privacy Policy',
      onPress: () =>
        Alert.alert('Coming Soon', 'Privacy Policy will be available soon!'),
    },
  ];

  // Show loading while auth is loading or profile is loading
  if (authLoading || isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {authLoading ? 'Checking authentication...' : 'Loading profile...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.primary}
          />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Authentication Required
          </Text>
          <Text style={[styles.errorMessage, { color: colors.text }]}>
            Please log in to access your profile.
          </Text>
          <Button
            title="Go to Login"
            onPress={() => router.replace('/(auth)/login')}
            variant="primary"
            size="large"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Edit Profile
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard} elevation={3}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.first_name?.charAt(0)?.toUpperCase()}
                {user?.last_name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.text }]}>
                {user?.email}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
              disabled={isSaving}
            >
              <Ionicons
                name="pencil"
                size={20}
                color={isSaving ? colors.text + '40' : colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Profile Form */}
          {isEditing ? (
            <View style={styles.profileForm}>
              <View style={styles.formRow}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    First Name
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={formData.first_name}
                    onChangeText={value =>
                      handleInputChange('first_name', value)
                    }
                    placeholder="First name"
                    placeholderTextColor={colors.text + '80'}
                    editable={!isSaving}
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Last Name
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={formData.last_name}
                    onChangeText={value =>
                      handleInputChange('last_name', value)
                    }
                    placeholder="Last name"
                    placeholderTextColor={colors.text + '80'}
                    editable={!isSaving}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Email
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.email}
                  onChangeText={value => handleInputChange('email', value)}
                  placeholder="Email address"
                  placeholderTextColor={colors.text + '80'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Phone
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.phone}
                  onChangeText={value => handleInputChange('phone', value)}
                  placeholder="Phone number"
                  placeholderTextColor={colors.text + '80'}
                  keyboardType="phone-pad"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Address
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.address}
                  onChangeText={value => handleInputChange('address', value)}
                  placeholder="Address"
                  placeholderTextColor={colors.text + '80'}
                  multiline
                  numberOfLines={2}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.formActions}>
                <Button
                  title="Cancel"
                  onPress={() => setIsEditing(false)}
                  variant="outline"
                  size="medium"
                  style={styles.cancelButton}
                  disabled={isSaving}
                />
                <Button
                  title={isSaving ? 'Saving...' : 'Save'}
                  onPress={handleSaveProfile}
                  variant="primary"
                  size="medium"
                  loading={isSaving}
                  style={styles.saveButton}
                  disabled={isSaving}
                />
              </View>
            </View>
          ) : (
            <View style={styles.profileDetails}>
              {user?.phone && (
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={20} color={colors.text} />
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    {user.phone}
                  </Text>
                </View>
              )}
              {user?.address && (
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
          )}
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
                <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          ))}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorButton: {
    width: '100%',
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
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
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
  editButton: {
    padding: 8,
  },
  profileForm: {
    gap: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
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
  menuCard: {
    marginBottom: 24,
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
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginBottom: 24,
  },
});
