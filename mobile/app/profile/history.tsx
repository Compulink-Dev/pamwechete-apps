import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import api from '../../utils/api';

interface Trade {
  _id: string;
  title: string;
  category: string;
  tradePoints: number;
  images: { url: string }[];
  createdAt: string;
  status: string;
}

export default function TradeHistoryScreen() {
  const { getToken } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const token = await getToken();
      const response = await api.get('/trades/my-trades?status=completed', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTrades(response.data.trades || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderHistoryItem = ({ item }: { item: Trade }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => router.push(`/trades/${item._id}` as any)}
    >
      <Image
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/80' }}
        style={styles.tradeImage}
      />
      <View style={styles.tradeInfo}>
        <Text style={styles.tradeTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.tradeCategory}>{item.category}</Text>
        <Text style={styles.tradeDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.tradePoints}>{item.tradePoints} TP</Text>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.statusText}>Completed</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trade History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* History List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : trades.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="time-outline" size={64} color={COLORS.text.light} />
          <Text style={styles.emptyText}>No completed trades yet</Text>
          <Text style={styles.emptySubtext}>
            Your trading history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={trades}
          keyExtractor={(item) => item._id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.md,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontFamily: 'Rubik-Bold',
    color: COLORS.text.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.h4,
    fontFamily: 'Rubik-Bold',
    color: COLORS.text.primary,
    marginTop: SIZES.md,
    marginBottom: SIZES.xs,
  },
  emptySubtext: {
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  list: {
    padding: SIZES.padding,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius,
    marginBottom: SIZES.md,
    padding: SIZES.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  tradeImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.border,
  },
  tradeInfo: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  tradeTitle: {
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.xs,
  },
  tradeCategory: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  tradeDate: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.light,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  tradePoints: {
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Bold',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Medium',
    color: COLORS.success,
  },
});
