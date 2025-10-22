import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import notificationService from '@/lib/notifications';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  registerForPushNotifications: () => Promise<void>;
  scheduleOrderNotification: (orderId: number, status: string, scheduledTime: Date) => Promise<void>;
  scheduleImmediateOrderNotification: (orderId: number, status: string) => Promise<void>;
  cancelOrderNotifications: (orderId: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    registerForPushNotifications();

    // Listen for notifications received while app is in foreground
    const notificationListener = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        setNotification(notification);
      }
    );

    // Listen for notification responses (when user taps on notification)
    const responseListener = notificationService.addNotificationResponseListener(
      (response) => {
        console.log('Notification response:', response);
        const data = response.notification.request.content.data;
        
        // Handle navigation based on notification data
        if (data?.type === 'order_update' && data?.orderId) {
          // Navigate to order details or orders screen
          router.push(`/order-confirmation?orderId=${data.orderId}`);
        }
      }
    );

    return () => {
      notificationListener?.remove();
      responseListener?.remove();
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      setExpoPushToken(token);
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  };

  const scheduleOrderNotification = async (
    orderId: number,
    status: string,
    scheduledTime: Date
  ) => {
    try {
      await notificationService.scheduleOrderNotification(orderId, status, scheduledTime);
    } catch (error) {
      console.error('Failed to schedule order notification:', error);
    }
  };

  const scheduleImmediateOrderNotification = async (
    orderId: number,
    status: string
  ) => {
    try {
      await notificationService.scheduleImmediateOrderNotification(orderId, status);
    } catch (error) {
      console.error('Failed to schedule immediate order notification:', error);
    }
  };

  const cancelOrderNotifications = async (orderId: number) => {
    try {
      await notificationService.cancelOrderNotifications(orderId);
    } catch (error) {
      console.error('Failed to cancel order notifications:', error);
    }
  };

  const value: NotificationContextType = {
    expoPushToken,
    notification,
    registerForPushNotifications,
    scheduleOrderNotification,
    scheduleImmediateOrderNotification,
    cancelOrderNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
