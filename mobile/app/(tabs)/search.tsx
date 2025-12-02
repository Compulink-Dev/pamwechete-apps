import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../utils/api";
import { endpoints } from "../../utils/authApi";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import useAppFonts from "@/hooks/useFonts";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 40;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface TradeCard {
  _id: string;
  title: string;
  description: string;
  images: { url: string }[];
  tradePoints: number;
  location: {
    city: string;
    state: string;
  };
  condition: string;
  owner: {
    name: string;
    rating: { average: number };
  };
}

// SwipeCard Component
interface SwipeCardProps {
  trade: TradeCard;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isActive?: boolean;
}

const SwipeCard = ({
  trade,
  onSwipeLeft,
  onSwipeRight,
  isActive = true,
}: SwipeCardProps) => {
  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isActive,
    onMoveShouldSetPanResponder: () => isActive,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        // Swipe right
        Animated.spring(position, {
          toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
          useNativeDriver: true,
        }).start(() => {
          onSwipeRight?.();
        });
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        // Swipe left
        Animated.spring(position, {
          toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
          useNativeDriver: true,
        }).start(() => {
          onSwipeLeft?.();
        });
      } else {
        // Return to center
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 4,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
    ],
  };

  return (
    <Animated.View
      style={[styles.card, cardStyle]}
      {...panResponder.panHandlers}
    >
      {/* Like/Nope Overlay */}
      <Animated.View
        style={[styles.likeOverlay, { opacity: likeOpacity }]}
        pointerEvents="none"
      >
        <Text style={styles.likeText}>LIKE</Text>
      </Animated.View>

      <Animated.View
        style={[styles.nopeOverlay, { opacity: nopeOpacity }]}
        pointerEvents="none"
      >
        <Text style={styles.nopeText}>NOPE</Text>
      </Animated.View>

      <Image
        source={{
          uri: trade.images[0]?.url || "https://via.placeholder.com/400",
        }}
        style={styles.cardImage}
      />

      {/* Condition badge */}
      <View style={styles.conditionBadge}>
        <Text style={styles.conditionText}>{trade.condition}</Text>
      </View>

      {/* Card info */}
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{trade.title}</Text>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{trade.tradePoints} TP</Text>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {trade.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={COLORS.text.secondary}
            />
            <Text style={styles.locationText}>
              {trade.location.city}, {trade.location.state}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={COLORS.secondary} />
            <Text style={styles.ratingText}>
              {trade.owner.rating.average.toFixed(1)}
            </Text>
            <Text style={styles.ownerText}>• {trade.owner.name}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// Update the SearchScreen component
export default function SearchScreen() {
  const { fontsLoaded } = useAppFonts();
  const { getToken } = useAuth();
  const [trades, setTrades] = useState<TradeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedTrades, setLikedTrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<"in-person" | "online">(
    "in-person"
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async (loadMore = false) => {
    try {
      if (loadMore) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = await getToken();
      const currentPage = loadMore ? page + 1 : 1;

      try {
        // Try recommendations first
        const response = await api.get(endpoints.trades.recommendations, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (loadMore) {
          // Append new trades
          setTrades((prev) => [
            ...prev,
            ...(response.data.trades || response.data.recommendations || []),
          ]);
          setPage(currentPage);
        } else {
          setTrades(
            response.data.trades || response.data.recommendations || []
          );
          setPage(1);
          setCurrentIndex(0);
        }

        // Check if there are more trades to load
        const newTrades =
          response.data.trades || response.data.recommendations || [];
        setHasMore(newTrades.length > 0);
      } catch (recommendationsError) {
        console.log("Recommendations failed, fetching regular trades");
        // Fallback to regular trades with pagination
        const response = await api.get(endpoints.trades.list, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, limit: 10 },
        });

        if (loadMore) {
          setTrades((prev) => [...prev, ...(response.data.trades || [])]);
          setPage(currentPage);
        } else {
          setTrades(response.data.trades || []);
          setPage(1);
          setCurrentIndex(0);
        }

        // Check pagination info
        const total = response.data.pagination?.total || 0;
        const currentTrades = response.data.trades || [];
        const pages = response.data.pagination?.pages || 1;
        setHasMore(currentPage < pages && currentTrades.length > 0);
      }
    } catch (error) {
      console.error("Error fetching trades:", error);
      if (!loadMore) {
        setTrades([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreTrades = () => {
    if (hasMore && !loading && !refreshing) {
      fetchTrades(true);
    }
  };

  const refreshTrades = () => {
    fetchTrades(false);
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const currentTrade = trades[currentIndex];

  const handleLike = async () => {
    if (currentTrade) {
      setLikedTrades([...likedTrades, currentTrade._id]);

      // Save to wishlist
      try {
        const token = await getToken();
        await api.post(
          endpoints.trades.wishlist,
          { tradeId: currentTrade._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Error adding to wishlist:", error);
      }

      nextCard();
    }
  };

  const handlePass = () => {
    nextCard();
  };

  const handleSwipeRight = () => {
    console.log("Interested in:", currentTrade?.title);
    handleLike();
  };

  const handleSwipeLeft = () => {
    console.log("Not interested in:", currentTrade?.title);
    handlePass();
  };

  const nextCard = () => {
    if (currentIndex < trades.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // We've reached the end of current trades, load more
      loadMoreTrades();
      // Reset to first card after loading
      setCurrentIndex(0);
    }
  };

  // Reset to first card when new trades are loaded
  useEffect(() => {
    if (trades.length > 0 && currentIndex >= trades.length) {
      setCurrentIndex(0);
    }
  }, [trades, currentIndex]);

  // Show loading screen when there are no trades and we're still loading
  if (loading && trades.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Find Trades</Text>
          <TouchableOpacity>
            <Ionicons name="filter" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading trades...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state when there are no trades
  if (!currentTrade && trades.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Find Trades</Text>
          <TouchableOpacity>
            <Ionicons name="filter" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={64} color={COLORS.text.light} />
          <Text style={styles.emptyText}>No trades available</Text>
          <Text style={styles.emptySubtext}>
            Check back later for new items
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshTrades}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.refreshButtonText}>Refresh</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Trades</Text>
        <TouchableOpacity onPress={refreshTrades} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="refresh" size={24} color={COLORS.text.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <Text style={styles.instructions}>
        Swipe right to trade, left to pass
      </Text>

      {/* Trade Modes */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            activeMode === "in-person" && styles.activeModeButton,
          ]}
          onPress={() => setActiveMode("in-person")}
        >
          <Ionicons
            name="location"
            size={16}
            color={
              activeMode === "in-person" ? COLORS.white : COLORS.text.secondary
            }
          />
          <Text
            style={
              activeMode === "in-person"
                ? styles.activeModeText
                : styles.modeText
            }
          >
            In-Person
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            activeMode === "online" && styles.activeModeButton,
          ]}
          onPress={() => setActiveMode("online")}
        >
          <Ionicons
            name="globe-outline"
            size={16}
            color={
              activeMode === "online" ? COLORS.white : COLORS.text.secondary
            }
          />
          <Text
            style={
              activeMode === "online" ? styles.activeModeText : styles.modeText
            }
          >
            Online
          </Text>
        </TouchableOpacity>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        {/* Background cards for depth effect */}
        {currentIndex + 1 < trades.length && (
          <View style={[styles.card, styles.cardBehind]} />
        )}
        {currentIndex + 2 < trades.length && (
          <View style={[styles.card, styles.cardFurtherBehind]} />
        )}

        {/* Show loading indicator when loading more */}
        {refreshing && trades.length === 0 && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingCardText}>Loading more trades...</Text>
          </View>
        )}

        {/* Current swipeable card */}
        {currentTrade && (
          <SwipeCard
            trade={currentTrade}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            isActive={!refreshing}
          />
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.passButton}
          onPress={handlePass}
          disabled={refreshing}
        >
          <Ionicons name="close" size={32} color={COLORS.error} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoButton}
          onPress={() =>
            currentTrade && router.push(`/trades/${currentTrade._id}` as any)
          }
          disabled={refreshing}
        >
          <Ionicons
            name="information-circle-outline"
            size={28}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleLike}
          disabled={refreshing}
        >
          <Ionicons name="heart" size={32} color={COLORS.success} />
        </TouchableOpacity>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {trades.length}
        </Text>
        {hasMore && trades.length > 0 && currentIndex === trades.length - 3 && (
          <Text style={styles.loadMoreHint}>Loading more trades...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
  },
  instructions: {
    textAlign: "center",
    fontFamily: "Rubik-Regular",
    fontSize: SIZES.small,
    color: COLORS.text.secondary,
    marginBottom: SIZES.md,
  },
  modeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SIZES.sm,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.lg,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    gap: SIZES.xs,
    ...SHADOWS.small,
  },
  activeModeButton: {
    backgroundColor: COLORS.primary,
  },
  modeText: {
    fontSize: SIZES.small,
    color: COLORS.text.secondary,
    fontFamily: "Rubik-Medium",
  },
  activeModeText: {
    fontSize: SIZES.small,
    color: COLORS.white,
    fontFamily: "Rubik-Medium",
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius * 1.5,
    overflow: "hidden",
    ...SHADOWS.large,
    position: "absolute",
  },
  cardBehind: {
    top: -5,
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  cardFurtherBehind: {
    top: -10,
    opacity: 0.4,
    transform: [{ scale: 0.9 }],
  },
  cardImage: {
    width: "100%",
    height: "60%",
    backgroundColor: COLORS.border,
  },
  conditionBadge: {
    position: "absolute",
    top: SIZES.md,
    right: SIZES.md,
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radius,
  },
  conditionText: {
    color: COLORS.white,
    fontSize: SIZES.tiny,
    fontWeight: "bold",
  },
  cardInfo: {
    padding: SIZES.padding,
    flex: 1,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  cardTitle: {
    fontSize: SIZES.h4,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
    flex: 1,
  },
  pointsBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radius,
  },
  pointsText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontFamily: "Rubik-Bold",
  },
  cardDescription: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.secondary,
    marginBottom: SIZES.md,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: SIZES.tiny,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
  },
  ratingRow: {
    flexDirection: "row",
    fontFamily: "Rubik-Medium",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: SIZES.tiny,
    color: COLORS.text.primary,
    fontWeight: "600",
  },
  ownerText: {
    fontSize: SIZES.tiny,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SIZES.xl,
    paddingVertical: SIZES.xl,
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.error,
    ...SHADOWS.medium,
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.success,
    ...SHADOWS.medium,
  },
  infoButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.small,
  },
  progressContainer: {
    alignItems: "center",
    paddingBottom: SIZES.md,
  },
  progressText: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.secondary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.primary,
    marginTop: SIZES.md,
  },
  emptySubtext: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
    marginTop: SIZES.xs,
  },
  // Swipe overlay styles
  likeOverlay: {
    position: "absolute",
    top: 50,
    left: 40,
    borderWidth: 4,
    borderColor: COLORS.success,
    borderRadius: 8,
    padding: 8,
    transform: [{ rotate: "-15deg" }],
    zIndex: 1000,
  },
  likeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.success,
  },
  nopeOverlay: {
    position: "absolute",
    top: 50,
    right: 40,
    borderWidth: 4,
    borderColor: COLORS.error,
    borderRadius: 8,
    padding: 8,
    transform: [{ rotate: "15deg" }],
    zIndex: 1000,
  },
  nopeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.error,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.primary,
    marginTop: SIZES.md,
  },
  loadingCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius * 1.5,
    overflow: "hidden",
    ...SHADOWS.large,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  loadingCardText: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
    marginTop: SIZES.md,
  },
  refreshButton: {
    marginTop: SIZES.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
    minWidth: 120,
    alignItems: "center",
  },
  refreshButtonText: {
    color: COLORS.white,
    fontFamily: "Rubik-Bold",
    fontSize: SIZES.small,
  },
  loadMoreHint: {
    fontSize: SIZES.tiny,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.light,
    marginTop: SIZES.xs,
  },
});
