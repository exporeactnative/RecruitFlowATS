import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CandidateListItem } from '@/types/candidate';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface CandidateCardProps {
  candidate: any; // Using any to handle both camelCase and snake_case from database
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getInitials = () => {
    const firstName = candidate.first_name || candidate.firstName || '';
    const lastName = candidate.last_name || candidate.lastName || '';
    if (!firstName || !lastName) return '??';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const renderStars = () => {
    if (!candidate.rating) return null;
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= candidate.rating! ? 'star' : 'star-outline'}
            size={12}
            color={BrandColors.orange[500]}
          />
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/candidate/${candidate.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <View style={styles.content}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {getInitials()}
            </Text>
          </View>

          {/* Info */}
          <View style={styles.info}>
            <View style={styles.header}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {candidate.first_name || candidate.firstName} {candidate.last_name || candidate.lastName}
              </Text>
              {renderStars()}
            </View>
            <Text style={[styles.position, { color: colors.textSecondary }]} numberOfLines={1}>
              {candidate.position}
            </Text>
            <View style={styles.footer}>
              <Badge label={candidate.stage} variant="status" status={candidate.status} size="small" />
              <Text style={[styles.date, { color: colors.textMuted }]}>
                {new Date(candidate.applied_date || candidate.appliedDate || new Date()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Arrow */}
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  position: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 12,
  },
});
