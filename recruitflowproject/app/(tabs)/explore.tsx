import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { candidatesService } from '@/services/candidatesService';
import { supabase } from '@/lib/supabase';
import type { Candidate } from '@/types/candidate';
import { CandidateStatus } from '@/types/candidate';

const { width } = Dimensions.get('window');

export default function PipelineScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [pipelineStats, setPipelineStats] = useState({
    new: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    hired: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Subscribe to realtime updates
    const unsubscribe = candidatesService.subscribeToAllCandidates(() => {
      // Reload stats when any candidate changes
      loadStats();
    });
    
    return unsubscribe;
  }, []);

  const loadStats = async () => {
    try {
      const stats = await candidatesService.getCandidateStats();
      setPipelineStats({
        new: stats.new,
        screening: stats.screening,
        interview: stats.interview,
        offer: stats.offer,
        hired: stats.hired,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalActive = Object.values(pipelineStats).reduce((sum, count) => sum + count, 0);

  const pipelineStages = [
    {
      status: 'new' as CandidateStatus,
      label: 'New',
      count: pipelineStats.new,
      icon: 'person-add' as const,
      color: BrandColors.teal[500],
      bgColor: BrandColors.teal[100],
    },
    {
      status: 'screening' as CandidateStatus,
      label: 'Screening',
      count: pipelineStats.screening,
      icon: 'call' as const,
      color: BrandColors.orange[600],
      bgColor: BrandColors.orange[100],
    },
    {
      status: 'interview' as CandidateStatus,
      label: 'Interview',
      count: pipelineStats.interview,
      icon: 'people' as const,
      color: '#2563EB',
      bgColor: '#DBEAFE',
    },
    {
      status: 'offer' as CandidateStatus,
      label: 'Offer',
      count: pipelineStats.offer,
      icon: 'document-text' as const,
      color: '#059669',
      bgColor: '#D1FAE5',
    },
    {
      status: 'hired' as CandidateStatus,
      label: 'Hired',
      count: pipelineStats.hired,
      icon: 'checkmark-circle' as const,
      color: '#059669',
      bgColor: '#D1FAE5',
    },
  ];

  const quickStats = [
    {
      label: 'Active Candidates',
      value: totalActive.toString(),
      icon: 'people' as const,
      color: colors.primary,
    },
    {
      label: 'This Week',
      value: '12',
      icon: 'calendar' as const,
      color: colors.accent,
    },
    {
      label: 'Avg. Time to Hire',
      value: '18d',
      icon: 'time' as const,
      color: colors.info,
    },
    {
      label: 'Offer Accept Rate',
      value: '85%',
      icon: 'trending-up' as const,
      color: colors.success,
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading pipeline...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[BrandColors.teal[500], BrandColors.teal[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoTitleContainer}>
            <Text style={styles.headerTitle}>Pipeline</Text>
            <Text style={styles.headerSubtitle}>Recruitment Overview</Text>
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={loadStats}>
            <Ionicons name="refresh-outline" size={24} color={BrandColors.white} />
          </TouchableOpacity>
        </View>

        {/* Wave decoration */}
        <View style={styles.waveContainer}>
          <View style={[styles.wave, { backgroundColor: colors.background }]} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {quickStats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
                <Ionicons name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Pipeline Stages */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pipeline Stages</Text>
          {pipelineStages.map((stage, index) => (
            <TouchableOpacity key={stage.status} activeOpacity={0.7}>
              <Card style={styles.stageCard}>
                <View style={styles.stageContent}>
                  <View style={[styles.stageIcon, { backgroundColor: stage.bgColor }]}>
                    <Ionicons name={stage.icon} size={24} color={stage.color} />
                  </View>
                  <View style={styles.stageInfo}>
                    <Text style={[styles.stageLabel, { color: colors.text }]}>{stage.label}</Text>
                    <Text style={[styles.stageCount, { color: colors.textSecondary }]}>
                      {stage.count} candidate{stage.count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.stageProgress}>
                    <Text style={[styles.stagePercentage, { color: stage.color }]}>
                      {totalActive > 0 ? Math.round((stage.count / totalActive) * 100) : 0}%
                    </Text>
                  </View>
                </View>
                {/* Progress Bar */}
                <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: stage.color,
                        width: `${totalActive > 0 ? (stage.count / totalActive) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 90,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: BrandColors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: BrandColors.teal[50],
  },
  filterButton: {
    padding: 8,
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
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 52) / 2,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  stageCard: {
    marginBottom: 12,
  },
  stageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stageInfo: {
    flex: 1,
  },
  stageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  stageCount: {
    fontSize: 13,
  },
  stageProgress: {
    alignItems: 'flex-end',
  },
  stagePercentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
  },
});
