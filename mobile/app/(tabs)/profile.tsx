import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { useUser, useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isVerified, setIsVerified] = useState(false);

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
      "To start trading, you need to verify your account by uploading:\\n\\n• Valid ID (Driver\\'s License, Passport, or ID)\\n• Proof of Residence (optional)\\n• Phone Verification'",
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {/* Verification Alert */}
        {!isVerified && (
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
                uri: user?.imageUrl || "https://via.placeholder.com/100",
              }}
              style={styles.avatar}
            />
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.success}
                />
              </View>
            )}
          </View>

          <Text style={styles.profileName}>{user?.fullName || "Trader"}</Text>
          <Text style={styles.profileEmail}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>1250</Text>
              <Text style={styles.statLabel}>TP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>Trades</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

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
              {!isVerified && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>Pending</Text>
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
              <Ionicons name="cube-outline" size={22} color={COLORS.primary} />
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
              <Ionicons name="heart-outline" size={22} color={COLORS.primary} />
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
              <Ionicons name="time-outline" size={22} color={COLORS.primary} />
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
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
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
    fontWeight: "bold",
    color: "#856404",
    marginBottom: 2,
  },
  alertText: {
    fontSize: SIZES.small,
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
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SIZES.xs,
  },
  profileEmail: {
    fontSize: SIZES.small,
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
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.small,
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
    fontWeight: "600",
    color: COLORS.primary,
  },
  menuSection: {
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.small,
    fontWeight: "bold",
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
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    paddingVertical: SIZES.xl,
  },
  version: {
    fontSize: SIZES.small,
    color: COLORS.text.light,
  },
});
