import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { useCart, CartItem } from '@/context/CartContext';
import { router } from 'expo-router';

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeFromCart(itemId),
          },
        ]
      );
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert(
        'Empty Cart',
        'Please add some items to your cart before checkout.'
      );
      return;
    }

    router.push('/checkout');
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to clear your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <Card style={styles.cartItem} elevation={2}>
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
            <Ionicons name="restaurant" size={24} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
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
        </View>

        <View style={styles.itemFooter}>
          <Text style={[styles.itemPrice, { color: colors.primary }]}>
            €{(item.price * item.quantity).toFixed(2)}
          </Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={[styles.quantityText, { color: colors.text }]}>
              {item.quantity}
            </Text>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleQuantityChange(item.id, 0)}
      >
        <Ionicons name="close-circle" size={24} color={colors.error} />
      </TouchableOpacity>
    </Card>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <Ionicons name="cart-outline" size={80} color={colors.text + '40'} />
      <Text style={[styles.emptyCartTitle, { color: colors.text }]}>
        Your cart is empty
      </Text>
      <Text style={[styles.emptyCartSubtitle, { color: colors.text }]}>
        Add some delicious meals to get started!
      </Text>
      <Button
        title="Browse Meals"
        onPress={() => router.push('/')}
        variant="primary"
        style={styles.browseButton}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Your Cart
        </Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={[styles.clearButton, { color: colors.error }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Items */}
      {cartItems.length > 0 ? (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            cartItems.length > 0 && { paddingBottom: 180 }, // Space for floating checkout
          ]}
        />
      ) : (
        renderEmptyCart()
      )}

      {/* Checkout Section */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutSection}>
          <Card style={styles.checkoutCard} elevation={4}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>
                €{getCartTotal().toFixed(2)}
              </Text>
            </View>

            <View style={styles.itemCountRow}>
              <Text style={[styles.itemCount, { color: colors.text }]}>
                {cartItems.reduce(
                  (sum: number, item: CartItem) => sum + item.quantity,
                  0
                )}{' '}
                items
              </Text>
            </View>

            <Button
              title={
                isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'
              }
              onPress={handleCheckout}
              variant="primary"
              size="large"
              style={styles.checkoutButton}
            />
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  clearButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 12,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
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
    justifyContent: 'space-between',
  },
  itemHeader: {
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemRestaurant: {
    fontSize: 12,
    opacity: 0.7,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
  },
  browseButton: {
    minWidth: 160,
  },
  checkoutSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 100, // Account for tab bar
    paddingTop: 16,
  },
  checkoutCard: {
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    borderRadius: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  itemCountRow: {
    marginBottom: 20,
  },
  itemCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  checkoutButton: {
    width: '100%',
  },
});
