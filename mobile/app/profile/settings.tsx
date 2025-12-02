import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress,
    rightElement,
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.menuLeft}>
        <Ionicons name={icon as any} size={22} color={COLORS.primary} />
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
      )}
    </TouchableOpacity>
  );

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'Cache cleared successfully')
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => Alert.alert('Info', 'Account deletion is not yet implemented')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
          <View style={styles.card}>
            <MenuItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Coming soon"
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                  disabled
                />
              }
            />
            <MenuItem
              icon="language-outline"
              title="Language"
              subtitle="English"
              onPress={() => Alert.alert('Info', 'Language selection coming soon')}
            />
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY & SECURITY</Text>
          <View style={styles.card}>
            <MenuItem
              icon="location-outline"
              title="Location Services"
              subtitle="Used to show nearby trades"
              rightElement={
                <Switch
                  value={locationServices}
                  onValueChange={setLocationServices}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              }
            />
            <MenuItem
              icon="lock-closed-outline"
              title="Change Password"
              onPress={() => Alert.alert('Info', 'Password managed through Clerk')}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Two-Factor Authentication"
              subtitle="Not enabled"
              onPress={() => Alert.alert('Info', '2FA setup coming soon')}
            />
            <MenuItem
              icon="eye-outline"
              title="Privacy Policy"
              onPress={() => Alert.alert('Info', 'Privacy policy viewer coming soon')}
            />
            <MenuItem
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => Alert.alert('Info', 'Terms viewer coming soon')}
            />
          </View>
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA & STORAGE</Text>
          <View style={styles.card}>
            <MenuItem
              icon="stats-chart-outline"
              title="Analytics"
              subtitle="Help improve the app"
              rightElement={
                <Switch
                  value={analytics}
                  onValueChange={setAnalytics}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              }
            />
            <MenuItem
              icon="trash-outline"
              title="Clear Cache"
              subtitle="Free up storage space"
              onPress={handleClearCache}
            />
            <MenuItem
              icon="download-outline"
              title="Download My Data"
              onPress={() => Alert.alert('Info', 'Data export coming soon')}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DANGER ZONE</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.dangerItem}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="warning-outline" size={22} color={COLORS.error} />
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: COLORS.error }]}>
                  Delete Account
                </Text>
                <Text style={styles.menuSubtitle}>
                  Permanently delete your account and data
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
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
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SIZES.md,
  },
  menuText: {
    marginLeft: SIZES.md,
    flex: 1,
  },
  menuTitle: {
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Medium',
    color: COLORS.text.primary,
  },
  menuSubtitle: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
  },
  footer: {
    padding: SIZES.padding,
    alignItems: 'center',
    marginTop: SIZES.xl,
    marginBottom: SIZES.xl,
  },
  footerText: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.light,
  },
});
