import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Meal, default as mealService } from '@/lib/meals';
import { router } from 'expo-router';

interface MealCardProps {
  meal: Meal;
  onPress?: () => void;
  isFavorited?: boolean;
  onFavoriteToggle?: (mealId: number, isFavorited: boolean) => void;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with margins

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onPress,
  isFavorited = false,
  onFavoriteToggle,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [buttonScale] = useState(new Animated.Value(1));
  const [showSuccess, setShowSuccess] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favorited, setFavorited] = useState(isFavorited);

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
      const fromTime = new Date(meal.available_from).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const untilTime = new Date(meal.available_until).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${fromTime} - ${untilTime}`;
    }
    return 'Time TBD';
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
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
    } else {
      Alert.alert(
        'Authentication Required',
        'Please log in to add items to your cart.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') },
        ]
      );
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please log in to favorite meals.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    setFavoriteLoading(true);
    try {
      const result = await mealService.toggleFavorite(meal.id);
      setFavorited(result.is_favorited);
      onFavoriteToggle?.(meal.id, result.is_favorited);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const savingsPercentage = calculateSavings();

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/meal/${meal.id}`);
    }
  };

  return (
    <TouchableOpacity onPress={handleCardPress} activeOpacity={0.9} testID="meal-card">
      <Card
        style={[styles.container, { width: cardWidth }] as any}
        elevation={3}
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
              style={[styles.placeholder, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="restaurant" size={32} color="#FFFFFF" />
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
            disabled={favoriteLoading}
            testID={favoriteLoading ? "favorite-loading" : "favorite-button"}
          >
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={24}
              color={favorited ? '#FF6B6B' : '#FFFFFF'}
              testID="favorite-icon"
            />
          </TouchableOpacity>

          {/* Savings Badge */}
          {savingsPercentage > 0 && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>{savingsPercentage}% OFF</Text>
            </View>
          )}

          {/* Restaurant Badge */}
          {meal.restaurant && (
            <View style={styles.restaurantBadge}>
              <Text style={styles.restaurantText} testID="restaurant-badge">{meal.restaurant.name}</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title and Restaurant */}
          <View style={styles.header}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={2}
            >
              {meal.title}
            </Text>
            {meal.restaurant && (
              <Text
                style={[styles.restaurantName, { color: colors.text }]}
                numberOfLines={1}
                testID="restaurant-name"
              >
                {meal.restaurant.name}
              </Text>
            )}
            {meal.category && (
              <Text
                style={[styles.categoryName, { color: colors.text }]}
                numberOfLines={1}
              >
                {meal.category.name}
              </Text>
            )}
          </View>

          {/* Description */}
          <Text
            style={[styles.description, { color: colors.text }]}
            numberOfLines={2}
          >
            {meal.description || 'No description available.'}
          </Text>

          {/* Pickup Time */}
          <View style={styles.pickupTime}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={[styles.pickupText, { color: colors.text }]}>
              Pickup: {formatPickupTime()}
            </Text>
          </View>

          {/* Price and Action */}
          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              {meal.original_price &&
              meal.original_price > meal.current_price ? (
                <View style={styles.priceColumn}>
                  <Text
                    style={[styles.currentPrice, { color: colors.primary }]}
                  >
                    €{meal.current_price.toFixed(2)}
                  </Text>
                  <Text style={[styles.originalPrice, { color: colors.text }]}>
                    €{meal.original_price.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.currentPrice, { color: colors.primary }]}>
                  €{meal.current_price.toFixed(2)}
                </Text>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Button
                  title={showSuccess ? 'Added!' : 'Add to Cart'}
                  onPress={handleAddToCart}
                  variant="primary"
                  size="small"
                  style={{
                    ...styles.addButton,
                    backgroundColor: showSuccess ? '#27AE60' : colors.primary,
                  }}
                />
              </Animated.View>

              {/* Success Checkmark */}
              {showSuccess && (
                <Animated.View style={styles.successCheckmark}>
                  <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                </Animated.View>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
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
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  savingsBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#27AE60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 2,
  },
  savingsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  restaurantBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 2,
  },
  restaurantText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 12,
    opacity: 0.7,
  },
  categoryName: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.8,
  },
  pickupTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickupText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
    marginRight: 8,
  },
  priceColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  addButton: {
    minWidth: 60,
  },
  buttonContainer: {
    position: 'relative',
  },
  successCheckmark: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
