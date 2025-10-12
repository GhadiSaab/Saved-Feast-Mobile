import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export function HapticTab(props: BottomTabBarButtonProps) {
  const colorScheme = useColorScheme();
  
  return (
    <View style={styles.tabContainer}>
      <PlatformPressable
        {...props}
        style={[
          props.style,
          styles.tabButton,
          props.accessibilityState?.selected && {
            backgroundColor: colorScheme === 'dark' 
              ? 'rgba(88, 166, 255, 0.15)' // Modern blue with transparency for dark mode
              : 'rgba(45, 90, 39, 0.1)', // Sage green with transparency for light mode
            borderRadius: 12,
            marginHorizontal: 4,
            marginVertical: 2,
          }
        ]}
        onPressIn={ev => {
          if (process.env.EXPO_OS === 'ios') {
            // Add a soft haptic feedback when pressing down on the tabs.
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          props.onPressIn?.(ev);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    width: '100%',
  },
});
