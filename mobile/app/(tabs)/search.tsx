import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 40;

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

export default function SearchScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedTrades, setLikedTrades] = useState<string[]>([]);

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
        <TouchableOpacity style={[styles.modeButton, styles.activeModeButton]}>
          <Ionicons name="location" size={16} color={COLORS.white} />
          <Text style={styles.activeModeText}>In-Person</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeButton}>
          <Ionicons
            name="globe-outline"
            size={16}
            color={COLORS.text.secondary}
          />
          <Text style={styles.modeText}>Online</Text>
        </TouchableOpacity>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        {/* Background cards for depth effect */}
        {currentIndex + 1 < mockTrades.length && (
          <View style={[styles.card, styles.cardBehind]} />
        )}

        {/* Current card */}
        <View style={styles.card}>
          <Image
            source={{ uri: currentTrade.image }}
            style={styles.cardImage}
          />

          {/* Condition badge */}
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{currentTrade.condition}</Text>
          </View>

          {/* Card info */}
          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{currentTrade.title}</Text>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>
                  {currentTrade.tradePoints} TP
                </Text>
              </View>
            </View>

            <Text style={styles.cardDescription} numberOfLines={2}>
              {currentTrade.description}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={COLORS.text.secondary}
                />
                <Text style={styles.locationText}>{currentTrade.distance}</Text>
              </View>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={COLORS.secondary} />
                <Text style={styles.ratingText}>
                  {currentTrade.owner.rating}
                </Text>
                <Text style={styles.ownerText}>
                  • {currentTrade.owner.name}
                </Text>
              </View>
            </View>
          </View>
        </View>
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
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  instructions: {
    textAlign: "center",
    fontSize: SIZES.small,
    color: COLORS.text.secondary,
  },
  modeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SIZES.sm,
    paddingHorizontal: SIZES.padding,
    marginTop: 2,
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
    fontWeight: "600",
  },
  activeModeText: {
    fontSize: SIZES.small,
    color: COLORS.white,
    fontWeight: "600",
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius * 1.5,
    overflow: "hidden",
    ...SHADOWS.large,
  },
  cardBehind: {
    position: "absolute",
    top: -10,
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
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
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  cardTitle: {
    fontSize: SIZES.h4,
    fontWeight: "bold",
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
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: SIZES.small,
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
    color: COLORS.text.secondary,
  },
  ratingRow: {
    flexDirection: "row",
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
    color: COLORS.text.secondary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: SIZES.body,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginTop: SIZES.md,
  },
  emptySubtext: {
    fontSize: SIZES.small,
    color: COLORS.text.secondary,
    marginTop: SIZES.xs,
  },
});
