import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { endpoints } from "../../utils/authApi";
import api from "../../utils/api";

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Books",
  "Sports",
  "Art",
  "Music",
  "Gaming",
  "Jewelry",
  "Tools",
  "Furniture",
  "Collectibles",
  "Toys",
  "Home Decor",
  "Outdoor Gear",
  "Vehicles",
];

const CONDITIONS = [
  { label: "New", value: "new" },
  { label: "Like New", value: "like_new" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
];

interface TradeFormData {
  title: string;
  description: string;
  category: string;
  condition: string;
  baseValue: string;
  age: string;
  quality: string;
  brand: string;
  city: string;
  state: string;
}

export default function AddTradeScreen() {
  const { getToken } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TradeFormData>({
    title: "",
    description: "",
    category: "",
    condition: "",
    baseValue: "",
    age: "",
    quality: "",
    brand: "",
    city: "",
    state: "",
  });
  const [calculatedPoints, setCalculatedPoints] = useState<number>(0);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera roll permissions are required!"
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => asset.uri);
        setImages([...images, ...newImages].slice(0, 5)); // Max 5 images
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        setImages([...images, result.assets[0].uri].slice(0, 5));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const calculateTradePoints = () => {
    const baseValue = parseFloat(formData.baseValue) || 0;
    const age = parseInt(formData.age) || 0;
    const quality = parseInt(formData.quality) || 5;

    // Simplified calculation (similar to backend)
    const conditionMultipliers: { [key: string]: number } = {
      new: 1.0,
      like_new: 0.9,
      good: 0.75,
      fair: 0.6,
      poor: 0.4,
    };

    const conditionMultiplier = conditionMultipliers[formData.condition] || 0.5;
    const qualityMultiplier = 0.5 + quality / 10;
    const years = age / 12;
    const ageDepreciation =
      years <= 5 ? baseValue * 0.05 * years : baseValue * 0.25;

    const points = Math.round(
      baseValue * conditionMultiplier * qualityMultiplier - ageDepreciation
    );
    setCalculatedPoints(Math.max(points, 1)); // Fixed the duplicate line here
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return false;
    }
    if (!formData.category) {
      Alert.alert("Error", "Please select a category");
      return false;
    }
    if (!formData.condition) {
      Alert.alert("Error", "Please select a condition");
      return false;
    }
    if (!formData.baseValue || parseFloat(formData.baseValue) <= 0) {
      Alert.alert("Error", "Please enter a valid base value");
      return false;
    }
    if (
      !formData.quality ||
      parseInt(formData.quality) < 1 ||
      parseInt(formData.quality) > 10
    ) {
      Alert.alert("Error", "Please enter quality rating (1-10)");
      return false;
    }
    if (images.length === 0) {
      Alert.alert("Error", "Please add at least one image");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await getToken();

      // Prepare trade data matching backend schema
      const tradeData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        tradeType: "product", // Default to product
        valuation: {
          baseValue: parseFloat(formData.baseValue),
          age: parseInt(formData.age) || 0,
          quality: parseInt(formData.quality),
          brand: formData.brand || undefined,
        },
        location: {
          city: formData.city,
          state: formData.state,
        },
        images: [], // Will be updated after upload
      };

      // For now, send without images (you'll need file upload endpoint)
      const response = await api.post(endpoints.trades.create, tradeData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Success", "Trade created successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Error creating trade:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create trade"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Trade</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos (Max 5)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesRow}
          >
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={COLORS.error}
                  />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={pickImage}
              >
                <Ionicons name="add" size={32} color={COLORS.text.secondary} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={styles.imageActionButton}
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={20} color={COLORS.primary} />
              <Text style={styles.imageActionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageActionButton}
              onPress={pickImage}
            >
              <Ionicons name="images" size={20} color={COLORS.primary} />
              <Text style={styles.imageActionText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="e.g. Samsung Galaxy S24"
            maxLength={100}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            placeholder="Describe your item in detail..."
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsRow}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  formData.category === cat && styles.chipSelected,
                ]}
                onPress={() => setFormData({ ...formData, category: cat })}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.category === cat && styles.chipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Condition *</Text>
          <View style={styles.conditionsRow}>
            {CONDITIONS.map((cond) => (
              <TouchableOpacity
                key={cond.value}
                style={[
                  styles.conditionChip,
                  formData.condition === cond.value && styles.chipSelected,
                ]}
                onPress={() => {
                  setFormData({ ...formData, condition: cond.value });
                  calculateTradePoints();
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.condition === cond.value &&
                      styles.chipTextSelected,
                  ]}
                >
                  {cond.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Valuation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valuation</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Base Value ($) *</Text>
              <TextInput
                style={styles.input}
                value={formData.baseValue}
                onChangeText={(text) => {
                  setFormData({ ...formData, baseValue: text });
                  calculateTradePoints();
                }}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Age (months)</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => {
                  setFormData({ ...formData, age: text });
                  calculateTradePoints();
                }}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Quality (1-10) *</Text>
              <TextInput
                style={styles.input}
                value={formData.quality}
                onChangeText={(text) => {
                  setFormData({ ...formData, quality: text });
                  calculateTradePoints();
                }}
                placeholder="5"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Brand</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) =>
                  setFormData({ ...formData, brand: text })
                }
                placeholder="Optional"
              />
            </View>
          </View>

          {calculatedPoints > 0 && (
            <View style={styles.pointsPreview}>
              <Text style={styles.pointsLabel}>Estimated Trade Points:</Text>
              <Text style={styles.pointsValue}>{calculatedPoints} TP</Text>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) =>
                  setFormData({ ...formData, city: text })
                }
                placeholder="New York"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) =>
                  setFormData({ ...formData, state: text })
                }
                placeholder="NY"
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={COLORS.white}
              />
              <Text style={styles.submitButtonText}>Create Trade</Text>
            </>
          )}
        </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
  },
  content: {
    padding: SIZES.padding,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Bold",
    color: COLORS.text.primary,
    marginBottom: SIZES.md,
  },
  label: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.primary,
    marginBottom: SIZES.xs,
    marginTop: SIZES.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    fontSize: SIZES.body,
    fontFamily: "Rubik-Regular",
    color: COLORS.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: SIZES.md,
  },
  halfInput: {
    flex: 1,
  },
  imagesRow: {
    marginBottom: SIZES.md,
  },
  imageContainer: {
    position: "relative",
    marginRight: SIZES.md,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.border,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  addImageText: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.secondary,
    marginTop: SIZES.xs,
  },
  imageActions: {
    flexDirection: "row",
    gap: SIZES.md,
  },
  imageActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.xs,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  imageActionText: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.primary,
  },
  chipsRow: {
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SIZES.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: SIZES.small,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.primary,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  conditionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
  },
  conditionChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pointsPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.secondary + "20",
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginTop: SIZES.md,
  },
  pointsLabel: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Medium",
    color: COLORS.text.primary,
  },
  pointsValue: {
    fontSize: SIZES.h3,
    fontFamily: "Rubik-Bold",
    color: COLORS.secondary,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.sm,
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginTop: SIZES.lg,
    ...SHADOWS.medium,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  submitButtonText: {
    fontSize: SIZES.body,
    fontFamily: "Rubik-Bold",
    color: COLORS.white,
  },
});
