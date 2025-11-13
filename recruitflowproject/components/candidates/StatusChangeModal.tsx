import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CandidateStatus } from '@/types/candidate';
import { candidatesService } from '@/services/candidatesService';
import { activitiesService } from '@/services/activitiesService';

interface StatusChangeModalProps {
  visible: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  currentStatus: CandidateStatus;
  onStatusChanged: () => void;
}

const statusOptions: Array<{
  value: CandidateStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}> = [
  {
    value: 'new',
    label: 'New',
    icon: 'person-add',
    color: BrandColors.teal[500],
    bgColor: BrandColors.teal[100],
  },
  {
    value: 'screening',
    label: 'Screening',
    icon: 'call',
    color: BrandColors.orange[600],
    bgColor: BrandColors.orange[100],
  },
  {
    value: 'interview',
    label: 'Interview',
    icon: 'people',
    color: '#2563EB',
    bgColor: '#DBEAFE',
  },
  {
    value: 'offer',
    label: 'Offer',
    icon: 'document-text',
    color: '#059669',
    bgColor: '#D1FAE5',
  },
  {
    value: 'hired',
    label: 'Hired',
    icon: 'checkmark-circle',
    color: '#059669',
    bgColor: '#D1FAE5',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    icon: 'close-circle',
    color: '#DC2626',
    bgColor: '#FEE2E2',
  },
  {
    value: 'withdrawn',
    label: 'Withdrawn',
    icon: 'remove-circle',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  },
];

export function StatusChangeModal({
  visible,
  onClose,
  candidateId,
  candidateName,
  currentStatus,
  onStatusChanged,
}: StatusChangeModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    if (newStatus === currentStatus) {
      onClose();
      return;
    }

    try {
      setLoading(true);

      // Update candidate status
      await candidatesService.updateCandidate(candidateId, {
        status: newStatus,
      });

      // Log activity
      const statusLabel = statusOptions.find((s) => s.value === newStatus)?.label || newStatus;
      await activitiesService.createActivity(
        candidateId,
        'status_change',
        `Status changed to ${statusLabel} for ${candidateName}`,
        '',
        'Sarah Chen'
      );

      Alert.alert('Success', `Status changed to ${statusLabel}`);
      onStatusChanged();
      onClose();
    } catch (error) {
      console.error('Failed to change status:', error);
      Alert.alert('Error', 'Failed to change status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Change Status</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Candidate Name */}
          <Text style={[styles.candidateName, { color: colors.textSecondary }]}>
            {candidateName}
          </Text>

          {/* Status Options */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.statusOption,
                  {
                    backgroundColor: colors.card,
                    borderColor: currentStatus === status.value ? status.color : colors.border,
                    borderWidth: currentStatus === status.value ? 2 : 1,
                  },
                ]}
                onPress={() => handleStatusChange(status.value)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <View style={[styles.statusIcon, { backgroundColor: status.bgColor }]}>
                  <Ionicons name={status.icon} size={24} color={status.color} />
                </View>
                <Text style={[styles.statusLabel, { color: colors.text }]}>
                  {status.label}
                </Text>
                {currentStatus === status.value && (
                  <Ionicons name="checkmark-circle" size={24} color={status.color} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  candidateName: {
    fontSize: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  content: {
    padding: 20,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});
