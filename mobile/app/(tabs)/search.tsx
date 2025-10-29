import { useState, useRef } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import useAppFonts from "@/hooks/useFonts";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 40;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface TradeCard {
  id: string;
  title: string;
  description: string;
  image: string;
  tradePoints: number;
  location: string;
  distance: string;
  condition: string;
  owner: {
    name: string;
    rating: number;
  };
}

const mockTrades: TradeCard[] = [
  {
    id: "1",
    title: "Samsung S24",
    description: "Great condition, barely used. Comes with original case.",
    image: "https://via.placeholder.com/400",
    tradePoints: 167,
    location: "New York, NY",
    distance: "4 miles away",
    condition: "Good",
    owner: { name: "John Doe", rating: 4.8 },
  },
  {
    id: "2",
    title: "Designer Handbag",
    description: "Authentic designer handbag from 2023 collection",
    image: "https://via.placeholder.com/400",
    tradePoints: 450,
    location: "Brooklyn, NY",
    distance: "8 miles away",
    condition: "Excellent",
    owner: { name: "Jane Smith", rating: 4.7 },
  },
  {
    id: "3",
    title: "Gaming Console",
    description: "Like new gaming console with 2 controllers",
    image: "https://via.placeholder.com/400",
    tradePoints: 300,
    location: "Queens, NY",
    distance: "12 miles away",
    condition: "Like New",
    owner: { name: "Mike Johnson", rating: 4.9 },
  },
];

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

      <Image source={{ uri: trade.image }} style={styles.cardImage} />

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
            <Text style={styles.locationText}>{trade.distance}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={COLORS.secondary} />
            <Text style={styles.ratingText}>{trade.owner.rating}</Text>
            <Text style={styles.ownerText}>• {trade.owner.name}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default function SearchScreen() {
  const { fontsLoaded } = useAppFonts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedTrades, setLikedTrades] = useState<string[]>([]);
  const [activeMode, setActiveMode] = useState<"in-person" | "online">(
    "in-person"
  );

  if (!fontsLoaded) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const currentTrade = mockTrades[currentIndex];

  const handleLike = () => {
    if (currentTrade) {
      setLikedTrades([...likedTrades, currentTrade.id]);
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
    if (currentIndex < mockTrades.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reset or show "no more trades" message
      setCurrentIndex(0);
    }
  };

  if (!currentTrade) {
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
          <Text style={styles.emptyText}>No more trades</Text>
          <Text style={styles.emptySubtext}>
            Check back later for new items
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Trades</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color={COLORS.text.primary} />
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
        {currentIndex + 1 < mockTrades.length && (
          <View style={[styles.card, styles.cardBehind]} />
        )}
        {currentIndex + 2 < mockTrades.length && (
          <View style={[styles.card, styles.cardFurtherBehind]} />
        )}

        {/* Current swipeable card */}
        <SwipeCard
          trade={currentTrade}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          isActive={true}
        />
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.passButton} onPress={handlePass}>
          <Ionicons name="close" size={32} color={COLORS.error} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoButton}>
          <Ionicons
            name="information-circle-outline"
            size={28}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Ionicons name="heart" size={32} color={COLORS.success} />
        </TouchableOpacity>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {mockTrades.length}
        </Text>
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
});
