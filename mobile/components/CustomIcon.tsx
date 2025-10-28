import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

// Simple emoji-based icons as fallback
const EMOJI_ICONS = {
  home: "🏠",
  chatbubbles: "💬",
  search: "🔍",
  people: "👥",
  person: "👤",
  add: "➕",
  camera: "📷",
  images: "🖼️",
};

interface CustomIconProps {
  name: keyof typeof EMOJI_ICONS;
  size?: number;
  color?: string;
}

export default function CustomIcon({
  name,
  size = 24,
  color = COLORS.text.primary,
}: CustomIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.emoji, { fontSize: size * 0.8, color }]}>
        {EMOJI_ICONS[name] || "❓"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    textAlign: "center",
  },
});
