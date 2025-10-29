import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import useAppFonts from "@/hooks/useFonts";

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

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    rating: number;
  };
  trade: {
    title: string;
    category: string;
    images: string[];
    tradePoints: number;
    condition: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
}

const mockPosts: Post[] = [
  {
    id: "1",
    user: {
      name: "John Doe",
      avatar: "https://via.placeholder.com/40",
      rating: 4.8,
    },
    trade: {
      title: "Samsung S24",
      category: "Electronics",
      images: ["https://via.placeholder.com/300"],
      tradePoints: 167,
      condition: "Good",
    },
    timestamp: "2h ago",
    likes: 24,
    comments: 5,
  },
  {
    id: "2",
    user: {
      name: "Jane Smith",
      avatar: "https://via.placeholder.com/40",
      rating: 4.7,
    },
    trade: {
      title: "Designer Handbag",
      category: "Fashion",
      images: ["https://via.placeholder.com/300"],
      tradePoints: 450,
      condition: "Excellent",
    },
    timestamp: "5h ago",
    likes: 42,
    comments: 12,
  },
];

export default function CommunityScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { fontsLoaded } = useAppFonts();

  if (!fontsLoaded) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const renderPost = (post: Post) => (
    <View key={post.id} style={styles.postCard}>
      {/* User header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: post.user.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.user.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={COLORS.secondary} />
            <Text style={styles.ratingText}>{post.user.rating}</Text>
            <Text style={styles.timestamp}>• {post.timestamp}</Text>
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
      <Image source={{ uri: post.trade.images[0] }} style={styles.postImage} />

      {/* Trade info */}
      <View style={styles.postContent}>
        <View style={styles.tradeHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{post.trade.category}</Text>
          </View>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{post.trade.condition}</Text>
          </View>
        </View>

        <Text style={styles.tradeTitle}>{post.trade.title}</Text>

        <View style={styles.pointsRow}>
          <Text style={styles.pointsLabel}>Trade Points:</Text>
          <Text style={styles.pointsValue}>{post.trade.tradePoints} TP</Text>
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
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={COLORS.text.primary}
          />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="swap-horizontal" size={24} color={COLORS.primary} />
          <Text style={[styles.actionText, { color: COLORS.primary }]}>
            Trade
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
      >
        {mockPosts.map(renderPost)}
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
    gap: SIZES.sm,
    borderColor: COLORS.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    gap: SIZES.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SIZES.sm,
    fontFamily: "Rubik-Regular",
    fontSize: SIZES.body,
    color: COLORS.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radius,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: COLORS.background,
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
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
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
    marginBottom: SIZES.sm,
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
});
