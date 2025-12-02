import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export default function NotificationsScreen() {
  const [settings, setSettings] = useState({
    tradeMessages: true,
    tradeRequests: true,
    tradeUpdates: true,
    communityPosts: false,
    marketingEmails: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    value, 
    onToggle 
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    value: boolean; 
    onToggle: () => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={22} color={COLORS.primary} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={COLORS.white}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Trade Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRADE NOTIFICATIONS</Text>
          <View style={styles.card}>
            <SettingItem
              icon="chatbubbles-outline"
              title="Trade Messages"
              description="Get notified of new messages"
              value={settings.tradeMessages}
              onToggle={() => toggleSetting('tradeMessages')}
            />
            <SettingItem
              icon="swap-horizontal-outline"
              title="Trade Requests"
              description="New trade offers and requests"
              value={settings.tradeRequests}
              onToggle={() => toggleSetting('tradeRequests')}
            />
            <SettingItem
              icon="refresh-outline"
              title="Trade Updates"
              description="Status changes on your trades"
              value={settings.tradeUpdates}
              onToggle={() => toggleSetting('tradeUpdates')}
            />
          </View>
        </View>

        {/* Community Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMMUNITY</Text>
          <View style={styles.card}>
            <SettingItem
              icon="people-outline"
              title="Community Posts"
              description="Updates from community"
              value={settings.communityPosts}
              onToggle={() => toggleSetting('communityPosts')}
            />
            <SettingItem
              icon="mail-outline"
              title="Marketing Emails"
              description="Tips, offers, and newsletters"
              value={settings.marketingEmails}
              onToggle={() => toggleSetting('marketingEmails')}
            />
          </View>
        </View>

        {/* Notification Channels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATION CHANNELS</Text>
          <View style={styles.card}>
            <SettingItem
              icon="notifications-outline"
              title="Push Notifications"
              description="Receive push notifications"
              value={settings.pushNotifications}
              onToggle={() => toggleSetting('pushNotifications')}
            />
            <SettingItem
              icon="mail-outline"
              title="Email Notifications"
              description="Receive email notifications"
              value={settings.emailNotifications}
              onToggle={() => toggleSetting('emailNotifications')}
            />
            <SettingItem
              icon="phone-portrait-outline"
              title="SMS Notifications"
              description="Receive text messages"
              value={settings.smsNotifications}
              onToggle={() => toggleSetting('smsNotifications')}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can change these settings at any time
          </Text>
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
  section: {
    marginTop: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Bold',
    color: COLORS.text.secondary,
    marginBottom: SIZES.sm,
    marginHorizontal: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.cardRadius,
    ...SHADOWS.small,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SIZES.md,
  },
  settingText: {
    marginLeft: SIZES.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Medium',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.secondary,
  },
  footer: {
    padding: SIZES.padding,
    alignItems: 'center',
    marginTop: SIZES.xl,
  },
  footerText: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.light,
    textAlign: 'center',
  },
});
