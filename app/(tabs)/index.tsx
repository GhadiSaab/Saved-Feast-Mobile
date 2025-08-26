import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { MealCard } from '@/components/MealCard';
import { MealDetailModal } from '@/components/MealDetailModal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import mealService, { MealFilters, Meal } from '@/lib/meals';
import { router } from 'expo-router';

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuth();
  const { getItemCount } = useCart();

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroOpacity = useRef(new Animated.Value(1)).current;
  const searchBarScale = useRef(new Animated.Value(1)).current;
  const categoryScale = useRef(new Animated.Value(1)).current;

  const [filters, setFilters] = useState<MealFilters>({
    page: 1,
    per_page: 20,
    available: true,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>({});

  // Fetch meals with better error handling and retry logic
  const {
    data: mealsData,
    isLoading,
    error,
    refetch,
    isRefetching,
    isError,
  } = useQuery({
    queryKey: ['meals', filters],
    queryFn: () => mealService.getMeals(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3, // Retry 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Fetch filter options with retry logic
  const { data: filterOptions } = useQuery({
    queryKey: ['meal-filters'],
    queryFn: () => mealService.getFilters(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Fetch user favorites
  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => mealService.getFavorites(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Animate search bar on focus
  const animateSearchBar = (focused: boolean) => {
    Animated.spring(searchBarScale, {
      toValue: focused ? 1.02 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Animate category selection
  const animateCategorySelection = () => {
    Animated.sequence([
      Animated.timing(categoryScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(categoryScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleCategoryChange = (categoryId: number | '') => {
    animateCategorySelection();
    setSelectedCategory(categoryId);
    setFilters(prev => ({
      ...prev,
      category_id: typeof categoryId === 'number' ? categoryId : undefined,
      page: 1,
    }));
  };

  const handleLoadMore = () => {
    if (mealsData?.pagination?.has_more_pages) {
      setFilters(prev => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  };

  const handleFavoriteToggle = (mealId: number, isFavorited: boolean) => {
    setFavoriteStates(prev => ({
      ...prev,
      [mealId]: isFavorited
    }));
  };

  // Initialize favorite states when favorites are loaded
  useEffect(() => {
    if (favorites) {
      const states: Record<number, boolean> = {};
      favorites.forEach(meal => {
        states[meal.id] = true;
      });
      setFavoriteStates(states);
    }
  }, [favorites]);

  const handleRetry = () => {
    console.log('Retrying meals fetch...');
    refetch();
  };

  const handleMealPress = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedMeal(null);
  };

  const renderMealItem = ({ item }: { item: any }) => (
    <MealCard 
      meal={item} 
      onPress={() => handleMealPress(item)}
      isFavorited={favoriteStates[item.id] || false}
      onFavoriteToggle={handleFavoriteToggle}
    />
  );

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: heroOpacity }]}>
      {/* Hero Section with Gradient */}
      <LinearGradient
        colors={colorScheme === 'dark' 
          ? ['#2C3E50', '#34495E', '#2C3E50'] 
          : ['#F8F6F1', '#FDFBF7', '#F8F6F1']
        }
        style={styles.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="leaf" size={32} color="#FFFFFF" />
            </View>
          </View>
          
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Save Food, Save Money,{'\n'}Save the Planet
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.text }]}>
            Discover delicious meals from local restaurants at amazing prices
          </Text>
          
          {/* Enhanced Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="leaf-outline" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statNumber, { color: colors.primary }]}>2.5M</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Meals Saved</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="wallet-outline" size={24} color={colors.accent} />
              </View>
              <Text style={[styles.statNumber, { color: colors.accent }]}>€15M</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Money Saved</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="restaurant-outline" size={24} color={colors.secondary} />
              </View>
              <Text style={[styles.statNumber, { color: colors.secondary }]}>500+</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Local Partners</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Enhanced Search Bar */}
      <Animated.View 
        style={[
          styles.searchContainer, 
          { 
            backgroundColor: colors.card,
            transform: [{ scale: searchBarScale }]
          }
        ]}
      >
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for delicious meals..."
            placeholderTextColor={colors.text + '60'}
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            onFocus={() => animateSearchBar(true)}
            onBlur={() => animateSearchBar(false)}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color={colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Enhanced Filters */}
      {showFilters && (
        <Animated.View 
          style={[
            styles.filtersContainer, 
            { backgroundColor: colors.card }
          ]}
        >
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>Categories</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesContainer}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === '' && { 
                  backgroundColor: colors.primary,
                  transform: [{ scale: categoryScale }]
                }
              ]}
              onPress={() => handleCategoryChange('')}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === '' && { color: '#FFFFFF' }
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {filterOptions?.categories?.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && { 
                    backgroundColor: colors.primary,
                    transform: [{ scale: categoryScale }]
                  }
                ]}
                onPress={() => handleCategoryChange(category.id)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && { color: '#FFFFFF' }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: colors.primary + '20' }]}
          onPress={() => router.push('/orders')}
        >
          <Ionicons name="receipt-outline" size={20} color={colors.primary} />
          <Text style={[styles.quickActionText, { color: colors.primary }]}>Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: colors.accent + '20' }]}
          onPress={() => router.push('/checkout')}
        >
          <Ionicons name="cart-outline" size={20} color={colors.accent} />
          <Text style={[styles.quickActionText, { color: colors.accent }]}>
            Cart ({getItemCount()})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: colors.secondary + '20' }]}
          onPress={() => router.push('/profile')}
        >
          <Ionicons name="person-outline" size={20} color={colors.secondary} />
          <Text style={[styles.quickActionText, { color: colors.secondary }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name="restaurant-outline" size={64} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No meals available</Text>
      <Text style={[styles.emptySubtitle, { color: colors.text }]}>
        {isError 
          ? 'Failed to load meals. Please check your connection and try again.'
          : 'No meals match your current filters. Try adjusting your search criteria.'
        }
      </Text>
      {isError && (
        <Button
          title="Retry"
          onPress={handleRetry}
          variant="primary"
          style={styles.retryButton}
        />
      )}
    </View>
  );

  const renderFooter = () => {
    if (isLoading) {
      return <LoadingSpinner message="Loading more meals..." />;
    }
    return null;
  };

  // Show error state with retry option
  if (isError && !mealsData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.errorContainer}>
          <View style={[styles.errorIconContainer, { backgroundColor: colors.error + '20' }]}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          </View>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Something went wrong</Text>
          <Text style={[styles.errorMessage, { color: colors.text }]}>
            {error?.message || 'Failed to load meals. Please check your connection.'}
          </Text>
          <Button
            title="Try Again"
            onPress={handleRetry}
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <FlatList
        data={mealsData?.data || []}
        renderItem={renderMealItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
      <MealDetailModal
        meal={selectedMeal}
        visible={isModalVisible}
        onClose={handleCloseModal}
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
    paddingBottom: 100, // Space for tab bar
  },
  header: {
    marginBottom: 16,
  },
  heroGradient: {
    borderRadius: 20,
    marginBottom: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  heroContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  filterButton: {
    padding: 12,
    borderRadius: 12,
    marginLeft: 12,
  },
  filtersContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 32,
    marginBottom: 24,
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 22,
  },
  retryButton: {
    minWidth: 140,
    paddingHorizontal: 32,
  },
});
