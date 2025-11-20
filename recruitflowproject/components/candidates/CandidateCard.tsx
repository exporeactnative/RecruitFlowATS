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
  index?: number;
  totalCount?: number;
}

export function CandidateCard({ candidate, index, totalCount }: CandidateCardProps) {
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

  const cardStyle = [
    styles.card,
    !candidate.viewed && { borderLeftWidth: 4, borderLeftColor: BrandColors.orange[500] }
  ].filter(Boolean);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/candidate/${candidate.id}`)}
      activeOpacity={0.7}
    >
      <Card style={cardStyle as any}>
        <View style={styles.content}>
          {/* Number Badge */}
          {index !== undefined && (
            <View style={[styles.numberBadge, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.numberText, { color: colors.textMuted }]}>
                {index}
              </Text>
            </View>
          )}

          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {getInitials()}
            </Text>
            {/* Unviewed indicator dot */}
            {!candidate.viewed && (
              <View style={styles.unviewedDot}>
                <View style={[styles.unviewedDotInner, { backgroundColor: BrandColors.orange[500] }]} />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.info}>
            <View style={styles.header}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {candidate.first_name || candidate.firstName} {candidate.last_name || candidate.lastName}
              </Text>
              {!candidate.viewed && (
                <View style={[styles.newBadge, { backgroundColor: BrandColors.orange[500] }]}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
              {renderStars()}
            </View>
            <Text style={[styles.position, { color: colors.textSecondary }]} numberOfLines={1}>
              {candidate.position}
            </Text>
            <View style={styles.footer}>
              <View style={styles.badgesContainer}>
                <Badge label={candidate.stage} variant="status" status={candidate.status} size="small" />
                {candidate.qualified === 'qualified' && (
                  <Badge label="Qualified" variant="success" size="small" />
                )}
                {candidate.qualified === 'not_qualified' && (
                  <Badge label="Not Qualified" variant="error" size="small" />
                )}
                {candidate.resume_received && (
                  <Badge label="Resume ✓" variant="primary" size="small" />
                )}
              </View>
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
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
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
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
  },
  unviewedDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unviewedDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.white,
  },
});
