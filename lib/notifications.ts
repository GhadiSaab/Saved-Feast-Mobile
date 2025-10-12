import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;

  async registerForPushNotifications(): Promise<string | null> {
    let token: string | null = null;

    // Check if we're in Expo Go (notifications not fully supported)
    if (__DEV__ && !Device.isDevice) {
      console.log('Push notifications not available in Expo Go. Use a development build for full functionality.');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        // Get project ID from app.json or use a default
        const projectId = process.env.EXPO_PUBLIC_PROJECT_ID || 'your-project-id';
        
        // Skip token generation if using placeholder project ID
        if (projectId === 'your-project-id') {
          console.log('Skipping push token generation - using placeholder project ID');
          return null;
        }
        
        const pushToken = await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        });
        token = pushToken.data;
        this.expoPushToken = token;
        
        // Send token to backend
        await this.sendTokenToServer(token);
        
        console.log('Expo push token:', token);
      } catch (error) {
        console.error('Error getting push token:', error);
        // Don't throw error, just return null to allow app to continue
        return null;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      await api.post('/notifications/register', {
        token,
        platform: Platform.OS,
        device_id: Device.osInternalBuildId || 'unknown',
      });
      console.log('Push token sent to server successfully');
    } catch (error) {
      console.error('Failed to send push token to server:', error);
    }
  }

  async scheduleOrderNotification(
    orderId: number,
    status: string,
    scheduledTime: Date
  ): Promise<void> {
    const notificationData = this.getOrderNotificationData(status, orderId);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.body,
        data: {
          orderId,
          status,
          type: 'order_update',
          ...notificationData.data,
        },
        sound: 'default',
      },
      trigger: {
        date: scheduledTime,
      },
    });
  }

  async scheduleImmediateOrderNotification(
    orderId: number,
    status: string
  ): Promise<void> {
    const notificationData = this.getOrderNotificationData(status, orderId);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.body,
        data: {
          orderId,
          status,
          type: 'order_update',
          ...notificationData.data,
        },
        sound: 'default',
      },
      trigger: null, // Immediate
    });
  }

  private getOrderNotificationData(status: string, orderId: number): NotificationData {
    switch (status) {
      case 'PENDING':
        return {
          title: 'Order Confirmed! 🎉',
          body: `Your order #${orderId} has been confirmed and is being prepared.`,
          data: { action: 'view_order' },
        };
      
      case 'ACCEPTED':
        return {
          title: 'Order Accepted! ✅',
          body: `Great news! Your order #${orderId} has been accepted by the restaurant.`,
          data: { action: 'view_order' },
        };
      
      case 'READY_FOR_PICKUP':
        return {
          title: 'Order Ready for Pickup! 🍽️',
          body: `Your order #${orderId} is ready for pickup. Head to the restaurant now!`,
          data: { action: 'view_order' },
        };
      
      case 'COMPLETED':
        return {
          title: 'Order Completed! 🎊',
          body: `Thank you! Your order #${orderId} has been completed. Enjoy your meal!`,
          data: { action: 'view_order' },
        };
      
      case 'CANCELLED_BY_CUSTOMER':
        return {
          title: 'Order Cancelled',
          body: `Your order #${orderId} has been cancelled as requested.`,
          data: { action: 'view_order' },
        };
      
      case 'CANCELLED_BY_RESTAURANT':
        return {
          title: 'Order Cancelled',
          body: `Unfortunately, your order #${orderId} has been cancelled by the restaurant.`,
          data: { action: 'view_order' },
        };
      
      case 'EXPIRED':
        return {
          title: 'Order Expired',
          body: `Your order #${orderId} has expired. Please place a new order.`,
          data: { action: 'view_order' },
        };
      
      default:
        return {
          title: 'Order Update',
          body: `Your order #${orderId} status has been updated.`,
          data: { action: 'view_order' },
        };
    }
  }

  async cancelOrderNotifications(orderId: number): Promise<void> {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.orderId === orderId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Listen for notification responses (when user taps on notification)
  addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Listen for notifications received while app is in foreground
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default new NotificationService();
