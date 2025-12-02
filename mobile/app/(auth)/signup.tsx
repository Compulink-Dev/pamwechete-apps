import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export default function Signup() {
  const { signUp, isLoaded } = useSignUp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    if (!signUp || !isLoaded) {
      Alert.alert('Error', 'Registration service is not ready. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // Create the signup with Clerk
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
      });

      // Start email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Navigate to email verification screen
      router.push({
        pathname: '/(auth)/verify-email',
        params: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Registration failed. Please try again.';

      if (error.errors && error.errors.length > 0) {
        errorMessage = error.errors[0].longMessage || error.errors[0].message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the trading community</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(val) => handleChange('name', val)}
                placeholder="John Doe"
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(val) => handleChange('email', val)}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(val) => handleChange('phone', val)}
                placeholder="+1 234 567 8900"
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(val) => handleChange('password', val)}
                placeholder="Min. 8 characters"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(val) => handleChange('confirmPassword', val)}
                placeholder="Re-enter password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.signupButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push('/(auth)/login')}
              disabled={loading}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.padding * 1.5,
  },
  header: {
    marginTop: SIZES.xl,
    marginBottom: SIZES.xl * 2,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
  },
  form: {
    marginBottom: SIZES.xl,
  },
  inputGroup: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SIZES.xs,
  },
  input: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: SIZES.body,
    color: COLORS.text.primary,
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md + 4,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.lg,
    ...SHADOWS.medium,
  },
  signupButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  signupButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: SIZES.lg,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: SIZES.small,
    color: COLORS.text.secondary,
  },
  loginLinkBold: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  backButtonText: {
    fontSize: SIZES.small,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
});
