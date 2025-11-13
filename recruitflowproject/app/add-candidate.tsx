import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from '@/components/ui/Button';
import { candidatesService } from '@/services/candidatesService';
import { activitiesService } from '@/services/activitiesService';

export default function AddCandidateScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    position: '',
    department: '',
    currentPosition: '',
    currentCompany: '',
    yearsOfExperience: '0',
    source: 'Direct Application',
  });

  const [loading, setLoading] = useState(false);

  const sources = [
    'Direct Application',
    'LinkedIn',
    'Indeed',
    'Referral',
    'Company Website',
    'Recruiter',
    'Other',
  ];

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.position) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const newCandidate = await candidatesService.createCandidate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        position: formData.position,
        department: formData.department,
        currentPosition: formData.currentPosition || undefined,
        currentCompany: formData.currentCompany || undefined,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
        source: formData.source,
      });

      // Log activity with detailed information
      try {
        console.log('Creating activity for candidate:', newCandidate.id);
        const activity = await activitiesService.createActivity(
          newCandidate.id,
          'status_change',
          `Added ${formData.firstName} ${formData.lastName} to system - ${formData.position}`,
          '',
          'Sarah Chen'
        );
        console.log('Activity created:', activity);
      } catch (activityError) {
        console.error('Failed to create activity:', activityError);
        // Don't fail the whole operation if activity logging fails
      }

      Alert.alert('Success', 'Candidate added successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Failed to create candidate:', error);
      Alert.alert('Error', 'Failed to add candidate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BrandColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Candidate</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          First Name <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          placeholder="John"
          placeholderTextColor={colors.textMuted}
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Last Name <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          placeholder="Doe"
          placeholderTextColor={colors.textMuted}
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Email <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          placeholder="john.doe@email.com"
          placeholderTextColor={colors.textMuted}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          placeholder="+1 (555) 123-4567"
          placeholderTextColor={colors.textMuted}
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Location</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          placeholder="San Francisco, CA"
          placeholderTextColor={colors.textMuted}
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
        />

        {/* Application Information */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Application Information
        </Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Position <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          placeholder="Software Engineer"
          placeholderTextColor={colors.textMuted}
          value={formData.position}
          onChangeText={(text) => setFormData({ ...formData, position: text })}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Department</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          placeholder="Engineering"
          placeholderTextColor={colors.textMuted}
          value={formData.department}
          onChangeText={(text) => setFormData({ ...formData, department: text })}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Source</Text>
        <View style={styles.sourcesContainer}>
          {sources.map((source) => (
            <TouchableOpacity
              key={source}
              style={[
                styles.sourceChip,
                {
                  backgroundColor: formData.source === source ? colors.primary : colors.backgroundSecondary,
                  borderColor: formData.source === source ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFormData({ ...formData, source })}
            >
              <Text
                style={[
                  styles.sourceText,
                  { color: formData.source === source ? BrandColors.white : colors.textSecondary },
                ]}
              >
                {source}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Employment */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Current Employment
        </Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Current Position</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          placeholder="Senior Developer"
          placeholderTextColor={colors.textMuted}
          value={formData.currentPosition}
          onChangeText={(text) => setFormData({ ...formData, currentPosition: text })}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Current Company</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          placeholder="Tech Corp"
          placeholderTextColor={colors.textMuted}
          value={formData.currentCompany}
          onChangeText={(text) => setFormData({ ...formData, currentCompany: text })}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Years of Experience</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
          placeholder="5"
          placeholderTextColor={colors.textMuted}
          value={formData.yearsOfExperience}
          onChangeText={(text) => setFormData({ ...formData, yearsOfExperience: text })}
          keyboardType="number-pad"
        />

        {/* Submit Button */}
        <Button
          title="Add Candidate"
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  sourcesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  sourceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sourceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 32,
    marginBottom: 40,
  },
});
