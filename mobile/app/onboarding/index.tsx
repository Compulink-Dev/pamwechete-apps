import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const INTERESTS = [
  'Electronics', 'Fashion', 'Books', 'Sports', 'Art',
  'Music', 'Gaming', 'Jewelry', 'Tools', 'Furniture',
  'Collectibles', 'Toys', 'Home Decor', 'Outdoor Gear', 'Vehicles',
];

export default function OnboardingInterests() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = () => {
    if (selectedInterests.length > 0) {
      router.push({
        pathname: '/onboarding/offering',
        params: { interests: JSON.stringify(selectedInterests) },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What are you interested in?</Text>
        <Text style={styles.subtitle}>
          Select categories you'd like to trade for
        </Text>

        <FlatList
          data={INTERESTS}
          numColumns={2}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                selectedInterests.includes(item) && styles.chipSelected,
              ]}
              onPress={() => toggleInterest(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedInterests.includes(item) && styles.chipTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        <View style={styles.footer}>
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedInterests.length === 0 && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={selectedInterests.length === 0}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SIZES.padding * 1.5,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
    marginBottom: SIZES.xl,
  },
  grid: {
    paddingBottom: SIZES.xl,
  },
  chip: {
    flex: 1,
    margin: SIZES.xs,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: SIZES.small,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  footer: {
    marginTop: 'auto',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SIZES.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.secondary,
    width: 24,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
});
