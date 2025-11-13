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
import { tasksService } from '@/services/tasksService';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  userId: string;
  userName: string;
  editingTask?: any;
}

export function CreateTaskModal({
  visible,
  onClose,
  candidateId,
  candidateName,
  userId,
  userName,
  editingTask,
}: CreateTaskModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'medium');
      setDueDate(editingTask.due_date ? new Date(editingTask.due_date) : null);
    } else {
      resetForm();
    }
  }, [editingTask, visible]);

  const priorities = [
    { value: 'low' as const, label: 'Low', color: colors.textMuted, icon: 'arrow-down' as const },
    { value: 'medium' as const, label: 'Medium', color: colors.info, icon: 'remove' as const },
    { value: 'high' as const, label: 'High', color: colors.warning, icon: 'arrow-up' as const },
    { value: 'urgent' as const, label: 'Urgent', color: colors.error, icon: 'alert-circle' as const },
  ];

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      await tasksService.createTask(
        candidateId,
        title.trim(),
        description.trim() || undefined,
        dueDate ? dueDate.toISOString() : undefined,
        priority,
        userId,
        userName
      );

      Alert.alert('Success', 'Task created successfully!');
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Task</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Candidate Info */}
          <View style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Task for: <Text style={{ fontWeight: '600', color: colors.text }}>{candidateName}</Text>
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Task Title <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g., Follow up on references"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          {/* Description */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="Add details about the task..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Priority */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
          <View style={styles.prioritySelector}>
            {priorities.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.priorityButton,
                  {
                    backgroundColor: priority === p.value ? p.color : colors.backgroundSecondary,
                    borderColor: priority === p.value ? p.color : colors.border,
                  },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Ionicons
                  name={p.icon}
                  size={18}
                  color={priority === p.value ? '#fff' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.priorityButtonText,
                    { color: priority === p.value ? '#fff' : colors.textSecondary },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Due Date */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Due Date (Optional)</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.dateButtonText, { color: dueDate ? colors.text : colors.textMuted }]}>
              {dueDate ? formatDate(dueDate) : 'No due date'}
            </Text>
            {dueDate && (
              <TouchableOpacity
                onPress={() => setDueDate(null)}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={(event: any, date: any) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setDueDate(date);
              }}
            />
          )}

          {/* Create Button */}
          <Button
            title="Create Task"
            onPress={handleCreateTask}
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
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
  prioritySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  priorityButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  submitButton: {
    marginTop: 32,
    marginBottom: 40,
  },
});
