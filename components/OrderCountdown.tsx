import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface OrderCountdownProps {
  pickupWindowEnd?: string;
  expiresAt?: string;
  status: string;
  style?: any;
}

export function OrderCountdown({ 
  pickupWindowEnd, 
  expiresAt, 
  status, 
  style 
}: OrderCountdownProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      let targetTime: number | null = null;
      let isExpiration = false;

      // Determine which countdown to show based on order status
      if (status === 'READY_FOR_PICKUP' && pickupWindowEnd) {
        targetTime = new Date(pickupWindowEnd).getTime();
      } else if (status === 'PENDING' && expiresAt) {
        targetTime = new Date(expiresAt).getTime();
        isExpiration = true;
      }

      if (!targetTime) {
        setTimeLeft('');
        return;
      }

      const difference = targetTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(isExpiration ? 'Expired' : 'Pickup window closed');
        return;
      }

      setIsExpired(false);

      // Calculate time components
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Format time display
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [pickupWindowEnd, expiresAt, status]);

  if (!timeLeft) {
    return null;
  }

  const getCountdownColor = () => {
    if (isExpired) {
      return colors.error;
    }
    
    // If less than 5 minutes left, show warning
    const now = new Date().getTime();
    const targetTime = status === 'READY_FOR_PICKUP' && pickupWindowEnd 
      ? new Date(pickupWindowEnd).getTime()
      : status === 'PENDING' && expiresAt 
        ? new Date(expiresAt).getTime()
        : null;
    
    if (targetTime) {
      const difference = targetTime - now;
      const minutesLeft = Math.floor(difference / (1000 * 60));
      
      if (minutesLeft <= 5) {
        return colors.warning;
      }
    }
    
    return colors.primary;
  };

  const getCountdownLabel = () => {
    if (isExpired) {
      return status === 'READY_FOR_PICKUP' ? 'Pickup window closed' : 'Expired';
    }
    
    if (status === 'READY_FOR_PICKUP') {
      return 'Pickup window ends in:';
    } else if (status === 'PENDING') {
      return 'Expires in:';
    }
    
    return '';
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: colors.text }]}>
        {getCountdownLabel()}
      </Text>
      <View style={[styles.timeContainer, { backgroundColor: getCountdownColor() + '20' }]}>
        <Text style={[styles.timeText, { color: getCountdownColor() }]}>
          {timeLeft}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  timeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});
