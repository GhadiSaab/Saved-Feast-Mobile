import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Order, OrderItem, default as orderService } from '@/lib/orders';
import { OrderCountdown } from '@/components/OrderCountdown';
import { debug } from '@/lib/debug';

export default function OrderConfirmationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  useAuth();
  const { scheduleImmediateOrderNotification } = useNotifications();
  const params = useLocalSearchParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<string>('pending');

  useEffect(() => {
    if (params.orderId) {
      loadOrder(Number(params.orderId));
    } else {
      setLoading(false);
    }
  }, [params.orderId]);

  const loadOrder = async (orderId: number) => {
    try {
      setLoading(true);
      debug.info('Loading order details', { component: 'OrderConfirmation', orderId: orderId.toString() });
      
      const orderData = await orderService.getOrder(orderId);
      
      debug.info('Order loaded successfully', { component: 'OrderConfirmation', orderId: orderId.toString() }, {
        orderId: orderData.id,
        status: orderData.status,
        totalAmount: orderData.total_amount,
        totalAmountType: typeof orderData.total_amount,
        totalAmountIsNull: orderData.total_amount === null,
        totalAmountIsUndefined: orderData.total_amount === undefined,
        itemsCount: orderData.items?.length || 0,
        hasItems: !!orderData.items,
        itemsStructure: orderData.items?.map(item => ({
          id: item.id,
          mealId: item.meal_id,
          price: item.price,
          priceType: typeof item.price,
          quantity: item.quantity,
          quantityType: typeof item.quantity,
          hasPrice: item.price !== undefined,
          hasQuantity: item.quantity !== undefined,
        }))
      });
      
      setOrder(orderData);
      setOrderStatus(orderData.status);
      
      // Schedule notification for order confirmation
      if (orderData.status === 'PENDING') {
        scheduleImmediateOrderNotification(orderData.id, orderData.status);
      }
    } catch (error: any) {
      debug.error('Failed to load order', { component: 'OrderConfirmation', orderId: orderId.toString() }, error);
      Alert.alert('Error', error.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FFA500';
      case 'ACCEPTED':
        return '#007AFF';
      case 'READY_FOR_PICKUP':
        return '#34C759';
      case 'COMPLETED':
        return '#34C759';
      case 'CANCELLED_BY_CUSTOMER':
      case 'CANCELLED_BY_RESTAURANT':
      case 'EXPIRED':
        return '#FF3B30';
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'time-outline';
      case 'ACCEPTED':
        return 'checkmark-circle-outline';
      case 'READY_FOR_PICKUP':
        return 'checkmark-done-circle-outline';
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'CANCELLED_BY_CUSTOMER':
      case 'CANCELLED_BY_RESTAURANT':
      case 'EXPIRED':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Your order has been received and is being processed';
      case 'ACCEPTED':
        return 'Your order has been accepted by the restaurant';
      case 'READY_FOR_PICKUP':
        return 'Your order is ready for pickup!';
      case 'COMPLETED':
        return 'Order completed successfully';
      case 'CANCELLED_BY_CUSTOMER':
        return 'Your order has been cancelled by you';
      case 'CANCELLED_BY_RESTAURANT':
        return 'Your order has been cancelled by the restaurant';
      case 'EXPIRED':
        return 'Your order has expired';
      default:
        return 'Order status unknown';
    }
  };

  const formatPickupTime = (pickupTime: string) => {
    const date = new Date(pickupTime);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTrackOrder = () => {
    if (order) {
      router.push('/orders');
    }
  };

  const handleViewOrders = () => {
    router.push('/orders');
  };

  const handleBackToFeed = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ThemedView style={styles.loadingContainer}>
          <Ionicons name="restaurant" size={48} color={colors.primary} />
          <ThemedText style={styles.loadingText}>
            Loading order details...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ThemedView style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.primary}
          />
          <ThemedText style={styles.errorTitle}>Order Not Found</ThemedText>
          <ThemedText style={styles.errorText}>
            We couldn&apos;t find the order details. Please check your order
            history.
          </ThemedText>
          <Button
            title="View Orders"
            onPress={handleViewOrders}
            variant="primary"
            size="large"
            style={styles.errorButton}
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <ThemedView style={styles.header}>
          <View
            style={[styles.successIcon, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.title}>Order Confirmed!</ThemedText>
          <ThemedText style={styles.subtitle}>
            Your order has been successfully placed
          </ThemedText>
        </ThemedView>

        {/* Order Status */}
        <Card style={styles.statusCard} elevation={3}>
          <View style={styles.statusHeader}>
            <Ionicons
              name={getStatusIcon(orderStatus) as any}
              size={24}
              color={getStatusColor(orderStatus)}
            />
            <ThemedText
              style={[
                styles.statusText,
                { color: getStatusColor(orderStatus) },
              ]}
            >
              {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
            </ThemedText>
          </View>
          <ThemedText style={styles.statusDescription}>
            {getStatusDescription(orderStatus)}
          </ThemedText>
        </Card>

        {/* Countdown Timer */}
        <OrderCountdown
          pickupWindowEnd={order.pickup_window_end}
          expiresAt={order.expired_at}
          status={orderStatus}
          style={styles.countdownContainer}
        />

        {/* Order Details */}
        <Card style={styles.orderCard} elevation={3}>
          <ThemedText style={styles.sectionTitle}>Order Details</ThemedText>

          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Order ID:</ThemedText>
              <ThemedText style={styles.infoValue}>#{order.id}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Status:</ThemedText>
              <ThemedText
                style={[
                  styles.infoValue,
                  { color: getStatusColor(orderStatus), fontWeight: 'bold' },
                ]}
              >
                {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1).toLowerCase()}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Pickup Time:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {order.pickup_time ? formatPickupTime(order.pickup_time) : 'TBD'}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Payment Method:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {order.payment_method === 'CASH_ON_PICKUP' ? '💵 Cash on Pickup' : '💳 Online Payment'}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Total Amount:</ThemedText>
              <ThemedText
                style={[
                  styles.infoValue,
                  { color: colors.primary, fontWeight: 'bold' },
                ]}
              >
                €{order.total_amount ? Number(order.total_amount).toFixed(2) : '0.00'}
              </ThemedText>
            </View>
          </View>

          {/* Order Items */}
          <ThemedText style={styles.itemsTitle}>Items Ordered:</ThemedText>
          {order.items && order.items.length > 0 ? order.items.map((item: OrderItem, index: number) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <ThemedText style={styles.itemName}>
                  {item.meal.title}
                </ThemedText>
                <ThemedText style={styles.itemQuantity}>
                  x{item.quantity}
                </ThemedText>
              </View>
              <ThemedText style={styles.itemPrice}>
                €{((Number(item.price) || 0) * (item.quantity || 0)).toFixed(2)}
              </ThemedText>
            </View>
          )) : (
            <ThemedText style={styles.noItemsText}>No items found</ThemedText>
          )}
        </Card>

        {/* What Happens Next */}
        <Card style={styles.nextStepsCard} elevation={3}>
          <ThemedText style={styles.sectionTitle}>
            What Happens Next?
          </ThemedText>

          <View style={styles.step}>
            <View
              style={[styles.stepIcon, { backgroundColor: colors.primary }]}
            >
              <ThemedText style={styles.stepNumber}>1</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>
                Restaurant Notification
              </ThemedText>
              <ThemedText style={styles.stepDescription}>
                The restaurant has been notified of your order and will begin
                preparation.
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View
              style={[styles.stepIcon, { backgroundColor: colors.primary }]}
            >
              <ThemedText style={styles.stepNumber}>2</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Meal Preparation</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Your meal will be prepared fresh and packaged for pickup.
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View
              style={[styles.stepIcon, { backgroundColor: colors.primary }]}
            >
              <ThemedText style={styles.stepNumber}>3</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Ready for Pickup</ThemedText>
              <ThemedText style={styles.stepDescription}>
                You&apos;ll receive a notification when your order is ready for
                pickup.
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <ThemedView style={styles.actions}>
          <Button
            title="Track Order"
            onPress={handleTrackOrder}
            variant="primary"
            size="large"
            style={styles.actionButton}
          />
          <Button
            title="View All Orders"
            onPress={handleViewOrders}
            variant="outline"
            size="large"
            style={styles.actionButton}
          />
          <Button
            title="Back to Feed"
            onPress={handleBackToFeed}
            variant="outline"
            size="large"
            style={styles.actionButton}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
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
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  errorButton: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  statusCard: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  orderCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 14,
    opacity: 0.7,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextStepsCard: {
    marginBottom: 24,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  countdownContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  noItemsText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginVertical: 16,
  },
});
