import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const OFFERINGS = [
  'Products', 'Services', 'Skills', 'Time', 'Space',
  'Equipment', 'Transportation', 'Consultation', 'Lessons', 'Labor',
];

export default function OnboardingOffering() {
  const params = useLocalSearchParams();
  const [selectedOfferings, setSelectedOfferings] = useState<string[]>([]);

  const toggleOffering = (offering: string) => {
    if (selectedOfferings.includes(offering)) {
      setSelectedOfferings(selectedOfferings.filter(o => o !== offering));
    } else {
      setSelectedOfferings([...selectedOfferings, offering]);
    }
  };

  const handleNext = () => {
    if (selectedOfferings.length > 0) {
      router.push({
        pathname: '/onboarding/complete',
        params: {
          name: params.name,
          email: params.email,
          phone: params.phone,
          interests: params.interests,
          offerings: JSON.stringify(selectedOfferings),
        },
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What can you offer?</Text>
        <Text style={styles.subtitle}>
          Select what you're willing to trade
        </Text>

        <FlatList
          data={OFFERINGS}
          numColumns={2}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                selectedOfferings.includes(item) && styles.chipSelected,
              ]}
              onPress={() => toggleOffering(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedOfferings.includes(item) && styles.chipTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        <View style={styles.footer}>
          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.nextButton,
                selectedOfferings.length === 0 && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={selectedOfferings.length === 0}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
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
  buttonRow: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  backButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
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
