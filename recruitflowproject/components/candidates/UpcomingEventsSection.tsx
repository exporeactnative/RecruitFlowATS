import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { calendarService, CalendarEvent } from '@/services/calendarService';
import { tasksService, Task } from '@/services/tasksService';

interface UpcomingEventsSectionProps {
  candidateId: string;
  onEditInterview?: (event: CalendarEvent) => void;
  onEditTask?: (task: Task) => void;
}

export function UpcomingEventsSection({ candidateId, onEditInterview, onEditTask }: UpcomingEventsSectionProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [candidateId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, tasksData] = await Promise.all([
        calendarService.getEvents(candidateId),
        tasksService.getTasks(candidateId),
      ]);
      
      // Filter to only show upcoming/pending items
      const now = new Date();
      const upcomingEvents = eventsData.filter(e => new Date(e.start_time) >= now);
      const pendingTasks = tasksData.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
      
      setEvents(upcomingEvents);
      setTasks(pendingTasks);
    } catch (error) {
      console.error('Failed to load events/tasks:', error);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return colors.warning;
      case 'medium': return colors.info;
      case 'low': return colors.textMuted;
      default: return colors.textMuted;
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
              loadData();
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

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await tasksService.deleteTask(taskId);
              loadData();
              Alert.alert('Success', 'Task deleted');
            } catch (error) {
              console.error('Failed to delete task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await tasksService.updateTaskStatus(taskId, 'completed');
      loadData(); // Reload to update the list
      Alert.alert('Success', 'Task marked as complete!');
    } catch (error) {
      console.error('Failed to complete task:', error);
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  if (loading) {
    return null; // Or show a loading spinner
  }

  if (events.length === 0 && tasks.length === 0) {
    return null; // Don't show section if no items
  }

  return (
    <View style={styles.container}>
      {/* Upcoming Interviews */}
      {events.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Upcoming Interviews
          </Text>
          {events.map((event) => (
            <Card key={event.id} style={styles.eventCard}>
              <View style={styles.cardHeader}>
                <View style={styles.eventHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name={getEventIcon(event.event_type)} size={20} color={colors.primary} />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                    <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                      {formatDateTime(event.start_time)}
                    </Text>
                    {event.location && (
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                        <Text style={[styles.eventLocation, { color: colors.textMuted }]}>
                          {event.location}
                        </Text>
                      </View>
                    )}
                    {event.meeting_link && (
                      <View style={styles.locationRow}>
                        <Ionicons name="videocam-outline" size={14} color={colors.info} />
                        <Text style={[styles.eventLocation, { color: colors.info }]}>
                          Video call
                        </Text>
                      </View>
                    )}
                  </View>
                  <Badge 
                    label={event.event_type.replace('_', ' ')} 
                    variant="primary" 
                    size="small" 
                  />
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    onPress={() => onEditInterview?.(event)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeleteEvent(event.id)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              {event.description && (
                <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
                  {event.description}
                </Text>
              )}
            </Card>
          ))}
        </View>
      )}

      {/* Pending Tasks */}
      {tasks.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Pending Tasks
          </Text>
          {tasks.map((task) => (
            <Card key={task.id} style={styles.taskCard}>
              <View style={styles.cardHeader}>
                <View style={styles.taskHeader}>
                  <TouchableOpacity
                    onPress={() => handleCompleteTask(task.id)}
                    style={[styles.checkbox, { borderColor: colors.border }]}
                  >
                    {task.status === 'completed' && (
                      <Ionicons name="checkmark" size={16} color={colors.success} />
                    )}
                  </TouchableOpacity>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
                    {task.description && (
                      <Text style={[styles.taskDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                        {task.description}
                      </Text>
                    )}
                    <View style={styles.taskMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                        <Text style={styles.priorityText}>{task.priority}</Text>
                      </View>
                      {task.due_date && (
                        <Text style={[styles.dueDate, { color: colors.textMuted }]}>
                          Due: {formatDate(task.due_date)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    onPress={() => onEditTask?.(task)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeleteTask(task.id)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  eventCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  eventLocation: {
    fontSize: 13,
  },
  eventDescription: {
    fontSize: 14,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  taskCard: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  dueDate: {
    fontSize: 13,
  },
});
