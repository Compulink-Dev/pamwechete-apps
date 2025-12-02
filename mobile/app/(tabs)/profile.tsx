// app/(tabs)/profile.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useClerk, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS, SIZES, SHADOWS, FONTS } from "../../constants/theme";
import api from "../../utils/api";
import { endpoints } from "@/utils/authApi";
import useAppFonts from "@/hooks/useFonts";

interface UserProfile {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  tradePoints: number;
  rating: { average: number; count: number };
  completedTrades: number;
  activeTrades: number;
  isVerified: boolean;
  phone: string | null;
  address: any;
  createdAt: string;
  verification: {
    status: string;
    phoneVerified: boolean;
    documents: any[];
  };
}

export default function ProfileScreen() {
  const { fontsLoaded } = useAppFonts();

  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!fontsLoaded) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const makeAuthenticatedRequest = async (config: any) => {
    try {
      const token = await getToken();
      console.log("🔐 Token available:", !!token);

      const finalConfig = {
        ...config,
        headers: {
          ...config.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      console.log(
        "🌐 Making request to:",
        `${api.defaults.baseURL}${config.url}`
      );
      return api(finalConfig);
    } catch (error) {
      console.error("❌ Auth request setup failed:", error);
      throw error;
    }
  };

  const fetchUserProfile = async () => {
    try {
      setError(null);
      console.log("🔄 Fetching user profile...");

      const response = await makeAuthenticatedRequest({
        method: "GET",
        url: endpoints.users.profile,
      });

      console.log("✅ Profile response status:", response.status);
      console.log("✅ Profile data:", response.data);

      const userData = response.data.user;

      // Check if user data exists
      if (!userData) {
        throw new Error("No user data received");
      }

      // Store the complete user profile
      setUserProfile({
        id: userData.id,
        clerkId: userData.clerkId,
        name: userData.name || "Trader", // Use API name
        email: userData.email,
        tradePoints: userData.tradePoints || 0,
        rating: userData.rating || { average: 0, count: 0 },
        completedTrades: userData.completedTrades || 0,
        activeTrades: userData.activeTrades || 0,
        isVerified: userData.isVerified || false,
        phone: userData.phone || null,
        address: userData.address || {},
        createdAt: userData.createdAt,
        verification: userData.verification || {
          status: "pending",
          phoneVerified: false,
          documents: [],
        },
      });
    } catch (error: any) {
      console.error("❌ Profile fetch error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });

      // More specific error handling
      if (error.code === "ERR_NETWORK") {
        setError("Network error: Cannot connect to server");
      } else if (error.response?.status === 401) {
        setError("Session expired. Please sign in again.");
      } else if (error.response?.status === 404) {
        setError("Profile not found. Creating new profile...");
        await syncUser();
      } else if (error.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          "Failed to load profile: " + (error.message || "Unknown error")
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const syncUser = async () => {
    try {
      console.log("🔄 Syncing user with backend...");

      if (!clerkUser) {
        throw new Error("No clerk user available");
      }

      const response = await makeAuthenticatedRequest({
        method: "POST",
        url: endpoints.users.sync,
        data: {
          clerkId: clerkUser.id,
          name: clerkUser.fullName || "Trader", // Use Clerk name for initial sync
          email: clerkUser.primaryEmailAddress?.emailAddress,
          phone: clerkUser.primaryPhoneNumber?.phoneNumber,
        },
      });

      console.log("✅ Sync successful:", response.data);

      // Retry fetching profile after sync
      await fetchUserProfile();
    } catch (syncError: any) {
      console.error("❌ Sync failed:", {
        message: syncError.message,
        status: syncError.response?.status,
        data: syncError.response?.data,
      });
      setError("Failed to create profile. Please try again.");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
  };

  useEffect(() => {
    if (isLoaded && clerkUser) {
      fetchUserProfile();
    }
  }, [isLoaded, clerkUser]);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/");
        },
      },
    ]);
  };

  const handleVerifyAccount = () => {
    Alert.alert(
      "Verify Account",
      "To start trading, you need to verify your account by uploading:\n\n• Valid ID (Driver's License, Passport, or ID)\n• Proof of Residence (optional)\n• Phone Verification",
      [
        { text: "Later", style: "cancel" },
        {
          text: "Verify Now",
          onPress: () => {
            /* Navigate to verification */
          },
        },
      ]
    );
  };

  // Error state component
  if (error && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Unable to Load Profile</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchUserProfile}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {/* Verification Alert */}
        {userProfile && !userProfile.isVerified && !loading && (
          <TouchableOpacity
            style={styles.verificationAlert}
            onPress={handleVerifyAccount}
          >
            <Ionicons name="alert-circle" size={24} color={COLORS.warning} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Account Not Verified</Text>
              <Text style={styles.alertText}>
                Verify your account to start trading
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>
        )}

        {/* Profile Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: clerkUser?.imageUrl || "https://via.placeholder.com/100",
              }}
              style={styles.avatar}
            />
            {userProfile?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.success}
                />
              </View>
            )}
          </View>

          {/* Use the name from API response */}
          <Text style={styles.profileName}>
            {userProfile?.name || clerkUser?.fullName || "Trader"}
          </Text>
          <Text style={styles.profileEmail}>
            {userProfile?.email || clerkUser?.primaryEmailAddress?.emailAddress}
          </Text>

          {loading ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={{ marginVertical: SIZES.md }}
            />
          ) : (
            userProfile && (
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {userProfile.tradePoints}
                  </Text>
                  <Text style={styles.statLabel}>TP</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {userProfile.rating.average.toFixed(1)}
                  </Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {userProfile.completedTrades}
                  </Text>
                  <Text style={styles.statLabel}>Trades</Text>
                </View>
              </View>
            )
          )}

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Only show menu items when not loading and no error */}
        {!loading && !error && userProfile && (
          <>
            {/* Menu Items */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Account</Text>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text style={styles.menuItemText}>Personal Information</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleVerifyAccount}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text style={styles.menuItemText}>Verification</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {!userProfile.isVerified && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingText}>
                        {userProfile.verification.status === "pending"
                          ? "Pending"
                          : "Required"}
                      </Text>
                    </View>
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.text.secondary}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text style={styles.menuItemText}>Address</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Trading</Text>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="cube-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text style={styles.menuItemText}>My Trades</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="heart-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text style={styles.menuItemText}>Wishlist</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="time-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text style={styles.menuItemText}>Trade History</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Settings</Text>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text style={styles.menuItemText}>Notifications</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text style={styles.menuItemText}>Privacy & Security</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="help-circle-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text style={styles.menuItemText}>Help & Support</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text style={styles.menuItemText}>About</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.version}>Version 1.0.0</Text>
            </View>
          </>
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
  verificationAlert: {
    flexDirection: "row",
    alignItems: "center",
    margin: SIZES.padding,
    padding: SIZES.md,
    backgroundColor: "#FFF3CD",
    borderRadius: SIZES.radius,
    gap: SIZES.sm,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Bold",
    color: "#856404",
    marginBottom: 2,
  },
  alertText: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Regular",
    color: "#856404",
  },
  profileCard: {
    backgroundColor: COLORS.white,
    margin: SIZES.padding,
    marginTop: SIZES.sm,
    padding: SIZES.padding,
    borderRadius: SIZES.cardRadius,
    alignItems: "center",
    ...SHADOWS.medium,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: SIZES.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.border,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  profileName: {
    fontSize: SIZES.h3,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
    marginBottom: SIZES.xs,
  },
  profileEmail: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
    marginBottom: SIZES.lg,
  },
  statsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginBottom: SIZES.lg,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: SIZES.h3,
    fontFamily: "Rubik-Bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
    marginTop: SIZES.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  editButton: {
    width: "100%",
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Medium",
    color: COLORS.primary,
  },
  menuSection: {
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.secondary,
    marginBottom: SIZES.sm,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.xs,
    ...SHADOWS.small,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.md,
  },
  menuItemText: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.primary,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
  },
  pendingBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.xs,
  },
  pendingText: {
    fontSize: SIZES.tiny,
    color: COLORS.white,
    fontFamily: "Rubik-Bold",
  },
  footer: {
    alignItems: "center",
    paddingVertical: SIZES.xl,
  },
  version: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.light,
  },
  // Add error styles
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding,
  },
  errorTitle: {
    fontSize: SIZES.h3,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  errorMessage: {
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
    fontFamily: "Rubik-Regular",
    textAlign: "center",
    marginBottom: SIZES.xl,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontFamily: "Rubik-Bold",
  },
});
