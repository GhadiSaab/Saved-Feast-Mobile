import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import orderService from '@/lib/orders';
import { OrderCountdown } from '@/components/OrderCountdown';
import { ClaimCodeModal } from '@/components/ClaimCodeModal';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useFocusEffect } from '@react-navigation/native';
import { debug } from '@/lib/debug';

export default function OrdersTabScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, user } = useAuth();
  const { scheduleImmediateOrderNotification } = useNotifications();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [selectedOrderForClaim, setSelectedOrderForClaim] = useState<any>(null);

  const {
    data: ordersData,
    error,
    refetch,
    isRefetching,
    isLoading,
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => orderService.getOrders(1),
    enabled: isAuthenticated, // Only fetch if user is authenticated
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true, // Continue refreshing in background
  });

  // Refresh orders when the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        debug.info('Orders tab focused, refreshing orders', { component: 'OrdersTab', userId: user?.id?.toString() });
        refetch();
      }
    }, [isAuthenticated, refetch, user?.id])
  );

  // Debug logging for orders data
  useEffect(() => {
    if (ordersData) {
      debug.info('Orders data updated', { component: 'OrdersTab', userId: user?.id?.toString() }, {
        ordersCount: Array.isArray(ordersData.data) ? ordersData.data.length : 0,
        hasData: !!ordersData.data,
        hasPagination: !!ordersData.pagination,
        dataType: typeof ordersData.data,
        isArray: Array.isArray(ordersData.data),
        rawData: ordersData,
        orders: Array.isArray(ordersData.data) ? ordersData.data.map(order => ({
          id: order.id,
          status: order.status,
          totalAmount: order.total_amount,
          itemsCount: order.items?.length || 0,
        })) : []
      });
    }
  }, [ordersData, user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return colors.warning;
      case 'ACCEPTED':
        return colors.primary;
      case 'READY_FOR_PICKUP':
        return colors.success;
      case 'COMPLETED':
        return colors.success;
      case 'CANCELLED_BY_CUSTOMER':
      case 'CANCELLED_BY_RESTAURANT':
      case 'EXPIRED':
        return colors.error;
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
        return 'checkmark-done-circle';
      case 'CANCELLED_BY_CUSTOMER':
      case 'CANCELLED_BY_RESTAURANT':
      case 'EXPIRED':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'ACCEPTED':
        return 'Accepted';
      case 'READY_FOR_PICKUP':
        return 'Ready for Pickup';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED_BY_CUSTOMER':
        return 'Cancelled by You';
      case 'CANCELLED_BY_RESTAURANT':
        return 'Cancelled by Restaurant';
      case 'EXPIRED':
        return 'Expired';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancelOrder = async (orderId: number) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await orderService.cancelMyOrder(orderId);
            refetch();
            Alert.alert('Success', 'Order cancelled successfully');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to cancel order');
          }
        },
      },
    ]);
  };

  const handleClaimOrder = (order: any) => {
    setSelectedOrderForClaim(order);
    setClaimModalVisible(true);
  };

  const handleClaimSuccess = () => {
    refetch();
    Alert.alert('Success', 'Order marked as picked up successfully!');
  };

  const handleCloseClaimModal = () => {
    setClaimModalVisible(false);
    setSelectedOrderForClaim(null);
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <Card style={styles.orderCard} elevation={2}>
      <TouchableOpacity
        style={styles.orderHeader}
        onPress={() =>
          setSelectedOrder(selectedOrder?.id === item.id ? null : item)
        }
      >
        <View style={styles.orderInfo}>
          <Text style={[styles.orderNumber, { color: colors.text }]}>
            Order #{item.id}
          </Text>
          <Text style={[styles.orderDate, { color: colors.text }]}>
            {formatDate(item.created_at)}
          </Text>
        </View>

        <View style={styles.orderStatus}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <Ionicons
              name={getStatusIcon(item.status)}
              size={16}
              color={getStatusColor(item.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
          <Ionicons
            name={selectedOrder?.id === item.id ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.text}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.orderSummary}>
        <Text style={[styles.totalAmount, { color: colors.primary }]}>
          €{item.total_amount ? Number(item.total_amount).toFixed(2) : '0.00'}
        </Text>
        <Text style={[styles.itemCount, { color: colors.text }]}>
          {item.items ? item.items.length : 0} item{(item.items ? item.items.length : 0) !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Expanded Order Details */}
      {selectedOrder?.id === item.id && (
        <View style={styles.orderDetails}>
          <View style={styles.detailsHeader}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>
              Order Details
            </Text>
          </View>

          {/* Order Items */}
          {item.items && item.items.length > 0 ? item.items.map((orderItem: any, index: number) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemImageContainer}>
                {orderItem.meal.image ? (
                  <Image
                    source={{ uri: orderItem.meal.image }}
                    style={styles.itemImage}
                    contentFit="cover"
                    placeholder="🍽️"
                  />
                ) : (
                  <View
                    style={[
                      styles.itemPlaceholder,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Ionicons name="restaurant" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <View style={styles.itemContent}>
                <Text
                  style={[styles.itemTitle, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {orderItem.meal.title}
                </Text>
                {orderItem.meal.restaurant && (
                  <Text
                    style={[styles.itemRestaurant, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {orderItem.meal.restaurant.name}
                  </Text>
                )}
                <Text style={[styles.itemQuantity, { color: colors.text }]}>
                  Qty: {orderItem.quantity}
                </Text>
              </View>

              <Text style={[styles.itemPrice, { color: colors.primary }]}>
                €{orderItem.price ? orderItem.price.toFixed(2) : '0.00'}
              </Text>
            </View>
          )) : (
            <Text style={[styles.noItemsText, { color: colors.text }]}>No items found</Text>
          )}

          {/* Order Notes */}
          {item.notes && (
            <View style={styles.notesSection}>
              <Text style={[styles.notesLabel, { color: colors.text }]}>
                Notes:
              </Text>
              <Text style={[styles.notesText, { color: colors.text }]}>
                {item.notes}
              </Text>
            </View>
          )}

          {/* Order Events */}
          {item.events && item.events.length > 0 && (
            <View style={styles.eventsSection}>
              <Text style={[styles.eventsLabel, { color: colors.text }]}>
                Order Timeline:
              </Text>
              {item.events.map((event: any, index: number) => (
                <View key={event.id || index} style={styles.eventItem}>
                  <View style={[styles.eventDot, { backgroundColor: colors.primary }]} />
                  <View style={styles.eventContent}>
                    <Text style={[styles.eventDescription, { color: colors.text }]}>
                      {event.description}
                    </Text>
                    <Text style={[styles.eventTime, { color: colors.text }]}>
                      {formatDate(event.created_at)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Countdown Timer */}
          <OrderCountdown
            pickupWindowEnd={item.pickup_window_end}
            expiresAt={item.expired_at}
            status={item.status}
            style={styles.countdownContainer}
          />

          {/* Pickup Code Display */}
          {item.pickup_code && (item.status === 'READY_FOR_PICKUP' || item.status === 'COMPLETED') && (
            <View style={styles.pickupCodeSection}>
              <Text style={[styles.pickupCodeLabel, { color: colors.text }]}>
                Pickup Code:
              </Text>
              <View style={[styles.pickupCodeBox, { backgroundColor: colors.primary }]}>
                <Text style={styles.pickupCodeText}>
                  {item.pickup_code}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {item.status === 'PENDING' && (
            <View style={styles.actionButtons}>
              <Button
                title="Cancel Order"
                onPress={() => handleCancelOrder(item.id)}
                variant="outline"
                size="small"
                style={styles.cancelButton}
              />
            </View>
          )}

          {item.status === 'READY_FOR_PICKUP' && (
            <View style={styles.actionButtons}>
              <Button
                title="Generate Claim Code"
                onPress={() => handleClaimOrder(item)}
                variant="primary"
                size="small"
                style={styles.claimButton}
              />
            </View>
          )}
        </View>
      )}
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={80} color={colors.text + '40'} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No orders yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text }]}>
        Start ordering delicious meals to see your order history here
      </Text>
      <Button
        title="Browse Meals"
        onPress={() => router.push('/')}
        variant="primary"
        style={styles.browseButton}
      />
    </View>
  );

  const renderNotAuthenticated = () => (
    <View style={styles.emptyState}>
      <Ionicons name="lock-closed-outline" size={80} color={colors.text + '40'} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Please log in
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text }]}>
        You need to be logged in to view your orders
      </Text>
      <Button
        title="Login"
        onPress={() => router.push('/(auth)/login')}
        variant="primary"
        style={styles.browseButton}
      />
    </View>
  );

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            My Orders
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.error}
          />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Something went wrong
          </Text>
          <Text style={[styles.errorMessage, { color: colors.text }]}>
            {error.message || 'Failed to load orders'}
          </Text>
          <Button
            title="Try Again"
            onPress={() => refetch()}
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            My Orders
          </Text>
        </View>
        {renderNotAuthenticated()}
      </SafeAreaView>
    );
  }

  // Show loading state
  if (isLoading && !ordersData) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            My Orders
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={64} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Orders List */}
      {ordersData?.data && Array.isArray(ordersData.data) && ordersData.data.length > 0 ? (
        <FlatList
          data={ordersData.data}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        renderEmptyState()
      )}

      {/* Claim Code Modal */}
      <ClaimCodeModal
        visible={claimModalVisible}
        orderId={selectedOrderForClaim?.id}
        orderNumber={selectedOrderForClaim?.id?.toString()}
        onClose={handleCloseClaimModal}
        onSuccess={handleClaimSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  orderCard: {
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  orderDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailsHeader: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemRestaurant: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    opacity: 0.7,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  actionButtons: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    minWidth: 100,
  },
  claimButton: {
    minWidth: 120,
  },
  pickupCodeSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  pickupCodeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickupCodeBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickupCodeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  countdownContainer: {
    marginTop: 12,
  },
  eventsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  eventsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  noItemsText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
  },
  browseButton: {
    minWidth: 160,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.7,
  },
});
