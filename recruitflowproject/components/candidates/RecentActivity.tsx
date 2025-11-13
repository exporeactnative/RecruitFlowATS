import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { activitiesService, Activity } from '@/services/activitiesService';
import { supabase } from '@/lib/supabase';

export function RecentActivity() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivities();

    // Subscribe to real-time activity updates
    const channel = supabase
      .channel('activities_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
        },
        (payload) => {
          console.log('Activity change received:', payload);
          if (payload.eventType === 'INSERT') {
            // Add new activity to the top
            setActivities((prev) => [payload.new as Activity, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing activity
            setActivities((prev) =>
              prev.map((act) => (act.id === payload.new.id ? (payload.new as Activity) : act))
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted activity
            setActivities((prev) => prev.filter((act) => act.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await activitiesService.getRecentActivities(50);
      console.log('Loaded activities:', data.length);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const getActivityIcon = (type: Activity['activity_type']) => {
    switch (type) {
      case 'call': return 'call';
      case 'sms': return 'chatbubble';
      case 'email': return 'mail';
      case 'note': return 'document-text';
      case 'status_change': return 'swap-horizontal';
      case 'interview_scheduled': return 'calendar';
      case 'task_created': return 'checkmark-circle';
      default: return 'information-circle';
    }
  };

  const getActivityColor = (type: Activity['activity_type']) => {
    switch (type) {
      case 'call': return colors.success;
      case 'sms': return colors.info;
      case 'email': return colors.warning;
      case 'note': return colors.textSecondary;
      case 'status_change': return colors.primary;
      case 'interview_scheduled': return colors.primary;
      case 'task_created': return colors.info;
      default: return colors.textMuted;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderActivity = ({ item }: { item: Activity }) => (
    <Card style={styles.activityCard}>
      <View style={styles.activityContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${getActivityColor(item.activity_type)}20` }]}>
          <Ionicons name={getActivityIcon(item.activity_type)} size={20} color={getActivityColor(item.activity_type)} />
        </View>
        <View style={styles.activityInfo}>
          <Text style={[styles.activityDescription, { color: colors.text }]}>
            {item.description}
          </Text>
          <Text style={[styles.activityTime, { color: colors.textMuted }]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading activities...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={renderActivity}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={colors.icon} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No recent activity
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
            Activity will appear here as you interact with candidates
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  activityCard: {
    marginBottom: 12,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 15,
    marginBottom: 4,
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 13,
  },
});
