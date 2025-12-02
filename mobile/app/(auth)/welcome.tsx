import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Pamwechete</Text>
          <Text style={styles.tagline}>Trade Fair, Trade Smart</Text>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            Join the community where barter trading meets modern technology.
            Exchange items fairly using our intelligent trade points system.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
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
    padding: SIZES.padding * 2,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: SIZES.xl * 3,
    alignItems: 'center',
  },
  logo: {
    fontSize: SIZES.h1 + 8,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  tagline: {
    fontSize: SIZES.body,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  description: {
    paddingHorizontal: SIZES.padding,
  },
  descriptionText: {
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: SIZES.md,
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md + 4,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  signupButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.md + 4,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  loginButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: SIZES.small,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: SIZES.padding,
  },
});
