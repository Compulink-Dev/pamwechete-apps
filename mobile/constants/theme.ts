export const COLORS = {
  primary: '#003C5C', // Navy blue from logo
  secondary: '#F89E1B', // Orange from logo
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: {
    primary: '#1A1A1A',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  border: '#E5E7EB',
  card: '#FFFFFF',
  shadow: '#000000',
};

// Define font weight types
type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

// Font configuration with fallbacks
export const FONTS: Record<FontWeight, string> & { fallback: Record<FontWeight, string> } = {
  // Try custom fonts first, fall back to system fonts
  regular: 'Rubik_400Regular',
  medium: 'Rubik_500Medium', 
  semibold: 'Rubik_600SemiBold',
  bold: 'Rubik_700Bold',
  
  // Fallback fonts for when custom fonts aren't available
  fallback: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  }
};

// Helper function to get font with fallback
export const getFontFamily = (fontWeight: FontWeight): string => {
  // For now, always use system fonts to avoid crashes
  // You can modify this later to check if custom fonts are loaded
  return FONTS.fallback[fontWeight];
};

export const SIZES = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  
  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  small: 14,
  tiny: 12,
  
  // Spacing
  padding: 16,
  margin: 16,
  radius: 12,
  cardRadius: 16,
  
  // Screen dimensions (will be updated dynamically)
  width: 375,
  height: 812,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};