import React, { useState } from 'react';
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

export default function OrdersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const {
    data: ordersData,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders(1),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'confirmed':
        return colors.primary;
      case 'preparing':
        return colors.accent;
      case 'ready':
        return colors.success;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'preparing':
        return 'restaurant-outline';
      case 'ready':
        return 'checkmark-done-circle-outline';
      case 'completed':
        return 'checkmark-done-circle';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
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
            await orderService.cancelOrder(orderId);
            refetch();
            Alert.alert('Success', 'Order cancelled successfully');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to cancel order');
          }
        },
      },
    ]);
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
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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
          €{item.total_amount.toFixed(2)}
        </Text>
        <Text style={[styles.itemCount, { color: colors.text }]}>
          {item.items.length} item{item.items.length !== 1 ? 's' : ''}
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
          {item.items.map((orderItem: any, index: number) => (
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
                €{orderItem.price.toFixed(2)}
              </Text>
            </View>
          ))}

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

          {/* Action Buttons */}
          {item.status === 'pending' && (
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

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
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

      {/* Orders List */}
      {ordersData?.data && ordersData.data.length > 0 ? (
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
});
