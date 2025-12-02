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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export default function VerifyEmail() {
  const params = useLocalSearchParams();
  const { signUp, setActive, isLoaded } = useSignUp();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const email = params.email as string;

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    if (!signUp || !isLoaded) {
      Alert.alert('Error', 'Verification service is not ready. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const completeSignup = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignup.status === 'complete') {
        await setActive({ session: completeSignup.createdSessionId });
        
        // Navigate to interests screen with user data
        router.replace({
          pathname: '/onboarding',
          params: {
            name: params.name,
            email: params.email,
            phone: params.phone,
          },
        });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      let errorMessage = 'Verification failed. Please check your code.';

      if (error.errors && error.errors.length > 0) {
        errorMessage = error.errors[0].longMessage || error.errors[0].message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp || !isLoaded) {
      return;
    }

    setLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Alert.alert('Success', 'Verification code resent to your email');
    } catch (error: any) {
      console.error('Resend error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
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
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={loading}
          >
            <Text style={styles.resendButtonText}>
              Didn't receive the code? <Text style={styles.resendButtonBold}>Resend</Text>
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
    justifyContent: 'center',
  },
  header: {
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
    lineHeight: 24,
  },
  email: {
    fontWeight: 'bold',
    color: COLORS.text.primary,
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
    fontSize: SIZES.h2,
    color: COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: 8,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md + 4,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.lg,
    ...SHADOWS.medium,
  },
  verifyButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  verifyButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: SIZES.lg,
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: SIZES.small,
    color: COLORS.text.secondary,
  },
  resendButtonBold: {
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
