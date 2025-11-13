import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { communicationService } from '@/services/communicationService';

interface CandidateActionsProps {
  candidateId: string;
  candidateName: string;
  email: string;
  phone: string;
  userId: string;
  userName: string;
  onScheduleInterview: () => void;
  onAddTask: () => void;
  onAddNote: () => void;
}

export function CandidateActions({
  candidateId,
  candidateName,
  email,
  phone,
  userId,
  userName,
  onScheduleInterview,
  onAddTask,
  onAddNote,
}: CandidateActionsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showActionsModal, setShowActionsModal] = useState(false);

  const actions = [
    {
      icon: 'call' as const,
      label: 'Make Call',
      color: BrandColors.teal[500],
      onPress: async () => {
        try {
          await communicationService.makeCall(phone, candidateId, userId, userName, candidateName);
          setShowActionsModal(false);
          Alert.alert('Success', 'Call logged! (Note: Phone calls require a real device, not simulator)');
        } catch (error) {
          Alert.alert('Error', 'Failed to log call');
        }
      },
    },
    {
      icon: 'chatbubble' as const,
      label: 'Send SMS',
      color: BrandColors.orange[500],
      onPress: async () => {
        try {
          await communicationService.sendSMS(
            phone,
            `Hi ${candidateName}, `,
            candidateId,
            userId,
            userName,
            candidateName
          );
          setShowActionsModal(false);
          Alert.alert('Success', 'SMS logged! (Note: SMS requires a real device, not simulator)');
        } catch (error) {
          Alert.alert('Error', 'Failed to log SMS');
        }
      },
    },
    {
      icon: 'mail' as const,
      label: 'Send Email',
      color: colors.info,
      onPress: async () => {
        try {
          await communicationService.sendEmail(
            email,
            `Re: Your Application`,
            `Hi ${candidateName},\n\n`,
            candidateId,
            userId,
            userName,
            candidateName
          );
          setShowActionsModal(false);
          Alert.alert('Success', 'Email composer opened. Activity will be logged when sent.');
        } catch (error) {
          Alert.alert('Error', 'Failed to send email');
        }
      },
    },
    {
      icon: 'calendar' as const,
      label: 'Schedule Interview',
      color: colors.primary,
      onPress: () => {
        setShowActionsModal(false);
        onScheduleInterview();
      },
    },
    {
      icon: 'checkbox' as const,
      label: 'Create Task',
      color: colors.accent,
      onPress: () => {
        setShowActionsModal(false);
        onAddTask();
      },
    },
    {
      icon: 'document-text' as const,
      label: 'Add Note',
      color: colors.success,
      onPress: () => {
        setShowActionsModal(false);
        onAddNote();
      },
    },
  ];

  return (
    <>
      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
          onPress={onScheduleInterview}
        >
          <Ionicons name="calendar" size={20} color={BrandColors.white} />
          <Text style={styles.quickActionText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: colors.accent }]}
          onPress={() => setShowActionsModal(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={BrandColors.white} />
          <Text style={styles.quickActionText}>More Actions</Text>
        </TouchableOpacity>
      </View>

      {/* Actions Modal */}
      <Modal
        visible={showActionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionsModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Actions</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.actionsGrid}>
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.actionItem}
                    onPress={action.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                      <Ionicons name={action.icon} size={24} color={action.color} />
                    </View>
                    <Text style={[styles.actionLabel, { color: colors.text }]}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    color: BrandColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionItem: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
