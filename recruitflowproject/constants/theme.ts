/**
 * RecruitFlow Theme - Professional ATS/CRM Design System
 * Color Palette: Deep Teal, Crisp White, Vibrant Orange
 * Design: Modern, Minimalist, Flat Aesthetic
 */

import { Platform } from 'react-native';

// RecruitFlow Brand Colors
export const BrandColors = {
  // Primary - Deep Teal
  teal: {
    50: '#E6F7F7',
    100: '#B3E8E8',
    200: '#80D9D9',
    300: '#4DCACA',
    400: '#1ABBBB',
    500: '#0D9494', // Primary Deep Teal
    600: '#0A7575',
    700: '#085656',
    800: '#053737',
    900: '#031818',
  },
  // Accent - Vibrant Orange
  orange: {
    50: '#FFF4ED',
    100: '#FFE4D1',
    200: '#FFD4B5',
    300: '#FFC499',
    400: '#FFB47D',
    500: '#FF9F5C', // Primary Orange
    600: '#FF8A3D',
    700: '#FF751E',
    800: '#E65F00',
    900: '#B34A00',
  },
  // Neutrals
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

export const Colors = {
  light: {
    // Text
    text: BrandColors.black,
    textSecondary: BrandColors.gray[600],
    textMuted: BrandColors.gray[400],
    
    // Backgrounds
    background: BrandColors.white,
    backgroundSecondary: BrandColors.gray[50],
    card: BrandColors.white,
    
    // Brand
    primary: BrandColors.teal[500],
    primaryLight: BrandColors.teal[100],
    primaryDark: BrandColors.teal[700],
    
    accent: BrandColors.orange[500],
    accentLight: BrandColors.orange[100],
    accentDark: BrandColors.orange[700],
    
    // UI Elements
    border: BrandColors.gray[200],
    borderLight: BrandColors.gray[100],
    
    // Icons & Tabs
    icon: BrandColors.gray[500],
    iconActive: BrandColors.teal[500],
    tabIconDefault: BrandColors.gray[400],
    tabIconSelected: BrandColors.teal[500],
    
    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: BrandColors.teal[500],
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.08)',
    shadowDark: 'rgba(0, 0, 0, 0.15)',
  },
  dark: {
    // Text
    text: BrandColors.white,
    textSecondary: BrandColors.gray[300],
    textMuted: BrandColors.gray[500],
    
    // Backgrounds
    background: BrandColors.gray[900],
    backgroundSecondary: BrandColors.gray[800],
    card: BrandColors.gray[800],
    
    // Brand
    primary: BrandColors.teal[400],
    primaryLight: BrandColors.teal[200],
    primaryDark: BrandColors.teal[600],
    
    accent: BrandColors.orange[400],
    accentLight: BrandColors.orange[200],
    accentDark: BrandColors.orange[600],
    
    // UI Elements
    border: BrandColors.gray[700],
    borderLight: BrandColors.gray[600],
    
    // Icons & Tabs
    icon: BrandColors.gray[400],
    iconActive: BrandColors.teal[400],
    tabIconDefault: BrandColors.gray[500],
    tabIconSelected: BrandColors.teal[400],
    
    // Status Colors
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: BrandColors.teal[400],
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowDark: 'rgba(0, 0, 0, 0.5)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
