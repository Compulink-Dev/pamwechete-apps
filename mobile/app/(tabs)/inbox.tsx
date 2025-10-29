import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import useAppFonts from "@/hooks/useFonts";

type TabType = "pending" | "active" | "finished";

interface Conversation {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  trade: {
    title: string;
    image: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
  status: TabType;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    user: { name: "John Doe", avatar: "https://via.placeholder.com/50" },
    trade: { title: "Samsung S24", image: "https://via.placeholder.com/60" },
    lastMessage: "Is it still available?",
    timestamp: "2m ago",
    unread: 2,
    status: "pending",
  },
  {
    id: "2",
    user: { name: "Jane Smith", avatar: "https://via.placeholder.com/50" },
    trade: {
      title: "Designer Handbag",
      image: "https://via.placeholder.com/60",
    },
    lastMessage: "Great! When can we meet?",
    timestamp: "1h ago",
    unread: 0,
    status: "active",
  },
  {
    id: "3",
    user: { name: "Mike Johnson", avatar: "https://via.placeholder.com/50" },
    trade: { title: "Gaming Console", image: "https://via.placeholder.com/60" },
    lastMessage: "Trade completed successfully!",
    timestamp: "2d ago",
    unread: 0,
    status: "finished",
  },
];

export default function InboxScreen() {
  const { fontsLoaded } = useAppFonts();

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const [activeTab, setActiveTab] = useState<TabType>("pending");

  const filteredConversations = mockConversations.filter(
    (conv) => conv.status === activeTab
  );

  const renderConversationCard = (conversation: Conversation) => (
    <TouchableOpacity key={conversation.id} style={styles.conversationCard}>
      <Image
        source={{ uri: conversation.trade.image }}
        style={styles.tradeImage}
      />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName}>{conversation.user.name}</Text>
          <Text style={styles.timestamp}>{conversation.timestamp}</Text>
        </View>
        <Text style={styles.tradeTitle} numberOfLines={1}>
          {conversation.trade.title}
        </Text>
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
          {conversation.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unread}</Text>
            </View>
          )}
        </View>
      </View>
      <Image
        source={{ uri: conversation.user.avatar }}
        style={styles.userAvatar}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.activeTabText,
            ]}
          >
            Pending
          </Text>
          {mockConversations.filter((c) => c.status === "pending").length >
            0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {mockConversations.filter((c) => c.status === "pending").length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}
          >
            Active
          </Text>
          {mockConversations.filter((c) => c.status === "active").length >
            0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {mockConversations.filter((c) => c.status === "active").length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "finished" && styles.activeTab]}
          onPress={() => setActiveTab("finished")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "finished" && styles.activeTabText,
            ]}
          >
            Finished
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conversations */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredConversations.length > 0 ? (
          filteredConversations.map(renderConversationCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={COLORS.text.light}
            />
            <Text style={styles.emptyText}>No {activeTab} conversations</Text>
            <Text style={styles.emptySubtext}>
              Start trading to see your conversations here
            </Text>
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
    padding: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.sm,
    gap: SIZES.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
    gap: SIZES.xs,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.white,
    fontFamily: "Rubik-Medium",
  },
  tabBadge: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.tiny,
    fontFamily: "Rubik-Bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  conversationCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.medium,
  },
  tradeImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.border,
  },
  conversationContent: {
    flex: 1,
    marginLeft: SIZES.md,
    marginRight: SIZES.md,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.xs,
  },
  userName: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
  },
  timestamp: {
    fontSize: SIZES.tiny,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.secondary,
  },
  tradeTitle: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.secondary,
    marginBottom: SIZES.xs,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.primary,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    marginLeft: SIZES.sm,
  },
  unreadText: {
    color: COLORS.white,
    fontSize: SIZES.tiny,
    fontFamily: "Rubik-Regular",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
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
    color: COLORS.text.secondary,
    fontFamily: "Rubik-Regular",
    marginTop: SIZES.xs,
  },
});
