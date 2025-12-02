import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import useAppFonts from "@/hooks/useFonts";
import api from "../../utils/api";
import { endpoints } from "../../utils/authApi";

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Books",
  "Sports",
  "Art",
  "Music",
  "Gaming",
  "Furniture",
  "Other",
];

interface Trade {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  tradePoints: number;
  images: { url: string }[];
  owner: {
    _id: string;
    name: string;
    rating: { average: number };
  };
  location: {
    city: string;
    state: string;
  };
  views: number;
  likes: number;
  createdAt: string;
}

export default function CommunityScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { fontsLoaded } = useAppFonts();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchTrades();
  }, [selectedCategory]);

  const fetchTrades = async (loadMore = false) => {
    try {
      if (loadMore) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const currentPage = loadMore ? page + 1 : 1;
      const params: any = {
        page: currentPage,
        limit: 10,
        status: "active",
      };

      // Filter by category if not "All"
      if (selectedCategory !== "All") {
        params.category = selectedCategory;
      }

      // Add search query if exists
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      const response = await api.get(endpoints.trades.search, { params });

      const newTrades = response.data.trades || [];

      if (loadMore) {
        setTrades((prev) => [...prev, ...newTrades]);
        setPage(currentPage);
      } else {
        setTrades(newTrades);
        setPage(1);
      }

      // Check if there are more trades to load
      const total = response.data.count || 0;
      const currentCount = loadMore
        ? trades.length + newTrades.length
        : newTrades.length;
      setHasMore(currentCount < total);
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

  const refreshTrades = () => {
    fetchTrades(false);
  };

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchTrades(true);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const past = new Date(dateString);

      // Check if date is valid
      if (isNaN(past.getTime())) {
        return "Recently";
      }

      const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return `${Math.floor(diffInSeconds / 604800)}w ago`;
    } catch (error) {
      return "Recently";
    }
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

  const renderTrade = (trade: Trade) => (
    <TouchableOpacity
      key={trade._id}
      style={styles.postCard}
      onPress={() => router.push(`/trades/${trade._id}` as any)}
    >
      {/* User header */}
      <View style={styles.postHeader}>
        <Image
          source={{
            uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              trade.owner.name || "User"
            )}&background=${COLORS.primary.replace("#", "")}&color=fff`,
          }}
          style={styles.userAvatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {trade.owner.name || "Unknown User"}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={COLORS.secondary} />
            <Text style={styles.ratingText}>
              {trade.owner.rating?.average?.toFixed(1) || "0.0"}
            </Text>
            <Text style={styles.timestamp}>
              • {formatTimeAgo(trade.createdAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={COLORS.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* Trade image */}
      <Image
        source={{
          uri: trade.images[0]?.url || "https://via.placeholder.com/300",
        }}
        style={styles.postImage}
      />

      {/* Trade info */}
      <View style={styles.postContent}>
        <View style={styles.tradeHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{trade.category || "Other"}</Text>
          </View>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>
              {trade.condition ? trade.condition.replace("_", " ") : "Good"}
            </Text>
          </View>
        </View>

        <Text style={styles.tradeTitle}>{trade.title}</Text>
        <Text style={styles.tradeDescription} numberOfLines={2}>
          {trade.description}
        </Text>

        <View style={styles.pointsRow}>
          <Text style={styles.pointsLabel}>Trade Points:</Text>
          <Text style={styles.pointsValue}>{trade.tradePoints || 0} TP</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="heart-outline"
            size={24}
            color={COLORS.text.primary}
          />
          <Text style={styles.actionText}>{trade.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={COLORS.text.primary}
          />
          <Text style={styles.actionText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            // Navigate to trade request screen
          }}
        >
          <Ionicons name="swap-horizontal" size={24} color={COLORS.primary} />
          <Text style={[styles.actionText, { color: COLORS.primary }]}>
            Trade
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchTrades(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity>
          <Ionicons
            name="notifications-outline"
            size={20}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trades..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholderTextColor={COLORS.text.light}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts feed */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshTrades}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onScroll={({ nativeEvent }) => {
          if (
            nativeEvent.layoutMeasurement.height +
              nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - 50
          ) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && trades.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={styles.loader}
          />
        ) : trades.length > 0 ? (
          <>
            {trades.map(renderTrade)}
            {hasMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadMoreText}>Loading more trades...</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={COLORS.text.light} />
            <Text style={styles.emptyText}>No trades found</Text>
            <Text style={styles.emptySubtext}>
              {selectedCategory !== "All"
                ? `No ${selectedCategory} trades available`
                : "Check back later for new items"}
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={refreshTrades}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: SIZES.padding,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.sm,
    gap: SIZES.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: SIZES.sm,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Rubik-Regular",
    fontSize: SIZES.body,
    color: COLORS.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.small,
  },
  categoriesScroll: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.sm,
    gap: SIZES.sm,
  },
  categoryChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.secondary,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingTop: SIZES.sm,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius,
    marginBottom: SIZES.md,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  userInfo: {
    flex: 1,
    marginLeft: SIZES.sm,
  },
  userName: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.primary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: SIZES.tiny,
    color: COLORS.text.primary,
    fontFamily: "Rubik-Medium",
  },
  timestamp: {
    fontSize: SIZES.tiny,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
  },
  postImage: {
    width: "100%",
    height: 250,
    backgroundColor: COLORS.border,
  },
  postContent: {
    padding: SIZES.md,
  },
  tradeHeader: {
    flexDirection: "row",
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: SIZES.tiny,
    fontFamily: "Rubik-Bold",
  },
  conditionBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  conditionText: {
    color: COLORS.white,
    fontSize: SIZES.tiny,
    fontFamily: "Rubik-Bold",
  },
  tradeTitle: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
    marginBottom: SIZES.xs,
  },
  tradeDescription: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
    marginBottom: SIZES.sm,
    lineHeight: 20,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.xs,
  },
  pointsLabel: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
  },
  pointsValue: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Bold",
    color: COLORS.secondary,
  },
  postActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.xs,
    paddingVertical: SIZES.xs,
  },
  actionText: {
    fontSize: SIZES.small,
    color: COLORS.text.primary,
    fontFamily: "Rubik-Medium",
  },
  loader: {
    marginTop: SIZES.xxl * 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.xxl * 2,
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
    textAlign: "center",
  },
  refreshButton: {
    marginTop: SIZES.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontFamily: "Rubik-Bold",
  },
  loadMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  loadMoreText: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
  },
});
