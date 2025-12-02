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
import { useSignIn } from '@clerk/clerk-expo';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export default function Login() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!signIn || !isLoaded) {
      Alert.alert('Error', 'Login service is not ready. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Error', 'Login incomplete. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';

      if (error.errors && error.errors.length > 0) {
        errorMessage = error.errors[0].longMessage || error.errors[0].message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Login Failed', errorMessage);
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue trading</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupLink}
              onPress={() => router.push('/(auth)/signup')}
              disabled={loading}
            >
              <Text style={styles.signupLinkText}>
                Don't have an account? <Text style={styles.signupLinkBold}>Sign Up</Text>
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
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md + 4,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.lg,
    ...SHADOWS.medium,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: SIZES.lg,
    alignItems: 'center',
  },
  signupLinkText: {
    fontSize: SIZES.small,
    color: COLORS.text.secondary,
  },
  signupLinkBold: {
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
