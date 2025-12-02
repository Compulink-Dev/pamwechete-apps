import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../../../constants/theme";
import { endpoints } from "../../../utils/authApi";
import api from "../../../utils/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Trade {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  tradePoints: number;
  baseValue: number;
  age: number;
  quality: number;
  brand?: string;
  images: { url: string }[];
  owner: {
    _id: string;
    name: string;
    rating: { average: number };
  };
  location: {
    city: string;
    state: string;
    coordinates?: [number, number];
  };
  status: string;
  views: number;
  likes: number;
  createdAt: string;
}

export default function TradeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchTradeDetails();
  }, [id]);

  const fetchTradeDetails = async () => {
    try {
      const token = await getToken();
      const response = await api.get(endpoints.trades.details(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrade(response.data.trade);
    } catch (error: any) {
      console.error("Error fetching trade:", error);
      Alert.alert("Error", "Failed to load trade details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTrade = () => {
    Alert.alert(
      "Request Trade",
      `Send a trade request for "${trade?.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Request",
          onPress: async () => {
            try {
              const token = await getToken();
              await api.post(
                endpoints.tradeRequests.create,
                { tradeId: id },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Alert.alert("Success", "Trade request sent!");
            } catch (error) {
              Alert.alert("Error", "Failed to send trade request");
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert("Delete Trade", "Are you sure you want to delete this trade?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            await api.delete(endpoints.trades.delete(id), {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Success", "Trade deleted successfully");
            router.back();
          } catch (error) {
            Alert.alert("Error", "Failed to delete trade");
          }
        },
      },
    ]);
  };

  const toggleLike = async () => {
    try {
      const token = await getToken();
      await api.post(
        endpoints.trades.wishlist,
        { tradeId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!trade) {
    return null;
  }

  const isOwner = trade.owner._id === user?.id;
  const images =
    trade.images.length > 0
      ? trade.images
      : [{ url: "https://via.placeholder.com/400" }];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleLike}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? COLORS.error : COLORS.text.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="share-outline"
                size={24}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image.url }}
                style={styles.tradeImage}
              />
            ))}
          </ScrollView>
          <View style={styles.imageIndicator}>
            <Text style={styles.imageIndicatorText}>
              {currentImageIndex + 1} / {images.length}
            </Text>
          </View>
        </View>

        {/* Trade Info */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{trade.title}</Text>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{trade.tradePoints} TP</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{trade.condition}</Text>
            </View>
            <Text style={styles.category}>{trade.category}</Text>
          </View>

          <Text style={styles.description}>{trade.description}</Text>

          {/* Trade Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Trade Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Base Value:</Text>
              <Text style={styles.detailValue}>${trade.baseValue}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Age:</Text>
              <Text style={styles.detailValue}>{trade.age} years</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quality:</Text>
              <Text style={styles.detailValue}>{trade.quality}/10</Text>
            </View>
            {trade.brand && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Brand:</Text>
                <Text style={styles.detailValue}>{trade.brand}</Text>
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <Text style={styles.locationText}>
              {trade.location.city}, {trade.location.state}
            </Text>
          </View>

          {/* Owner Info */}
          <View style={styles.ownerCard}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <View style={styles.ownerRow}>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{trade.owner.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color={COLORS.secondary} />
                  <Text style={styles.ratingText}>
                    {trade.owner.rating.average.toFixed(1)}
                  </Text>
                </View>
              </View>
              {!isOwner && (
                <TouchableOpacity style={styles.messageButton}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons
                name="eye-outline"
                size={20}
                color={COLORS.text.secondary}
              />
              <Text style={styles.statText}>{trade.views} views</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="heart-outline"
                size={20}
                color={COLORS.text.secondary}
              />
              <Text style={styles.statText}>{trade.likes} likes</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        {isOwner ? (
          <View style={styles.ownerActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => router.push(`/trades/${id}/edit` as any)}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestTrade}
          >
            <Ionicons name="swap-horizontal" size={24} color={COLORS.white} />
            <Text style={styles.requestButtonText}>Request Trade</Text>
          </TouchableOpacity>
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.padding,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.small,
  },
  headerActions: {
    flexDirection: "row",
    gap: SIZES.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.small,
  },
  imageContainer: {
    position: "relative",
  },
  tradeImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: COLORS.border,
  },
  imageIndicator: {
    position: "absolute",
    bottom: SIZES.md,
    right: SIZES.md,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radius,
  },
  imageIndicatorText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
  },
  content: {
    padding: SIZES.padding,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.sm,
  },
  title: {
    flex: 1,
    fontSize: SIZES.h2,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
    marginRight: SIZES.md,
  },
  pointsBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
  },
  pointsText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontFamily: "Rubik-Bold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  conditionBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  conditionText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontFamily: "Rubik-Bold",
  },
  category: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.secondary,
  },
  description: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.primary,
    lineHeight: 24,
    marginBottom: SIZES.lg,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
    marginBottom: SIZES.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SIZES.xs,
  },
  detailLabel: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
  },
  detailValue: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.primary,
  },
  locationCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.xs,
    marginBottom: SIZES.sm,
  },
  locationText: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.primary,
  },
  ownerCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  ownerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
    marginBottom: SIZES.xs,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.primary,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.xs,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
  },
  messageButtonText: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.primary,
  },
  statsRow: {
    flexDirection: "row",
    gap: SIZES.xl,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.xs,
  },
  statText: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
  },
  bottomBar: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  requestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
  },
  requestButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontFamily: "Rubik-Bold",
  },
  ownerActions: {
    flexDirection: "row",
    gap: SIZES.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.xs,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontFamily: "Rubik-Bold",
  },
});
