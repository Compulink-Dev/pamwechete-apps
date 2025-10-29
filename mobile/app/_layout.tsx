import { ClerkProvider } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { COLORS } from "../constants/theme";
import useCustomFonts from "../hooks/useFonts";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const fontsLoaded = useCustomFonts();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // or a loading component
  }

  useEffect(() => {
    async function prepare() {
      try {
        // Try to load fonts, but don't block the app if they fail
        await loadFontsWithFallback();
      } catch (error) {
        console.log("Font loading failed, using system fonts:", error);
        // Continue with system fonts
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  const loadFontsWithFallback = async () => {
    try {
      // Try to load fonts if available, but don't fail if they're not
      // This is a non-blocking approach
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      // Silently fail - we'll use system fonts
      console.log("Using system fonts as fallback");
    }
  };

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <Slot />
      <StatusBar />
    </ClerkProvider>
  );
}
