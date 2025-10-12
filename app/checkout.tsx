import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { useCart, CartItem } from '@/context/CartContext';
import { Image } from 'expo-image';
import orderService from '@/lib/orders';
import { debug } from '@/lib/debug';
import { useQueryClient } from '@tanstack/react-query';

export default function CheckoutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert(
        'Empty Cart',
        'Please add some items to your cart before checkout.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      debug.info('Starting order creation', { component: 'Checkout', userId: user?.id?.toString() }, {
        cartItemsCount: cartItems.length,
        cartItems: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: getCartTotal(),
        notes: notes.trim() || undefined,
        paymentMethod: 'CASH_ON_PICKUP',
      });

      const orderData = {
        items: cartItems.map((item: CartItem) => ({
          meal_id: item.id,
          quantity: item.quantity,
        })),
        notes: notes.trim() || undefined,
        payment_method: 'CASH_ON_PICKUP' as const, // Default payment method
      };

      debug.info('Order data prepared', { component: 'Checkout' }, orderData);

      const order = await orderService.createOrder(orderData);

      debug.info('Order created successfully', { component: 'Checkout', orderId: order.id.toString() }, {
        orderId: order.id,
        status: order.status,
        totalAmount: order.total_amount,
        totalAmountType: typeof order.total_amount,
        itemsCount: order.items?.length || 0,
        orderStructure: {
          hasId: !!order.id,
          hasStatus: !!order.status,
          hasTotalAmount: order.total_amount !== undefined && order.total_amount !== null,
          hasItems: !!order.items,
          itemsLength: order.items?.length || 0,
        }
      });

      // Clear cart and invalidate orders cache
      clearCart();
      
      // Invalidate orders cache to refresh the orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      router.replace(`/order-confirmation?orderId=${order.id}`);
    } catch (error: any) {
      debug.error('Order creation failed', { component: 'Checkout', userId: user?.id?.toString() }, error);
      Alert.alert('Order Failed', error.message || 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderItem}>
      <View style={styles.itemImageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
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
            <Ionicons name="restaurant" size={20} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.itemContent}>
        <Text
          style={[styles.itemTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        {item.restaurant && (
          <Text
            style={[styles.itemRestaurant, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.restaurant}
          </Text>
        )}
        <Text style={[styles.itemPrice, { color: colors.primary }]}>
          €{item.price.toFixed(2)} × {item.quantity}
        </Text>
      </View>

      <View style={styles.itemTotal}>
        <Text style={[styles.itemTotalText, { color: colors.primary }]}>
          €{(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Checkout
            </Text>
          </View>

          {/* Order Summary */}
          <Card style={styles.orderCard} elevation={3}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Order Summary
            </Text>
            <FlatList
              data={cartItems}
              renderItem={renderOrderItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </Card>

          {/* Customer Info */}
          <Card style={styles.customerCard} elevation={3}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Customer Information
            </Text>
            <View style={styles.customerInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color={colors.text} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {user?.first_name} {user?.last_name}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color={colors.text} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {user?.email}
                </Text>
              </View>
              {user?.phone && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color={colors.text} />
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    {user.phone}
                  </Text>
                </View>
              )}
              {user?.address && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={colors.text}
                  />
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    {user.address}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Order Notes */}
          <Card style={styles.notesCard} elevation={3}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Order Notes (Optional)
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Any special instructions or requests..."
              placeholderTextColor={colors.text + '80'}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Card>

          {/* Total */}
          <Card style={styles.totalCard} elevation={3}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Subtotal
              </Text>
              <Text style={[styles.totalAmount, { color: colors.text }]}>
                €{getCartTotal().toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Service Fee
              </Text>
              <Text style={[styles.totalAmount, { color: colors.text }]}>
                €0.00
              </Text>
            </View>
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={[styles.finalTotalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text
                style={[styles.finalTotalAmount, { color: colors.primary }]}
              >
                €{getCartTotal().toFixed(2)}
              </Text>
            </View>
          </Card>

          {/* Place Order Button */}
          <Button
            title={isSubmitting ? 'Placing Order...' : 'Place Order'}
            onPress={handlePlaceOrder}
            variant="primary"
            size="large"
            loading={isSubmitting}
            disabled={isSubmitting || cartItems.length === 0}
            style={styles.placeOrderButton}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text }]}>
              By placing this order, you agree to our Terms of Service and
              Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  orderCard: {
    marginBottom: 16,
  },
  customerCard: {
    marginBottom: 16,
  },
  notesCard: {
    marginBottom: 16,
  },
  totalCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemRestaurant: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
    paddingTop: 16,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  finalTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeOrderButton: {
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 18,
  },
});
