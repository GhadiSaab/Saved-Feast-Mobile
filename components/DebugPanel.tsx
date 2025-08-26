import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { testAPIConnection, testUserEndpoint } from '@/lib/api-test';
import * as SecureStore from 'expo-secure-store';

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [apiTestResult, setApiTestResult] = useState<string>('');
  const [userTestResult, setUserTestResult] = useState<string>('');
  const [tokenInfo, setTokenInfo] = useState<string>('');

  const testAPI = async () => {
    setApiTestResult('Testing...');
    const result = await testAPIConnection();
    setApiTestResult(result ? '✅ API connection successful' : '❌ API connection failed');
  };

  const testUser = async () => {
    setUserTestResult('Testing...');
    const result = await testUserEndpoint();
    if (result) {
      setUserTestResult(`✅ User endpoint working - ${result.first_name || 'Unknown'}`);
    } else {
      setUserTestResult('❌ User endpoint failed');
    }
  };

  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');
      setTokenInfo(`Token: ${token ? '✅ Present' : '❌ Missing'}\nUser Data: ${userData ? '✅ Present' : '❌ Missing'}`);
    } catch (error) {
      setTokenInfo(`Error checking storage: ${error}`);
    }
  };

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: colors.background + 'F0' }]}>
      <Card style={styles.panel}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Debug Panel</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: colors.primary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Auth State */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Auth State</Text>
            <Text style={[styles.info, { color: colors.text }]}>
              Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}
            </Text>
            <Text style={[styles.info, { color: colors.text }]}>
              Loading: {isLoading ? '🔄 Yes' : '✅ No'}
            </Text>
            <Text style={[styles.info, { color: colors.text }]}>
              User: {user ? `${user.first_name} ${user.last_name}` : 'None'}
            </Text>
          </View>

          {/* API Tests */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>API Tests</Text>
            <Button title="Test API Connection" onPress={testAPI} variant="outline" size="small" />
            <Text style={[styles.result, { color: colors.text }]}>{apiTestResult}</Text>
            
            <Button title="Test User Endpoint" onPress={testUser} variant="outline" size="small" />
            <Text style={[styles.result, { color: colors.text }]}>{userTestResult}</Text>
          </View>

          {/* Storage */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Storage</Text>
            <Button title="Check Token & User Data" onPress={checkToken} variant="outline" size="small" />
            <Text style={[styles.result, { color: colors.text }]}>{tokenInfo}</Text>
          </View>
        </ScrollView>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  panel: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
  },
  result: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    fontFamily: 'monospace',
  },
});
