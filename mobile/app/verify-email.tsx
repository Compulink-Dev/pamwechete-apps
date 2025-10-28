import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import api, { endpoints } from "../utils/api";

export default function VerifyEmail() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const params = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const userData = params.userData
    ? JSON.parse(params.userData as string)
    : null;
  const email = params.email as string;

  useEffect(() => {
    if (!isLoaded) {
      Alert.alert("Error", "Verification service is not ready.");
      router.back();
    }
  }, [isLoaded]);

  const handleVerify = async () => {
    if (!signUp) {
      Alert.alert("Error", "Verification service is not ready.");
      return;
    }

    if (!code.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      // Attempt to verify the email address
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      console.log("Verification result:", result);

      if (result.status === "complete") {
        // User is verified, create the backend profile
        if (result.createdUserId && userData) {
          try {
            const response = await api.post(endpoints.auth.register, {
              ...userData,
              clerkId: result.createdUserId,
            });
            console.log("Backend profile created:", response.data);
          } catch (backendError: any) {
            console.error("Backend profile creation failed:", backendError);
            // Continue anyway - user can update profile later
          }
        }

        // Set the active session
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          Alert.alert(
            "Success!",
            "Your account has been verified and created.",
            [
              {
                text: "Get Started",
                onPress: () => router.replace("/(tabs)/home"),
              },
            ]
          );
        } else {
          Alert.alert(
            "Success!",
            "Your email has been verified. Please sign in.",
            [
              {
                text: "Sign In",
                onPress: () => router.replace("/sign-in"),
              },
            ]
          );
        }
      } else {
        console.log("Verification status:", result.status);
        Alert.alert(
          "Verification Incomplete",
          "Please check the code and try again."
        );
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      let errorMessage = "Invalid verification code. Please try again.";

      if (error.errors && error.errors.length > 0) {
        errorMessage = error.errors[0].longMessage || error.errors[0].message;
      }

      Alert.alert("Verification Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) {
      Alert.alert("Error", "Verification service is not ready.");
      return;
    }

    try {
      await signUp.prepareEmailAddressVerification();
      Alert.alert(
        "Success",
        "Verification code has been resent to your email."
      );
    } catch (error: any) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading verification...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification code to {email || "your email address"}.
          Please enter the code below to continue.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            maxLength={6}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
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
            <Text style={styles.verifyButtonText}>Verify Email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendCode}
          disabled={loading}
        >
          <Text style={styles.resendButtonText}>
            Didn't receive the code? Resend
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Back to Registration</Text>
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
    padding: SIZES.padding * 2,
    justifyContent: "center",
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SIZES.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
    marginBottom: SIZES.xl,
    textAlign: "center",
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: SIZES.xl,
  },
  label: {
    fontSize: SIZES.small,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: SIZES.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: SIZES.h3,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 8,
    color: COLORS.text.primary,
    ...SHADOWS.small,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
    alignItems: "center",
    marginBottom: SIZES.md,
    ...SHADOWS.medium,
  },
  verifyButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  verifyButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: "bold",
  },
  resendButton: {
    paddingVertical: SIZES.md,
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  resendButtonText: {
    color: COLORS.secondary,
    fontSize: SIZES.small,
    fontWeight: "600",
  },
  backButton: {
    paddingVertical: SIZES.md,
    alignItems: "center",
  },
  backButtonText: {
    color: COLORS.text.secondary,
    fontSize: SIZES.small,
  },
  loadingText: {
    textAlign: "center",
    marginTop: SIZES.md,
    color: COLORS.text.secondary,
    fontSize: SIZES.body,
  },
});
