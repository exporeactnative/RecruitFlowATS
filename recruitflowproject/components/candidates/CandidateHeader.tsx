import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Candidate } from '@/types/candidate';
import { Badge } from '@/components/ui/Badge';

interface CandidateHeaderProps {
  candidate: any; // Using any to handle both camelCase and snake_case from database
  onBack?: () => void;
  onStatusPress?: () => void;
  onEmailPress?: () => void;
  onCallPress?: () => void;
  onMorePress?: () => void;
}

export function CandidateHeader({ candidate, onBack, onStatusPress, onEmailPress, onCallPress, onMorePress }: CandidateHeaderProps) {
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
            size={16}
            color={BrandColors.orange[500]}
          />
        ))}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[BrandColors.teal[500], BrandColors.teal[600]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {/* Header Actions */}
      <View style={styles.headerActions}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={BrandColors.white} />
          </TouchableOpacity>
        )}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={onEmailPress}>
            <Ionicons name="mail-outline" size={22} color={BrandColors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onCallPress}>
            <Ionicons name="call-outline" size={22} color={BrandColors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Avatar and Name */}
      <View style={styles.profileSection}>
        <View style={[styles.avatar, { backgroundColor: BrandColors.teal[300] }]}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <Text style={styles.name}>
          {candidate.first_name || candidate.firstName} {candidate.last_name || candidate.lastName}
        </Text>
        <Text style={styles.position}>{candidate.position}</Text>
        {renderStars()}
      </View>

      {/* Status and Stage */}
      <View style={styles.statusSection}>
        <View style={styles.statusBadgeWrapper}>
          <TouchableOpacity 
            onPress={onStatusPress} 
            activeOpacity={0.7}
            style={styles.statusBadgeContainer}
            disabled={!onStatusPress}
          >
            <Badge label={candidate.status?.toUpperCase() || 'NEW'} variant="status" status={candidate.status} />
            {onStatusPress && (
              <Ionicons name="chevron-down" size={16} color={BrandColors.white} style={styles.chevronIcon} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color={BrandColors.white} />
          <Text style={styles.location}>{candidate.location}</Text>
        </View>
      </View>

      {/* Wave decoration */}
      <View style={styles.waveContainer}>
        <View style={[styles.wave, { backgroundColor: colors.background }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: BrandColors.white,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: BrandColors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: BrandColors.white,
    marginBottom: 4,
  },
  position: {
    fontSize: 16,
    color: BrandColors.teal[50],
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chevronIcon: {
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: BrandColors.white,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: -50,
    right: -50,
    height: 60,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
});
