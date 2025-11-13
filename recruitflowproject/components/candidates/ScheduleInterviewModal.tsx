import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from '@/components/ui/Button';
import { calendarService } from '@/services/calendarService';

interface ScheduleInterviewModalProps {
  visible: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  userId: string;
  userName: string;
  editingEvent?: any; // Event to edit (if provided)
}

export function ScheduleInterviewModal({
  visible,
  onClose,
  candidateId,
  candidateName,
  userId,
  userName,
  editingEvent,
}: ScheduleInterviewModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [title, setTitle] = useState(`Interview with ${candidateName}`);
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<'interview' | 'phone_screen' | 'meeting' | 'follow_up'>('interview');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || `Interview with ${candidateName}`);
      setDescription(editingEvent.description || '');
      setEventType(editingEvent.event_type || 'interview');
      setLocation(editingEvent.location || '');
      setMeetingLink(editingEvent.meeting_link || '');
      setStartDate(new Date(editingEvent.start_time));
      setEndDate(new Date(editingEvent.end_time));
    } else {
      resetForm();
    }
  }, [editingEvent, visible]);

  const eventTypes = [
    { value: 'interview' as const, label: 'Interview', icon: 'people' as const },
    { value: 'phone_screen' as const, label: 'Phone Screen', icon: 'call' as const },
    { value: 'meeting' as const, label: 'Meeting', icon: 'calendar' as const },
    { value: 'follow_up' as const, label: 'Follow Up', icon: 'checkmark-circle' as const },
  ];

  const handleSchedule = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter an interview title');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Invalid Time', 'End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      if (editingEvent) {
        // UPDATE existing event
        await calendarService.updateEvent(
          editingEvent.id,
          title.trim(),
          description.trim() || undefined,
          eventType,
          startDate.toISOString(),
          endDate.toISOString(),
          location.trim() || undefined,
          meetingLink.trim() || undefined
        );
        Alert.alert('Success', 'Interview updated successfully!');
      } else {
        // CREATE new event
        await calendarService.createEvent(
          candidateId,
          title.trim(),
          description.trim() || undefined,
          eventType,
          startDate.toISOString(),
          endDate.toISOString(),
          location.trim() || undefined,
          meetingLink.trim() || undefined,
          userId,
          userName,
          true // Add to device calendar
        );
        Alert.alert('Success', 'Interview scheduled successfully!');
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      Alert.alert('Error', editingEvent ? 'Failed to update interview' : 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle(`Interview with ${candidateName}`);
    setDescription('');
    setEventType('interview');
    setLocation('');
    setMeetingLink('');
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 60 * 60 * 1000));
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Schedule Interview</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Event Type Selector */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Type</Text>
          <View style={styles.typeSelector}>
            {eventTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: eventType === type.value ? colors.primary : colors.backgroundSecondary,
                    borderColor: eventType === type.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setEventType(type.value)}
              >
                <Ionicons
                  name={type.icon}
                  size={20}
                  color={eventType === type.value ? '#fff' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: eventType === type.value ? '#fff' : colors.textSecondary },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Title <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="Interview with candidate"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          {/* Description */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="Add notes or agenda..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Start Time */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Start Time</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.dateButtonText, { color: colors.text }]}>{formatDateTime(startDate)}</Text>
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (date) {
                  setStartDate(date);
                  // Auto-adjust end time to be 1 hour after start
                  if (date >= endDate) {
                    setEndDate(new Date(date.getTime() + 60 * 60 * 1000));
                  }
                }
              }}
            />
          )}

          {/* End Time */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>End Time</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.dateButtonText, { color: colors.text }]}>{formatDateTime(endDate)}</Text>
          </TouchableOpacity>

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={startDate}
              onChange={(event, date) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (date) setEndDate(date);
              }}
            />
          )}

          {/* Location */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Location</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="Office, Zoom, etc."
            placeholderTextColor={colors.textMuted}
            value={location}
            onChangeText={setLocation}
          />

          {/* Meeting Link */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Meeting Link</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="https://zoom.us/..."
            placeholderTextColor={colors.textMuted}
            value={meetingLink}
            onChangeText={setMeetingLink}
            autoCapitalize="none"
            keyboardType="url"
          />

          {/* Schedule Button */}
          <Button
            title="Schedule Interview"
            onPress={handleSchedule}
            loading={loading}
            disabled={!title.trim()}
            variant="primary"
            style={styles.submitButton}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
  },
  submitButton: {
    marginTop: 32,
    marginBottom: 40,
  },
});
