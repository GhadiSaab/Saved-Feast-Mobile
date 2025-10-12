import notificationService from '@/lib/notifications';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  removeNotificationSubscription: jest.fn(),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  osInternalBuildId: 'test-device-id',
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get correct notification data for PENDING status', () => {
    const notificationData = (notificationService as any).getOrderNotificationData('PENDING', 123);
    
    expect(notificationData.title).toBe('Order Confirmed! 🎉');
    expect(notificationData.body).toBe('Your order #123 has been confirmed and is being prepared.');
    expect(notificationData.data.action).toBe('view_order');
  });

  it('should get correct notification data for READY_FOR_PICKUP status', () => {
    const notificationData = (notificationService as any).getOrderNotificationData('READY_FOR_PICKUP', 456);
    
    expect(notificationData.title).toBe('Order Ready for Pickup! 🍽️');
    expect(notificationData.body).toBe('Your order #456 is ready for pickup. Head to the restaurant now!');
    expect(notificationData.data.action).toBe('view_order');
  });

  it('should get correct notification data for COMPLETED status', () => {
    const notificationData = (notificationService as any).getOrderNotificationData('COMPLETED', 789);
    
    expect(notificationData.title).toBe('Order Completed! 🎊');
    expect(notificationData.body).toBe('Thank you! Your order #789 has been completed. Enjoy your meal!');
    expect(notificationData.data.action).toBe('view_order');
  });

  it('should get correct notification data for CANCELLED_BY_RESTAURANT status', () => {
    const notificationData = (notificationService as any).getOrderNotificationData('CANCELLED_BY_RESTAURANT', 101);
    
    expect(notificationData.title).toBe('Order Cancelled');
    expect(notificationData.body).toBe('Unfortunately, your order #101 has been cancelled by the restaurant.');
    expect(notificationData.data.action).toBe('view_order');
  });

  it('should get default notification data for unknown status', () => {
    const notificationData = (notificationService as any).getOrderNotificationData('UNKNOWN_STATUS', 202);
    
    expect(notificationData.title).toBe('Order Update');
    expect(notificationData.body).toBe('Your order #202 status has been updated.');
    expect(notificationData.data.action).toBe('view_order');
  });
});
