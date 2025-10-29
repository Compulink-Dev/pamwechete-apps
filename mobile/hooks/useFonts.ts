import { useCallback } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function useAppFonts() {
  const [fontsLoaded, fontError] = useFonts({
    'Rubik_400Regular': require('../assets/fonts/Rubik-Regular.ttf'),
    'Rubik_500Medium': require('../assets/fonts/Rubik-Medium.ttf'),
    'Rubik_600SemiBold': require('../assets/fonts/Rubik-SemiBold.ttf'),
    'Rubik_700Bold': require('../assets/fonts/Rubik-Bold.ttf'),
    'Rubik-Regular': require('../assets/fonts/Rubik-Regular.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik-SemiBold.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik-Bold.ttf'),
    // Add other font weights if needed
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return { fontsLoaded, fontError, onLayoutRootView };
}