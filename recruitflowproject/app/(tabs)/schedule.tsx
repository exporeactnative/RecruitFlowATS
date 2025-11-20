import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScheduleInterviewModal } from '@/components/candidates/ScheduleInterviewModal';
import { calendarService, CalendarEvent } from '@/services/calendarService';

export default function ScheduleScreen() {
  console.log('🔵 ScheduleScreen component mounted');
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    console.log('🟢 useEffect triggered - calling loadEvents');
    
    // Load events immediately
    loadEvents();
    
    // Subscribe to real-time updates
    try {
      const unsubscribe = calendarService.subscribeToEvents(
        '', // candidateId - empty string for all events
        (event: CalendarEvent) => {
          console.log('🔔 Real-time event update:', event);
          setEvents((prevEvents) => {
            // Check if event already exists
            const existingIndex = prevEvents.findIndex((e) => e.id === event.id);
            
            if (existingIndex >= 0) {
              // Update existing event
              const updated = [...prevEvents];
              updated[existingIndex] = event;
              return updated.sort((a, b) => 
                new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
              );
            } else {
              // Add new event
              return [...prevEvents, event].sort((a, b) => 
                new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
              );
            }
          });
        },
        (eventId: string) => {
          console.log('🗑️ Real-time event delete:', eventId);
          setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));
        }
      );

      return () => {
        console.log('🔴 Cleaning up subscription');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ Error setting up subscription:', error);
    }
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await calendarService.getAllUpcomingEvents();
      console.log('📅 Loaded events:', data.length);
      console.log('📅 Events data:', JSON.stringify(data, null, 2));
      // Sort by start time (newest first)
      const sorted = data.sort((a, b) => 
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );
      setEvents(sorted);
    } catch (error) {
      console.error('❌ Failed to load events:', error);
      Alert.alert('Error', 'Failed to load scheduled interviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    // Check if tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    // Otherwise return formatted date
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMin = Math.round(durationMs / 60000);
    
    if (durationMin < 60) {
      return `${durationMin} min`;
    }
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  // Group events by date
  const groupEventsByDate = () => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    events.forEach((event) => {
      const dateKey = new Date(event.start_time).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  };

  const getEventIcon = (type: CalendarEvent['event_type']) => {
    switch (type) {
      case 'interview': return 'people';
      case 'phone_screen': return 'call';
      case 'meeting': return 'calendar';
      case 'follow_up': return 'checkmark-circle';
      default: return 'calendar';
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Interview',
      'Are you sure you want to delete this interview?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await calendarService.deleteEvent(eventId);
              loadEvents();
              Alert.alert('Success', 'Interview deleted');
            } catch (error) {
              console.error('Failed to delete event:', error);
              Alert.alert('Error', 'Failed to delete interview');
            }
          },
        },
      ]
    );
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const renderDateHeader = (dateString: string) => {
    const date = formatDate(dateString);
    return (
      <View style={styles.dateHeader}>
        <Text style={[styles.dateHeaderText, { color: colors.text }]}>{date}</Text>
        <View style={[styles.dateHeaderLine, { backgroundColor: colors.border }]} />
      </View>
    );
  };

  const renderEvent = ({ item, index }: { item: CalendarEvent; index: number }) => {
    // Show date header if first event or different date from previous
    const showDateHeader = index === 0 || 
      new Date(events[index - 1].start_time).toDateString() !== new Date(item.start_time).toDateString();

    return (
      <>
        {showDateHeader && renderDateHeader(item.start_time)}
        <Card style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name={getEventIcon(item.event_type)} size={24} color={colors.primary} />
            </View>
            <View style={styles.eventInfo}>
              <View style={styles.titleRow}>
                <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Badge 
                  label={item.event_type.replace('_', ' ')} 
                  variant="primary" 
                  size="small" 
                />
              </View>
              
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                  {formatTime(item.start_time)} - {formatTime(item.end_time)}
                </Text>
                <Text style={[styles.duration, { color: colors.textMuted }]}>
                  ({getDuration(item.start_time, item.end_time)})
                </Text>
              </View>

              {item.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.eventLocation, { color: colors.textMuted }]} numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>
              )}

              {item.meeting_link && (
                <View style={styles.locationRow}>
                  <Ionicons name="videocam-outline" size={14} color={colors.primary} />
                  <Text style={[styles.meetingLink, { color: colors.primary }]} numberOfLines={1}>
                    Video call
                  </Text>
                </View>
              )}

              {item.description && (
                <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={() => handleEditEvent(item)}
              style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeleteEvent(item.id)}
              style={[styles.actionButton, { backgroundColor: colorScheme === 'dark' ? '#3d1a1a' : '#fee2e2' }]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </Card>
      </>
    );
  };

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
          <Text style={styles.headerTitle}>Schedule</Text>
          <Text style={styles.headerSubtitle}>Upcoming Interviews & Events</Text>
        </View>

        {/* Wave decoration */}
        <View style={styles.waveContainer}>
          <View style={[styles.wave, { backgroundColor: colors.background }]} />
        </View>
      </LinearGradient>

      {/* Events List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading schedule...
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
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
              <Ionicons name="calendar-outline" size={64} color={colors.icon} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No scheduled interviews yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                Schedule interviews from candidate profiles
              </Text>
            </View>
          }
        />
      )}

      {/* Edit Modal */}
      {editingEvent && (
        <ScheduleInterviewModal
          visible={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingEvent(null);
            loadEvents();
          }}
          candidateId={editingEvent.candidate_id}
          candidateName={editingEvent.title.replace('Interview with ', '')}
          userId=""
          userName="Recruiter"
          editingEvent={editingEvent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginBottom: 20,
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    gap: 12,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
  },
  eventCard: {
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  eventTime: {
    fontSize: 14,
  },
  duration: {
    fontSize: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eventLocation: {
    fontSize: 13,
    flex: 1,
  },
  meetingLink: {
    fontSize: 13,
    flex: 1,
  },
  description: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
});
