import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import api from '../../utils/api';

interface Trade {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  tradePoints: number;
  images: { url: string }[];
  location: { city: string; state: string };
  owner: {
    _id: string;
    name: string;
    rating: { average: number };
  };
}

export default function WishlistScreen() {
  const { getToken } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWishlist = async () => {
    try {
      const token = await getToken();
      const response = await api.get('/trades/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTrades(response.data.trades || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWishlist();
  };

  const renderTradeCard = ({ item }: { item: Trade }) => (
    <TouchableOpacity
      style={styles.tradeCard}
      onPress={() => router.push(`/trades/${item._id}` as any)}
    >
      <Image
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/150' }}
        style={styles.tradeImage}
      />
      <View style={styles.overlay}>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{item.tradePoints} TP</Text>
        </View>
      </View>
      <View style={styles.tradeInfo}>
        <Text style={styles.tradeTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.tradeCategory}>{item.category}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.text.secondary} />
          <Text style={styles.locationText}>
            {item.location?.city}, {item.location?.state}
          </Text>
        </View>
        <View style={styles.ownerRow}>
          <Text style={styles.ownerName}>{item.owner.name}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.ratingText}>
              {item.owner.rating?.average?.toFixed(1) || 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Wishlist */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : trades.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="heart-outline" size={64} color={COLORS.text.light} />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>
            Save trades you're interested in to find them here
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/search' as any)}
          >
            <Text style={styles.browseButtonText}>Browse Trades</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trades}
          keyExtractor={(item) => item._id}
          renderItem={renderTradeCard}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.md,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontFamily: 'Rubik-Bold',
    color: COLORS.text.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.h4,
    fontFamily: 'Rubik-Bold',
    color: COLORS.text.primary,
    marginTop: SIZES.md,
    marginBottom: SIZES.xs,
  },
  emptySubtext: {
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Bold',
  },
  list: {
    padding: SIZES.padding,
  },
  row: {
    justifyContent: 'space-between',
  },
  tradeCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius,
    marginBottom: SIZES.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  tradeImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.border,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: SIZES.sm,
  },
  pointsBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.xs,
  },
  pointsText: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Bold',
    color: COLORS.white,
  },
  tradeInfo: {
    padding: SIZES.md,
  },
  tradeTitle: {
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.xs,
  },
  tradeCategory: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.secondary,
    marginBottom: SIZES.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SIZES.sm,
  },
  locationText: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.secondary,
  },
  ownerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerName: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Medium',
    color: COLORS.text.primary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Medium',
    color: COLORS.text.secondary,
  },
});
