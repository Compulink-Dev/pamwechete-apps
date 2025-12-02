// app/(tabs)/index.tsx - Update the component
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useAuth } from "@clerk/clerk-expo"; // Add useAuth
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS, FONTS } from "../../constants/theme";
import api from "../../utils/api";
import { endpoints } from "@/utils/authApi";
import useCustomFonts from "../../hooks/useFonts";

interface Trade {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  tradePoints: number;
  images: { url: string }[];
  owner: {
    name: string;
    rating: { average: number };
  };
  location: {
    city: string;
    state: string;
  };
}

interface PortfolioStats {
  totalListings: number;
  activeTrades: number;
  completedTrades: number;
  tradePoints: number;
}

export default function HomeScreen() {
  const { user } = useUser();
  const { getToken } = useAuth(); // Get getToken for authenticated requests
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalListings: 0,
    activeTrades: 0,
    completedTrades: 0,
    tradePoints: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);

  // Add font loading
  const fontsLoaded = useCustomFonts();

  useEffect(() => {
    fetchTrades();
    fetchPortfolioStats();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await api.get(endpoints.trades.list);
      setTrades(response.data.trades || []);
    } catch (error) {
      console.error("Error fetching trades:", error);
    }
  };

  const fetchPortfolioStats = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      // Get user profile to get stats
      const response = await api.get(endpoints.users.profile, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.user;
      if (userData) {
        setPortfolioStats({
          totalListings: userData.totalTrades || 0,
          activeTrades: userData.activeTrades || 0,
          completedTrades: userData.completedTrades || 0,
          tradePoints: userData.tradePoints || 0,
        });
      }

      // Alternative: Count trades by owner
      try {
        const tradesResponse = await api.get(endpoints.trades.list, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (tradesResponse.data.trades) {
          const userTrades = tradesResponse.data.trades.filter(
            (trade: any) => trade.owner?._id === userData?._id
          );

          const activeTrades = userTrades.filter(
            (trade: any) => trade.status === "active"
          ).length;

          const completedTrades = userTrades.filter(
            (trade: any) => trade.status === "completed"
          ).length;

          const totalTradePoints = userTrades.reduce(
            (sum: number, trade: any) => sum + (trade.tradePoints || 0),
            0
          );

          setPortfolioStats({
            totalListings: userTrades.length,
            activeTrades,
            completedTrades,
            tradePoints: totalTradePoints,
          });
        }
      } catch (tradesError) {
        console.log("Could not fetch user trades for counting");
      }
    } catch (error) {
      console.error("Error fetching portfolio stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function
  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchTrades(), fetchPortfolioStats()]);
    setLoading(false);
  };

  // Show loading while fonts are loading
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const renderTradeCard = (trade: Trade) => (
    <TouchableOpacity
      key={trade._id}
      style={styles.tradeCard}
      onPress={() => router.push(`/trades/${trade._id}` as any)}
    >
      <Image
        source={{
          uri: trade.images[0]?.url || "https://via.placeholder.com/300",
        }}
        style={styles.tradeImage}
      />
      <View style={styles.tradeContent}>
        <View style={styles.tradeHeader}>
          <Text style={styles.tradeTitle}>{trade.title}</Text>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{trade.tradePoints} TP</Text>
          </View>
        </View>
        <Text style={styles.tradeDescription} numberOfLines={2}>
          {trade.description}
        </Text>
        <View style={styles.tradeFooter}>
          <View style={styles.tradeLocation}>
            <Ionicons
              name="location-outline"
              size={14}
              color={COLORS.text.secondary}
            />
            <Text style={styles.locationText}>
              {trade.location?.city}, {trade.location?.state}
            </Text>
          </View>
          <TouchableOpacity style={styles.exchangeButton}>
            <Ionicons name="swap-horizontal" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.userName}>{user?.firstName || "Trader"}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/trades/add" as any)}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Trade Portfolio Summary */}
      <TouchableOpacity style={styles.portfolioCard} onPress={refreshData}>
        <View style={styles.portfolioHeader}>
          <Text style={styles.portfolioTitle}>Trade Portfolio</Text>
          {loading && <ActivityIndicator size="small" color={COLORS.primary} />}
        </View>
        <View style={styles.portfolioStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{portfolioStats.totalListings}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{portfolioStats.activeTrades}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {portfolioStats.completedTrades}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
        <Text style={styles.tradePoints}>{portfolioStats.tradePoints} TP</Text>
      </TouchableOpacity>

      {/* Available Trades */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Trades</Text>
        <TouchableOpacity onPress={() => router.push("/search" as any)}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshData} />
        }
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={styles.loader}
          />
        ) : trades.length > 0 ? (
          trades.map(renderTradeCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={COLORS.text.light} />
            <Text style={styles.emptyText}>No trades available</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={refreshData}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Trade Modal - Keep your existing modal code */}
    </SafeAreaView>
  );
}

// Add these new styles:
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
  },
  logo: {
    width: 60,
    height: 60,
  },
  welcomeText: {
    fontSize: SIZES.small,
    color: COLORS.text.secondary,
    fontFamily: FONTS.regular,
  },
  userName: {
    fontSize: SIZES.body,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderRadius: SIZES.radius,
    gap: SIZES.xs,
  },
  addButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: SIZES.small,
  },
  portfolioCard: {
    margin: SIZES.padding,
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius,
    ...SHADOWS.medium,
  },
  portfolioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  portfolioTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semibold,
    color: COLORS.text.primary,
  },
  portfolioStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: SIZES.md,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.small,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
    marginTop: SIZES.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  tradePoints: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    textAlign: "center",
    marginTop: SIZES.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.sm,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.text.primary,
  },
  seeAllText: {
    fontSize: SIZES.small,
    color: COLORS.secondary,
    fontFamily: FONTS.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingTop: 0,
  },
  tradeCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius,
    marginBottom: SIZES.md,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  tradeImage: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.border,
  },
  tradeContent: {
    padding: SIZES.md,
  },
  tradeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.xs,
  },
  tradeTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.bold,
    color: COLORS.text.primary,
    flex: 1,
  },
  pointsBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  pointsText: {
    color: COLORS.white,
    fontSize: SIZES.tiny,
    fontFamily: FONTS.bold,
  },
  tradeDescription: {
    fontSize: SIZES.small,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
    marginBottom: SIZES.sm,
  },
  tradeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tradeLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: SIZES.tiny,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
  },
  exchangeButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    marginTop: SIZES.xxl,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.xxl * 2,
  },
  emptyText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.text.light,
    marginTop: SIZES.md,
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
    fontFamily: FONTS.bold,
    fontSize: SIZES.small,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.cardRadius,
    borderTopRightRadius: SIZES.cardRadius,
    padding: SIZES.padding * 1.5,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.text.primary,
  },
  modalSubtitle: {
    fontSize: SIZES.small,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
    marginBottom: SIZES.xl,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  modalButtonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontFamily: FONTS.bold,
  },
  modalButtonTextSecondary: {
    color: COLORS.primary,
  },
});
