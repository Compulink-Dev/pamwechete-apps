import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

export default function CompleteProfile() {
  const params = useLocalSearchParams();

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);

  const name = params.name as string;
  const email = params.email as string;
  const phone = params.phone as string;
  const interests = params.interests
    ? JSON.parse(params.interests as string)
    : [];
  const offerings = params.offerings
    ? JSON.parse(params.offerings as string)
    : [];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  const handleComplete = async () => {
    setLoading(true);
    try {
      // User is already authenticated at this point
      // TODO: Send user data to backend API
      const userData = {
        name,
        email,
        phone,
        address: {
          street: formData.address || "",
          city: formData.city || "",
          state: formData.state || "",
          zipCode: formData.zipCode || "",
        },
        interests,
        offerings,
      };

      console.log("User profile to save:", userData);
      // await api.post(endpoints.users.create, userData);

      // Navigate to home
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error("Profile completion error:", error);
      let errorMessage = "Failed to complete profile. Please try again.";

      if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Profile Completion Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Almost Done!</Text>
        <Text style={styles.subtitle}>
          Add your address (optional) to help find nearby trades
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(val) => handleChange("address", val)}
              placeholder="123 Main St"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(val) => handleChange("city", val)}
                placeholder="New York"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(val) => handleChange("state", val)}
                placeholder="NY"
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zip Code</Text>
            <TextInput
              style={styles.input}
              value={formData.zipCode}
              onChangeText={(val) => handleChange("zipCode", val)}
              placeholder="10001"
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.registerButton,
                loading && styles.registerButtonDisabled,
              ]}
              onPress={handleComplete}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.registerButtonText}>Complete & Continue</Text>
              )}
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    padding: SIZES.padding * 1.5,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.text.secondary,
    marginBottom: SIZES.xl,
  },
  form: {
    marginBottom: SIZES.xl,
  },
  inputGroup: {
    marginBottom: SIZES.md,
  },
  label: {
    fontSize: SIZES.small,
    fontWeight: "600",
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
  row: {
    flexDirection: "row",
    gap: SIZES.md,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    marginTop: SIZES.xl,
    paddingBottom: SIZES.xl,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
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
    flexDirection: "row",
    gap: SIZES.md,
  },
  backButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: "bold",
  },
  registerButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
    alignItems: "center",
    ...SHADOWS.medium,
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: "bold",
  },
});
