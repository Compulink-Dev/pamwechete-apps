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
import { endpoints } from '@/utils/authApi';

interface Trade {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  tradePoints: number;
  status: string;
  images: { url: string }[];
  createdAt: string;
  views: number;
  likes: number;
}

const STATUS_TABS = ['all', 'active', 'pending', 'completed', 'cancelled'];

export default function MyTradesScreen() {
  const { getToken } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchTrades = async () => {
    try {
      const token = await getToken();
      const url = activeTab === 'all' 
        ? '/trades/my-trades'
        : `/trades/my-trades?status=${activeTab}`;
      
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTrades(response.data.trades || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrades();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'completed': return COLORS.info;
      case 'cancelled': return COLORS.error;
      default: return COLORS.text.secondary;
    }
  };

  const renderTradeCard = ({ item }: { item: Trade }) => (
    <TouchableOpacity
      style={styles.tradeCard}
      onPress={() => router.push(`/trades/${item._id}` as any)}
    >
      <Image
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/100' }}
        style={styles.tradeImage}
      />
      <View style={styles.tradeInfo}>
        <View style={styles.tradeHeader}>
          <Text style={styles.tradeTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.tradeCategory}>{item.category}</Text>
        <Text style={styles.tradePoints}>{item.tradePoints} TP</Text>
        <View style={styles.tradeStats}>
          <View style={styles.stat}>
            <Ionicons name="eye-outline" size={14} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="heart-outline" size={14} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
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
        <Text style={styles.headerTitle}>My Trades</Text>
        <TouchableOpacity onPress={() => router.push('/trades/add' as any)}>
          <Ionicons name="add-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Status Tabs */}
      <View style={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trades List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : trades.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cube-outline" size={64} color={COLORS.text.light} />
          <Text style={styles.emptyText}>No trades found</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/trades/add' as any)}
          >
            <Text style={styles.addButtonText}>Create Trade</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trades}
          keyExtractor={(item) => item._id}
          renderItem={renderTradeCard}
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.md,
    gap: SIZES.xs,
  },
  tab: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Medium',
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.secondary,
    marginTop: SIZES.md,
    marginBottom: SIZES.lg,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Bold',
  },
  list: {
    padding: SIZES.padding,
  },
  tradeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius,
    marginBottom: SIZES.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  tradeImage: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.border,
  },
  tradeInfo: {
    flex: 1,
    padding: SIZES.md,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.xs,
  },
  tradeTitle: {
    flex: 1,
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Bold',
    color: COLORS.text.primary,
    marginRight: SIZES.sm,
  },
  statusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.xs,
  },
  statusText: {
    fontSize: SIZES.tiny,
    fontFamily: 'Rubik-Bold',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  tradeCategory: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.secondary,
    marginBottom: SIZES.xs,
  },
  tradePoints: {
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Bold',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  tradeStats: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.secondary,
  },
});
