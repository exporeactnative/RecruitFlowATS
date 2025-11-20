import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CandidateHeader } from '@/components/candidates/CandidateHeader';
import { InfoSection } from '@/components/candidates/InfoSection';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CandidateActions } from '@/components/candidates/CandidateActions';
import { NotesSection } from '@/components/candidates/NotesSection';
import { UpcomingEventsSection } from '@/components/candidates/UpcomingEventsSection';
import { ScheduleInterviewModal } from '@/components/candidates/ScheduleInterviewModal';
import { CreateTaskModal } from '@/components/candidates/CreateTaskModal';
import { StatusChangeModal } from '@/components/candidates/StatusChangeModal';
import { EditCandidateModal } from '@/components/candidates/EditCandidateModal';
import { candidatesService } from '@/services/candidatesService';
import { communicationService } from '@/services/communicationService';
import { supabase } from '@/lib/supabase';

export default function CandidateProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const scrollViewRef = useRef<ScrollView>(null);
  const notesSectionRef = useRef<View>(null);
  
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [triggerAddNote, setTriggerAddNote] = useState(false);

  useEffect(() => {
    loadCandidate();
    loadCurrentUser();
  }, [id]);

  // Auto-scroll to Notes section when Add Note is triggered
  useEffect(() => {
    if (triggerAddNote && notesSectionRef.current) {
      setTimeout(() => {
        notesSectionRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
          },
          () => {}
        );
      }, 100);
    }
  }, [triggerAddNote]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadCandidate = async () => {
    try {
      setLoading(true);
      const data = await candidatesService.getCandidateById(id);
      console.log('Loaded candidate:', data);
      setCandidate(data);
      
      // Mark as viewed when candidate profile is opened
      if (data && !data.viewed) {
        await candidatesService.markAsViewed(id);
      }
    } catch (error) {
      console.error('Failed to load candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPress = async () => {
    if (!candidate) return;
    try {
      const candidateName = `${candidate.first_name} ${candidate.last_name}`;
      const subject = 'Re: Your Application';
      const body = `Hi ${candidateName},\n\nThank you for your interest in the ${candidate.position} position.\n\nBest regards,\nRecruitment Team`;
      
      await communicationService.smartEmail(
        candidate.email,
        subject,
        body,
        candidate.id,
        currentUser?.id || '',
        currentUser?.email || 'Recruiter',
        candidateName
      );
    } catch (error) {
      console.error('Email error:', error);
      Alert.alert('Error', 'Failed to send email');
    }
  };

  const handleCallPress = async () => {
    if (!candidate) return;
    try {
      await communicationService.smartCall(
        candidate.phone,
        candidate.id,
        currentUser?.id || '',
        currentUser?.email || 'Recruiter',
        `${candidate.first_name} ${candidate.last_name}`
      );
    } catch (error) {
      console.error('Call error:', error);
      Alert.alert('Error', 'Failed to initiate call');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading candidate...</Text>
      </View>
    );
  }

  if (!candidate) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 16 }}>Candidate not found</Text>
      </View>
    );
  }

  const contactInfo = [
    { icon: 'mail' as const, label: 'Email', value: candidate.email, link: `mailto:${candidate.email}` },
    { icon: 'call' as const, label: 'Phone', value: candidate.phone || 'N/A', link: candidate.phone ? `tel:${candidate.phone}` : undefined },
    { icon: 'location' as const, label: 'Location', value: candidate.location || 'N/A' },
    { icon: 'logo-linkedin' as const, label: 'LinkedIn', value: candidate.linkedin_url ? 'View Profile' : 'N/A', link: candidate.linkedin_url },
    { icon: 'briefcase-outline' as const, label: 'Portfolio', value: candidate.portfolio_url ? 'View Portfolio' : 'N/A', link: candidate.portfolio_url },
  ];

  const professionalInfo = [
    { icon: 'briefcase' as const, label: 'Current Position', value: candidate.current_position || 'N/A' },
    { icon: 'business' as const, label: 'Current Company', value: candidate.current_company || 'N/A' },
    { icon: 'time' as const, label: 'Experience', value: candidate.years_of_experience ? `${candidate.years_of_experience} years` : 'N/A' },
    { icon: 'cash-outline' as const, label: 'Expected Salary', value: candidate.expected_salary || 'N/A' },
    { icon: 'globe-outline' as const, label: 'Citizenship', value: candidate.citizenship || 'N/A' },
  ];

  const applicationInfo = [
    { icon: 'document-text' as const, label: 'Applied For', value: candidate.position },
    { icon: 'people' as const, label: 'Department', value: candidate.department || 'N/A' },
    { icon: 'calendar' as const, label: 'Applied Date', value: new Date(candidate.applied_date || candidate.created_at).toLocaleDateString() },
    { icon: 'bookmark' as const, label: 'Source', value: candidate.source || 'N/A' },
    { icon: 'document-attach' as const, label: 'Resume Received', value: candidate.resume_received ? 'Yes' : 'No' },
    { icon: 'checkmark-circle' as const, label: 'Qualification', value: candidate.qualified === 'qualified' ? 'Qualified' : candidate.qualified === 'not_qualified' ? 'Not Qualified' : 'Pending' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        <CandidateHeader 
          candidate={candidate} 
          onBack={() => router.back()}
          onStatusPress={() => setShowStatusModal(true)}
          onMorePress={() => setShowActionsModal(true)}
        />

        <View style={styles.content}>
          {/* Quick Actions */}
          <CandidateActions
            candidateId={candidate.id}
            candidateName={`${candidate.first_name} ${candidate.last_name}`}
            email={candidate.email}
            phone={candidate.phone || ''}
            userId={currentUser?.id || ''}
            userName={currentUser?.email || 'Recruiter'}
            onScheduleInterview={() => setShowScheduleModal(true)}
            onAddTask={() => setShowTaskModal(true)}
            onAddNote={() => setTriggerAddNote(true)}
          />

          {/* Contact Information */}
          <InfoSection title="Contact Information" items={contactInfo} onEdit={() => setShowEditModal(true)} />

          {/* Professional Information */}
          <InfoSection title="Professional Information" items={professionalInfo} onEdit={() => setShowEditModal(true)} />

          {/* Application Details */}
          <InfoSection title="Application Details" items={applicationInfo} onEdit={() => setShowEditModal(true)} />

          {/* Upcoming Interviews & Tasks */}
          <UpcomingEventsSection 
            key={refreshKey}
            candidateId={candidate.id}
            onEditInterview={(event) => {
              setEditingEvent(event);
              setShowScheduleModal(true);
            }}
            onEditTask={(task) => {
              setEditingTask(task);
              setShowTaskModal(true);
            }}
          />

          {/* Notes Section with Realtime */}
          <View ref={notesSectionRef}>
            <NotesSection
              candidateId={candidate.id}
              userId={currentUser?.id || ''}
              userName={currentUser?.email || 'Recruiter'}
              triggerAddNote={triggerAddNote}
              onAddNoteTriggered={() => setTriggerAddNote(false)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <ScheduleInterviewModal
        visible={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setEditingEvent(null);
          setRefreshKey(prev => prev + 1); // Force refresh of UpcomingEventsSection
        }}
        candidateId={candidate.id}
        candidateName={`${candidate.first_name} ${candidate.last_name}`}
        userId=""
        userName="Recruiter"
        editingEvent={editingEvent}
      />

      <CreateTaskModal
        visible={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
          setRefreshKey(prev => prev + 1); // Force refresh of UpcomingEventsSection
        }}
        candidateId={candidate.id}
        candidateName={`${candidate.first_name} ${candidate.last_name}`}
        userId={currentUser?.id || ''}
        userName={currentUser?.email || 'Recruiter'}
        editingTask={editingTask}
      />

      <StatusChangeModal
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        candidateId={candidate.id}
        candidateName={`${candidate.first_name} ${candidate.last_name}`}
        currentStatus={candidate.status}
        onStatusChanged={loadCandidate}
      />

      <EditCandidateModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        candidate={candidate}
        onUpdate={loadCandidate}
      />
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skillItem: {
    alignItems: 'center',
    gap: 4,
  },
  skillLevel: {
    fontSize: 11,
  },
  experienceCard: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  experiencePosition: {
    fontSize: 16,
    fontWeight: '600',
  },
  experienceCompany: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  experienceDates: {
    fontSize: 13,
    marginBottom: 8,
  },
  experienceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  educationCard: {
    marginBottom: 12,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  educationInstitution: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  educationYear: {
    fontSize: 13,
  },
  activityItem: {
    paddingVertical: 12,
  },
  activityDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
  },
});
