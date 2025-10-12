import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            backgroundColor: colorScheme === 'dark' ? 'rgba(13, 17, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderTopColor: Colors[colorScheme ?? 'light'].border,
            borderTopWidth: 1,
            backdropFilter: 'blur(20px)',
          },
          default: {
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderTopColor: Colors[colorScheme ?? 'light'].border,
            borderTopWidth: 1,
            elevation: 8,
            shadowColor: colorScheme === 'dark' ? '#000' : '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
            shadowRadius: 4,
          },
        }),
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name="doc.text.fill" 
              color={focused ? '#27AE60' : color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name="cart.fill" 
              color={focused ? '#F39C12' : color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name="person.fill" 
              color={focused ? '#E74C3C' : color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
