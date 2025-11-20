import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { candidatesService } from '@/services/candidatesService';

interface EditCandidateModalProps {
  visible: boolean;
  onClose: () => void;
  candidate: any;
  onUpdate: () => void;
}

export function EditCandidateModal({ visible, onClose, candidate, onUpdate }: EditCandidateModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Contact Info
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Professional Info
  const [currentPosition, setCurrentPosition] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [citizenship, setCitizenship] = useState('');

  // Application Details
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [source, setSource] = useState('');
  const [resumeReceived, setResumeReceived] = useState(false);
  const [qualified, setQualified] = useState<'qualified' | 'not_qualified' | 'pending'>('pending');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (candidate) {
      // Contact Info
      setEmail(candidate.email || '');
      setPhone(candidate.phone || '');
      setLocation(candidate.location || '');
      setLinkedIn(candidate.linkedin_url || '');
      setPortfolio(candidate.portfolio_url || '');

      // Professional Info
      setCurrentPosition(candidate.current_position || '');
      setCurrentCompany(candidate.current_company || '');
      setYearsOfExperience(candidate.years_of_experience?.toString() || '');
      setExpectedSalary(candidate.expected_salary || '');
      setCitizenship(candidate.citizenship || '');

      // Application Details
      setPosition(candidate.position || '');
      setDepartment(candidate.department || '');
      setSource(candidate.source || '');
      setResumeReceived(candidate.resume_received || false);
      setQualified(candidate.qualified || 'pending');
    }
  }, [candidate]);

  const handleSave = async () => {
    try {
      setLoading(true);

      await candidatesService.updateCandidate(candidate.id, {
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        linkedin_url: linkedIn.trim() || null,
        portfolio_url: portfolio.trim() || null,
        current_position: currentPosition.trim() || null,
        current_company: currentCompany.trim() || null,
        years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : 0,
        expected_salary: expectedSalary.trim() || null,
        citizenship: citizenship.trim() || null,
        position: position.trim(),
        department: department.trim() || null,
        source: source.trim() || null,
        resume_received: resumeReceived,
        qualified: qualified,
      });

      Alert.alert('Success', 'Candidate information updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update candidate:', error);
      Alert.alert('Error', 'Failed to update candidate information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Candidate</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text style={[styles.saveButton, { color: loading ? colors.textMuted : BrandColors.teal[500] }]}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
            <Card>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Email *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Location</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="City, State"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>LinkedIn URL</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={linkedIn}
                  onChangeText={setLinkedIn}
                  placeholder="https://linkedin.com/in/..."
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Portfolio URL</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={portfolio}
                  onChangeText={setPortfolio}
                  placeholder="https://portfolio.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </View>
            </Card>
          </View>

          {/* Professional Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Professional Information</Text>
            <Card>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Current Position</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={currentPosition}
                  onChangeText={setCurrentPosition}
                  placeholder="Software Engineer"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Current Company</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={currentCompany}
                  onChangeText={setCurrentCompany}
                  placeholder="Company Name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Years of Experience</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={yearsOfExperience}
                  onChangeText={setYearsOfExperience}
                  placeholder="5"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Expected Salary</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={expectedSalary}
                  onChangeText={setExpectedSalary}
                  placeholder="$80,000 - $100,000"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Citizenship</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={citizenship}
                  onChangeText={setCitizenship}
                  placeholder="US Citizen / Work Visa / etc."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </Card>
          </View>

          {/* Application Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Application Details</Text>
            <Card>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Applied For *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={position}
                  onChangeText={setPosition}
                  placeholder="Position Title"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Department</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="Engineering, Sales, etc."
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Source</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={source}
                  onChangeText={setSource}
                  placeholder="LinkedIn, Indeed, Referral, etc."
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={[styles.field, styles.switchField]}>
                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Resume Received</Text>
                  <Text style={[styles.hint, { color: colors.textMuted }]}>Has the candidate submitted a resume?</Text>
                </View>
                <Switch
                  value={resumeReceived}
                  onValueChange={setResumeReceived}
                  trackColor={{ false: colors.border, true: BrandColors.teal[300] }}
                  thumbColor={resumeReceived ? BrandColors.teal[500] : colors.backgroundSecondary}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Qualification Status</Text>
                <View style={styles.qualifiedButtons}>
                  <TouchableOpacity
                    style={[
                      styles.qualifiedButton,
                      { borderColor: colors.border },
                      qualified === 'qualified' && { backgroundColor: BrandColors.teal[500], borderColor: BrandColors.teal[500] }
                    ]}
                    onPress={() => setQualified('qualified')}
                  >
                    <Text style={[
                      styles.qualifiedButtonText,
                      { color: qualified === 'qualified' ? BrandColors.white : colors.text }
                    ]}>
                      Qualified
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.qualifiedButton,
                      { borderColor: colors.border },
                      qualified === 'not_qualified' && { backgroundColor: BrandColors.orange[500], borderColor: BrandColors.orange[500] }
                    ]}
                    onPress={() => setQualified('not_qualified')}
                  >
                    <Text style={[
                      styles.qualifiedButtonText,
                      { color: qualified === 'not_qualified' ? BrandColors.white : colors.text }
                    ]}>
                      Not Qualified
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.qualifiedButton,
                      { borderColor: colors.border },
                      qualified === 'pending' && { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }
                    ]}
                    onPress={() => setQualified('pending')}
                  >
                    <Text style={[
                      styles.qualifiedButtonText,
                      { color: colors.text }
                    ]}>
                      Pending
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  switchField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  qualifiedButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  qualifiedButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  qualifiedButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
