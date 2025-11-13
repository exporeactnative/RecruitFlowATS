import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CandidateStatus } from '@/types/candidate';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral' | 'status';
  status?: CandidateStatus;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'neutral', status, size = 'medium', style }: BadgeProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getStatusColors = (status: CandidateStatus) => {
    const statusColors: Record<CandidateStatus, { bg: string; text: string }> = {
      new: { bg: BrandColors.teal[100], text: BrandColors.teal[700] },
      screening: { bg: BrandColors.orange[100], text: BrandColors.orange[700] },
      interview: { bg: '#DBEAFE', text: '#1E40AF' },
      offer: { bg: '#D1FAE5', text: '#065F46' },
      hired: { bg: '#D1FAE5', text: '#065F46' },
      rejected: { bg: '#FEE2E2', text: '#991B1B' },
      withdrawn: { bg: BrandColors.gray[200], text: BrandColors.gray[700] },
    };
    return statusColors[status];
  };

  const getVariantColors = () => {
    if (status && variant === 'status') {
      return getStatusColors(status);
    }

    const variantColors: Record<string, { bg: string; text: string }> = {
      primary: { bg: colors.primaryLight, text: colors.primaryDark },
      accent: { bg: colors.accentLight, text: colors.accentDark },
      success: { bg: '#D1FAE5', text: '#065F46' },
      warning: { bg: '#FEF3C7', text: '#92400E' },
      error: { bg: '#FEE2E2', text: '#991B1B' },
      neutral: { bg: colors.backgroundSecondary, text: colors.textSecondary },
    };

    return variantColors[variant];
  };

  const badgeColors = getVariantColors();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeColors.bg,
          paddingVertical: isSmall ? 4 : 6,
          paddingHorizontal: isSmall ? 8 : 12,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: badgeColors.text,
            fontSize: isSmall ? 11 : 13,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
