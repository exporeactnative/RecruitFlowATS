import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TabView } from '@/components/candidates/TabView';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RecentActivity } from '@/components/candidates/RecentActivity';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  // Recruiter info (hardcoded for now - can be from auth later)
  const recruiterName = "Sarah Chen";
  const recruiterRole = "Senior Recruiter";

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
          <Text style={styles.headerTitle}>RecruitFlow</Text>
        </View>

        {/* Recruiter Profile Card */}
        <Card style={styles.featuredCard}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {recruiterName.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          </View>
          <Text style={[styles.candidateName, { color: colors.text }]}>
            {recruiterName}
          </Text>
          <Badge 
            label={recruiterRole} 
            variant="primary" 
          />
        </Card>

        {/* Wave decoration */}
        <View style={styles.waveContainer}>
          <View style={[styles.wave, { backgroundColor: colors.background }]} />
        </View>
      </LinearGradient>

      {/* Tabs: Activity | Schedule | Pipeline */}
      <TabView
        tabs={[
          { key: 'activity', label: 'Activity' },
          { key: 'schedule', label: 'Schedule' },
          { key: 'pipeline', label: 'Pipeline' },
        ]}
      >
        {{
          activity: (
            <View style={styles.activityContainer}>
              <RecentActivity />
            </View>
          ),
          schedule: (
            <View style={styles.tabContent}>
              <Ionicons name="calendar-outline" size={64} color={colors.icon} />
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                View All Scheduled Interviews
              </Text>
              <TouchableOpacity 
                style={[styles.navButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/schedule')}
              >
                <Text style={styles.navButtonText}>Go to Schedule</Text>
                <Ionicons name="arrow-forward" size={20} color={BrandColors.white} />
              </TouchableOpacity>
            </View>
          ),
          pipeline: (
            <View style={styles.tabContent}>
              <Ionicons name="stats-chart-outline" size={64} color={colors.icon} />
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                View Pipeline Statistics
              </Text>
              <TouchableOpacity 
                style={[styles.navButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <Text style={styles.navButtonText}>Go to Pipeline</Text>
                <Ionicons name="arrow-forward" size={20} color={BrandColors.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      </TabView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: BrandColors.white,
  },
  loadingCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredCard: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginTop: -60,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: BrandColors.white,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: BrandColors.white,
  },
  candidateName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
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
  activityContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.white,
  },
});
