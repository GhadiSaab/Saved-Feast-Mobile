import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Meal } from '@/lib/meals';
import { router } from 'expo-router';

interface MealDetailModalProps {
  meal: Meal | null;
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  meal,
  visible,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [buttonScale] = useState(new Animated.Value(1));
  const [showSuccess, setShowSuccess] = useState(false);

  if (!meal) return null;

  const calculateSavings = () => {
    if (meal.original_price && meal.original_price > meal.current_price) {
      const savings =
        ((meal.original_price - meal.current_price) / meal.original_price) *
        100;
      return Math.round(savings);
    }
    return 0;
  };

  const formatPickupTime = () => {
    if (meal.available_from && meal.available_until) {
      const fromTime = new Date(meal.available_from).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const untilTime = new Date(meal.available_until).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${fromTime} - ${untilTime}`;
    }
    return 'Time TBD';
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showSuccessFeedback = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 1500);
  };

  const handleAddToCart = () => {
    animateButton();

    if (isAuthenticated) {
      addToCart({
        id: meal.id,
        name: meal.title,
        price: meal.current_price,
        image: meal.image || undefined,
        restaurant: meal.restaurant?.name,
      });
      showSuccessFeedback();
      // Close the modal after a short delay to show the success feedback
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      Alert.alert(
        'Authentication Required',
        'Please log in to add items to your cart.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/login') },
        ]
      );
    }
  };

  const savingsPercentage = calculateSavings();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Image Section */}
          <View style={styles.imageContainer}>
            {meal.image ? (
              <Image
                source={{ uri: meal.image }}
                style={styles.image}
                contentFit="cover"
                placeholder="🍽️"
              />
            ) : (
              <View
                style={[
                  styles.placeholder,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons name="restaurant" size={64} color="#FFFFFF" />
              </View>
            )}

            {/* Savings Badge */}
            {savingsPercentage > 0 && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>{savingsPercentage}% OFF</Text>
              </View>
            )}

            {/* Restaurant Badge */}
            {meal.restaurant && (
              <View style={styles.restaurantBadge}>
                <Text style={styles.restaurantText}>
                  {meal.restaurant.name}
                </Text>
              </View>
            )}
          </View>

          {/* Content Section */}
          <View style={styles.content}>
            {/* Title */}
            <Text style={[styles.title, { color: colors.text }]}>
              {meal.title}
            </Text>

            {/* Restaurant */}
            {meal.restaurant && (
              <View style={styles.restaurantRow}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.restaurantName, { color: colors.text }]}>
                  {meal.restaurant.name}
                </Text>
              </View>
            )}

            {/* Price Section */}
            <View style={styles.priceSection}>
              {meal.original_price &&
              meal.original_price > meal.current_price ? (
                <View style={styles.priceRow}>
                  <Text
                    style={[styles.currentPrice, { color: colors.primary }]}
                  >
                    €{meal.current_price.toFixed(2)}
                  </Text>
                  <Text style={[styles.originalPrice, { color: colors.text }]}>
                    €{meal.original_price.toFixed(2)}
                  </Text>
                  <View style={styles.savingsContainer}>
                    <Text
                      style={[styles.savingsAmount, { color: colors.primary }]}
                    >
                      Save €
                      {(meal.original_price - meal.current_price).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.currentPrice, { color: colors.primary }]}>
                  €{meal.current_price.toFixed(2)}
                </Text>
              )}
            </View>

            {/* Pickup Time */}
            <View style={styles.pickupTime}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View style={styles.pickupContent}>
                <Text style={[styles.pickupLabel, { color: colors.text }]}>
                  Pickup Time
                </Text>
                <Text style={[styles.pickupText, { color: colors.text }]}>
                  {formatPickupTime()}
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                Description
              </Text>
              <Text style={[styles.description, { color: colors.text }]}>
                {meal.description || 'No description available.'}
              </Text>
            </View>

            {/* Additional Info */}
            {meal.category && (
              <View style={styles.infoSection}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  Category
                </Text>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {meal.category.name}
                </Text>
              </View>
            )}

            {/* Allergens or Dietary Info */}
            <View style={styles.infoSection}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Important Notes
              </Text>
              <Text style={[styles.infoText, { color: colors.text }]}>
                Please check with the restaurant for any specific dietary
                requirements or allergens.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={[styles.bottomBar, { backgroundColor: colors.card }]}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Button
              title={showSuccess ? 'Added to Cart!' : 'Add to Cart'}
              onPress={handleAddToCart}
              variant="primary"
              size="large"
              style={{
                ...styles.addToCartButton,
                backgroundColor: showSuccess ? '#27AE60' : colors.primary,
              }}
            />
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom bar
  },
  imageContainer: {
    position: 'relative',
    height: height * 0.4,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#27AE60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  savingsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  restaurantBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  restaurantText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 34,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  restaurantName: {
    fontSize: 16,
    marginLeft: 8,
    opacity: 0.8,
  },
  priceSection: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 20,
    textDecorationLine: 'line-through',
    opacity: 0.6,
    marginRight: 12,
  },
  savingsContainer: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsAmount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pickupTime: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  pickupContent: {
    marginLeft: 12,
    flex: 1,
  },
  pickupLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  pickupText: {
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addToCartButton: {
    width: '100%',
  },
});
