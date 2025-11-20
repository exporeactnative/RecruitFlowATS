# RecruitFlow - Complete Documentation

**Modern Recruitment Made Simple**

A comprehensive ATS/CRM mobile application built with React Native, Expo, and Supabase.

**Last Updated:** November 19, 2025 (Post-TestFlight Fixes)

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Recent Updates](#recent-updates)
5. [Setup & Installation](#setup--installation)
6. [Supabase Configuration](#supabase-configuration)
7. [Communication Features](#communication-features)
8. [Candidate Filtering & Viewed Status](#candidate-filtering--viewed-status)
9. [Theme & Appearance](#theme--appearance)
10. [Realtime Features](#realtime-features)
11. [Activity Logging](#activity-logging)
12. [Implementation Details](#implementation-details)
13. [Known Issues & Solutions](#known-issues--solutions)
14. [Current Status](#current-status)

---

## Overview

RecruitFlow is a modern, minimalist ATS (Applicant Tracking System) and CRM designed for recruitment professionals. The app features a clean, professional interface with deep teal and vibrant orange accents, providing an intuitive experience for managing candidates throughout the hiring process.

### Key Highlights

- **Modern Design**: Flat aesthetic with wave/gradient transitions
- **Real-time Updates**: Live candidate status changes and activity tracking
- **Communication Hub**: Integrated calls, SMS, and email
- **Mobile-First**: Built specifically for iOS and Android
- **Cloud-Powered**: Supabase backend with real-time capabilities

---

## Tech Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo SDK 54** - Development platform and tools
- **Expo Router** - File-based navigation
- **TypeScript** - Type-safe development
- **expo-linear-gradient** - Visual effects

### Backend
- **Supabase** - PostgreSQL database and authentication
- **Supabase Realtime** - Live data synchronization
- **Supabase Edge Functions** - Serverless functions

### External Services
- **Twilio** - SMS and voice calls
- **Gmail API** - Email integration
- **Google OAuth** - Authentication
- **Google Calendar & Tasks** - Productivity integration

### Development Tools
- **EAS Build** - Cloud build service
- **EAS Update** - Over-the-air updates
- **Expo SecureStore** - Secure credential storage

---

## Features

### Candidate Management

#### List View
- **Search & Filter**: Real-time search by name, email, or phone
- **Status Filters**: Quick filter by candidate status
- **Smart Sorting**: Sort by date, name, or rating
- **Status Badges**: Color-coded status indicators
- **Quick Actions**: Swipe actions for common tasks

#### Candidate Profiles
- **Complete Information**: Contact details, experience, education, skills
- **Status Tracking**: 
  - New
  - Screening
  - Interview
  - Offer
  - Hired
  - Rejected
  - Withdrawn
- **Rating System**: 5-star rating with visual feedback
- **Activity Timeline**: Complete history of interactions
- **Document Management**: Resume and file attachments

### Communication Features

#### Phone Calls
- **Direct Dialing**: Tap to call candidates
- **Call Logging**: Automatic activity tracking
- **Twilio Integration**: Server-side call initiation
- **Call History**: View all past calls

#### SMS Messaging
- **Quick Messages**: Send SMS directly from app
- **Template Support**: Pre-defined message templates
- **Delivery Tracking**: Message status updates
- **Conversation History**: Full SMS thread view

#### Email
- **Gmail Integration**: Send emails via Gmail API
- **Rich Formatting**: HTML email support
- **Attachments**: Send documents and files
- **Email Templates**: Quick-send templates
- **Thread View**: Email conversation history

### Real-time Features

#### Live Updates
- **Status Changes**: Instant candidate status updates
- **Activity Feed**: Real-time activity notifications
- **Collaborative Editing**: Multiple users can work simultaneously
- **Presence Indicators**: See who's viewing what

#### Activity Tracking
- **Automatic Logging**: All actions are logged
- **Activity Types**:
  - Status changes
  - Phone calls
  - SMS messages
  - Emails sent
  - Notes added
  - Profile updates
- **Timeline View**: Chronological activity history
- **User Attribution**: Track who did what

### Schedule & Calendar

#### Interview Scheduling
- **Calendar Integration**: Google Calendar sync
- **Time Slot Selection**: Easy scheduling interface
- **Automatic Reminders**: Email and SMS notifications
- **Conflict Detection**: Prevent double-booking

#### Task Management
- **Google Tasks Integration**: Sync with Google Tasks
- **Task Lists**: Organize by candidate or project
- **Due Dates**: Set and track deadlines
- **Completion Tracking**: Mark tasks as done

---

## Recent Updates

### November 19, 2025 - Profile Pictures & Enhanced Search

#### 1. **Profile Picture Upload Feature**

**Problem Solved:**
- No way for recruiters to personalize their profile
- Only initials shown, no photo support
- App felt less personal and engaging

**Implementation:**

**Image Picker Integration:**
```typescript
// app/settings.tsx
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  // Request permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow access to your photos.');
    return;
  }

  // Launch image picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  if (!result.canceled && result.assets[0]) {
    await uploadAvatar(result.assets[0].uri);
  }
};
```

**Supabase Storage Upload:**
```typescript
const uploadAvatar = async (uri: string) => {
  setUploadingAvatar(true);

  // Create file name
  const fileExt = uri.split('.').pop();
  const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Create form data for upload
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: fileName,
  } as any);

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, formData, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update user metadata
  await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  });

  setAvatarUrl(publicUrl);
  Alert.alert('Success', 'Profile picture updated!');
};
```

**Display in Home Screen:**
```typescript
// app/(tabs)/home.tsx
const avatarUrl = user?.user_metadata?.avatar_url;

<View style={styles.avatarContainer}>
  {avatarUrl ? (
    <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
  ) : (
    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
      <Text style={styles.avatarText}>
        {recruiterName.split(' ').map((n: string) => n[0]).join('')}
      </Text>
    </View>
  )}
</View>
```

**Supabase Storage Setup:**
```sql
-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update avatars
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow public read access
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to delete avatars
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
```

**Features:**
- ✅ Upload profile picture from photo library
- ✅ Crop to square before upload
- ✅ Auto-upload to Supabase Storage
- ✅ Display in Home screen and Settings
- ✅ Fallback to initials if no photo
- ✅ Loading state while uploading
- ✅ Error handling with user-friendly messages
- ✅ Optimized file size (50% quality)

**Installation:**
```bash
npx expo install expo-image-picker
```

---

#### 2. **Schedule Tab Event Persistence**

**Problem Solved:**
- Scheduled interviews disappeared from Schedule tab on refresh
- Past events were filtered out unintentionally
- Deleted events weren't removed from UI in real-time

**Implementation:**

**Fetch All Events (Not Just Upcoming):**
```typescript
// services/calendarService.ts
async getAllUpcomingEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('start_time', { ascending: true });
    // REMOVED: .gte('start_time', now) filter

  if (error) throw error;
  return data || [];
}
```

**Real-time Delete Event Handling:**
```typescript
// services/calendarService.ts
subscribeToEvents(
  candidateId: string, 
  onUpdate: (event: CalendarEvent) => void,
  onDelete?: (eventId: string) => void // NEW: Delete callback
) {
  const channel = supabase
    .channel(`calendar_events:${candidateId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'calendar_events',
      filter: candidateId ? `candidate_id=eq.${candidateId}` : undefined
    }, (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        onUpdate(payload.new as CalendarEvent);
      } else if (payload.eventType === 'DELETE' && onDelete) {
        onDelete(payload.old.id); // Handle deletions
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}
```

**Schedule Screen Integration:**
```typescript
// app/(tabs)/schedule.tsx
const unsubscribe = calendarService.subscribeToEvents(
  '',
  (event: CalendarEvent) => {
    // Handle INSERT/UPDATE
    setEvents((prevEvents) => {
      const existingIndex = prevEvents.findIndex((e) => e.id === event.id);
      if (existingIndex >= 0) {
        const updated = [...prevEvents];
        updated[existingIndex] = event;
        return updated.sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      } else {
        return [...prevEvents, event].sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      }
    });
  },
  (eventId: string) => {
    // Handle DELETE
    console.log('🗑️ Real-time event delete:', eventId);
    setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));
  }
);
```

**Features:**
- ✅ All events persist across refreshes
- ✅ Past events remain visible
- ✅ Real-time deletion updates
- ✅ Events only removed when explicitly deleted
- ✅ Proper event sorting by start time

---

#### 3. **Enhanced Search with Badge Filtering**

**Problem Solved:**
- Search only worked for names and positions
- Couldn't search by candidate badges (qualified, resume received, stage, status)
- No way to find candidates by their attributes

**Implementation:**

**Comprehensive Search Filter:**
```typescript
// app/(tabs)/index.tsx
const getFilteredCandidates = (filter: CandidateStatus | 'all' | 'new') => {
  const filtered = candidates.filter((candidate: any) => {
    const query = searchQuery.toLowerCase();
    
    // Search in basic fields
    const matchesBasic =
      candidate.first_name?.toLowerCase().includes(query) ||
      candidate.last_name?.toLowerCase().includes(query) ||
      candidate.position?.toLowerCase().includes(query);
    
    // Search in badge values
    const matchesQualified = candidate.qualified?.toLowerCase().includes(query);
    const matchesResume = 
      (candidate.resume_received && 'resume received'.includes(query)) ||
      (candidate.resume_received && 'received'.includes(query));
    const matchesStage = candidate.stage?.toLowerCase().includes(query);
    const matchesStatus = candidate.status?.toLowerCase().includes(query);
    
    const matchesSearch = matchesBasic || matchesQualified || matchesResume || matchesStage || matchesStatus;

    // Filter logic
    let matchesFilter = false;
    if (filter === 'all') {
      matchesFilter = true;
    } else if (filter === 'new') {
      matchesFilter = !candidate.viewed;
    } else {
      matchesFilter = candidate.status === filter;
    }

    return matchesSearch && matchesFilter;
  });

  return filtered.sort((a: any, b: any) => {
    const aLastName = a.last_name || a.lastName || '';
    const bLastName = b.last_name || b.lastName || '';
    return aLastName.localeCompare(bLastName);
  });
};
```

**Searchable Attributes:**
- ✅ First name
- ✅ Last name
- ✅ Position
- ✅ Qualified status ("qualified", "not qualified", "pending")
- ✅ Resume received ("resume", "received")
- ✅ Stage ("Applied", "Phone Screen", "Interview", etc.)
- ✅ Status ("new", "screening", "interview", "offer", "hired", "rejected", "withdrawn")

**Example Searches:**
- Search "qualified" → Shows all qualified candidates
- Search "interview" → Shows candidates in interview stage
- Search "resume" → Shows candidates with resume received
- Search "screening" → Shows candidates in screening status

---

### November 19, 2025 (Afternoon) - TestFlight Bug Fixes

After deploying version 1.0.1 to TestFlight, several UX issues were identified and fixed:

#### 1. **Schedule Tab Sorting Fix**

**Problem:**
- Events were sorted oldest-first (ascending)
- Latest/newest events appeared at the bottom
- Users had to scroll to see upcoming interviews

**Solution:**
Reversed sort order to show newest events first (descending).

**Code Changes:**
```typescript
// app/(tabs)/schedule.tsx - Lines 44-45, 49-50, 77-78

// Real-time update sorting
const updated = [...prevEvents];
updated[existingIndex] = event;
return updated.sort((a, b) => 
  new Date(b.start_time).getTime() - new Date(a.start_time).getTime() // Changed from a-b to b-a
);

// New event sorting
return [...prevEvents, event].sort((a, b) => 
  new Date(b.start_time).getTime() - new Date(a.start_time).getTime() // Changed from a-b to b-a
);

// Initial load sorting
const sorted = data.sort((a, b) => 
  new Date(b.start_time).getTime() - new Date(a.start_time).getTime() // Changed from a-b to b-a
);
```

**Result:**
- ✅ Newest/latest events show first
- ✅ Upcoming interviews are immediately visible
- ✅ Better UX for daily workflow

---

#### 2. **Candidates Tab Sorting Fix**

**Problem:**
- Candidates were sorted alphabetically only
- No way to see newest candidates first
- Latest applicants buried in the list

**Solution:**
Implemented dual sorting: primary by creation date (newest first), secondary by last name (alphabetical).

**Code Changes:**
```typescript
// app/(tabs)/index.tsx - Lines 114-128

// Sort by created date (newest first), then alphabetically by last name
return filtered.sort((a: any, b: any) => {
  const aDate = new Date(a.created_at || a.createdAt || 0).getTime();
  const bDate = new Date(b.created_at || b.createdAt || 0).getTime();

  // Primary: newest first
  if (bDate !== aDate) {
    return bDate - aDate;
  }

  // Secondary: alphabetical by last name when dates are equal
  const aLastName = (a.last_name || a.lastName || '').toLowerCase();
  const bLastName = (b.last_name || b.lastName || '').toLowerCase();
  return aLastName.localeCompare(bLastName);
});
```

**Result:**
- ✅ Newest candidates appear first
- ✅ Same-day candidates sorted A-Z by last name
- ✅ Easy to spot fresh applications

---

#### 3. **Google Sign-In Button Added to Login**

**Problem:**
- Google Sign-In only available on signup page
- Users couldn't sign in with Google after account creation
- Inconsistent auth experience

**Solution:**
Added Google Sign-In button with OR divider to login page, matching signup page design.

**Code Changes:**
```typescript
// app/auth/login.tsx

// Import
import { GoogleConnectButton } from '@/components/auth/GoogleConnectButton';

// Inside form card, after Sign In button:
{/* Divider */}
<View style={styles.dividerContainer}>
  <View style={[styles.divider, { backgroundColor: colors.border }]} />
  <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
  <View style={[styles.divider, { backgroundColor: colors.border }]} />
</View>

{/* Google Sign In */}
<GoogleConnectButton
  buttonText="Sign in with Google"
  onSuccess={(userInfo) => {
    console.log('Google sign in success:', userInfo);
    router.replace('/(tabs)/home' as any);
  }}
/>

// Styles
dividerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 24,
},
divider: {
  flex: 1,
  height: 1,
},
dividerText: {
  fontSize: 13,
  fontWeight: '600',
  marginHorizontal: 16,
},
```

**Result:**
- ✅ Google Sign-In available on both login and signup
- ✅ Consistent auth experience
- ✅ Clean, minimal design

---

#### 4. **Communication Icons Removal**

**Problem:**
- Email and phone icons in candidate header were non-functional
- "Make Call", "Send SMS", "Send Email" in More Actions didn't work
- Cluttered UI with broken features

**Solution:**
Removed non-working communication entry points while preserving functional contact links in "Contact Information" section.

**Code Changes:**

**Candidate Header (Removed Icons):**
```typescript
// components/candidates/CandidateHeader.tsx

// Removed props
interface CandidateHeaderProps {
  candidate: any;
  onBack?: () => void;
  onStatusPress?: () => void;
  onMorePress?: () => void;
  // ❌ Removed: onEmailPress?: () => void;
  // ❌ Removed: onCallPress?: () => void;
}

// Removed JSX
{/* Header Actions */}
<View style={styles.headerActions}>
  {onBack && (
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Ionicons name="arrow-back" size={24} color={BrandColors.white} />
    </TouchableOpacity>
  )}
  {/* ❌ Removed: actionButtons View with mail-outline and call-outline icons */}
</View>
```

**More Actions Modal (Removed Items):**
```typescript
// components/candidates/CandidateActions.tsx

// Removed from actions array:
// ❌ Make Call
// ❌ Send SMS
// ❌ Send Email

// Kept only:
const actions = [
  { icon: 'calendar', label: 'Schedule Interview', ... },
  { icon: 'checkbox', label: 'Create Task', ... },
  { icon: 'document-text', label: 'Add Note', ... },
];
```

**Preserved Functional Links:**
```typescript
// app/candidate/[id].tsx - Contact Information section
const contactInfo = [
  { icon: 'mail', label: 'Email', value: candidate.email, link: `mailto:${candidate.email}` },
  { icon: 'call', label: 'Phone', value: candidate.phone, link: `tel:${candidate.phone}` },
  // ... other contact items
];
```

**Result:**
- ✅ Cleaner candidate header (only back button)
- ✅ Focused More Actions menu (schedule, tasks, notes)
- ✅ Contact links still work in "Contact Information" section
- ✅ No broken/non-functional UI elements

---

#### 5. **Contact Links & Schedule Modal Fixes**

**Problem A: Contact Links Not Working**
- Tapping email/phone in "Contact Information" did nothing
- `mailto:` and `tel:` URLs failed silently in simulator
- No error handling or user feedback

**Solution A:**
Enhanced link handling with `Linking.canOpenURL` check and proper error alerts.

**Code Changes:**
```typescript
// components/candidates/InfoSection.tsx

import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';

const handlePress = async (link?: string) => {
  if (!link) return;

  try {
    let normalized = link.trim();

    // Add https:// for plain web URLs (e.g. "www.site.com")
    if (
      !normalized.startsWith('http://') &&
      !normalized.startsWith('https://') &&
      !normalized.startsWith('mailto:') &&
      !normalized.startsWith('tel:')
    ) {
      normalized = `https://${normalized}`;
    }

    const canOpen = await Linking.canOpenURL(normalized);
    if (!canOpen) {
      Alert.alert('Not Supported', 'This action cannot be opened on this device or simulator.');
      return;
    }

    await Linking.openURL(normalized);
  } catch (error) {
    console.error('Failed to open link:', error);
    Alert.alert('Error', 'Unable to open this link on your device.');
  }
};
```

**Problem B: Schedule Time Pickers Not Opening**
- Tapping "Start Time" or "End Time" did nothing
- DateTimePicker rendered but was off-screen
- Keyboard focus prevented taps from registering

**Solution B:**
Added `keyboardShouldPersistTaps="handled"` to ScrollView.

**Code Changes:**
```typescript
// components/candidates/ScheduleInterviewModal.tsx

<ScrollView
  style={styles.content}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled" // ✅ Added this
>
  {/* Form content */}
</ScrollView>
```

**Result:**
- ✅ Email/phone links work on real devices
- ✅ Friendly alerts in simulator (where `mailto:`/`tel:` aren't supported)
- ✅ Portfolio/LinkedIn links auto-prefixed with `https://`
- ✅ Start/End Time pickers open reliably
- ✅ No tap-swallowing from keyboard/text inputs

---

### November 18, 2025 - Major Feature Release

#### 1. **Candidate Filtering & Viewed Status System**

**Problem Solved:**
- "New" and "All" filters showed the same candidates
- No way to track which candidates had been viewed
- No visual indicator for unread/new candidates

**Implementation:**

**Database Changes:**
```sql
-- Added viewed column to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS viewed BOOLEAN DEFAULT FALSE;

-- Added index for performance
CREATE INDEX IF NOT EXISTS idx_candidates_viewed ON candidates(viewed);
```

**Type Updates:**
```typescript
// types/candidate.ts
export interface Candidate {
  // ... existing fields
  viewed?: boolean; // Track if candidate has been viewed
}
```

**Service Methods:**
```typescript
// services/candidatesService.ts
async markAsViewed(id: string): Promise<void> {
  const { error } = await supabase
    .from('candidates')
    .update({ viewed: true })
    .eq('id', id);
}
```

**Filter Logic:**
```typescript
// app/(tabs)/index.tsx
const getFilteredCandidates = (filter: CandidateStatus | 'all' | 'new') => {
  return candidates.filter((candidate: any) => {
    // "New" filter shows only unviewed candidates
    if (filter === 'new') {
      return !candidate.viewed; // Only unviewed
    } else if (filter === 'all') {
      return true; // All candidates
    } else {
      return candidate.status === filter; // By status
    }
  });
};
```

**Visual Indicators:**
```typescript
// components/candidates/CandidateCard.tsx
<Card style={[
  styles.card,
  !candidate.viewed && { 
    borderLeftWidth: 4, 
    borderLeftColor: BrandColors.orange[500] 
  }
]}>
  {/* Orange dot on avatar */}
  {!candidate.viewed && (
    <View style={styles.unviewedDot}>
      <View style={[styles.unviewedDotInner, { 
        backgroundColor: BrandColors.orange[500] 
      }]} />
    </View>
  )}
  
  {/* NEW badge */}
  {!candidate.viewed && (
    <View style={[styles.newBadge, { 
      backgroundColor: BrandColors.orange[500] 
    }]}>
      <Text style={styles.newBadgeText}>NEW</Text>
    </View>
  )}
</Card>
```

**Auto-Mark as Viewed:**
```typescript
// app/candidate/[id].tsx
const loadCandidate = async () => {
  const data = await candidatesService.getCandidateById(id);
  setCandidate(data);
  
  // Mark as viewed when profile is opened
  if (data && !data.viewed) {
    await candidatesService.markAsViewed(id);
  }
};
```

**Features:**
- ✅ "New" filter shows only unviewed candidates
- ✅ Orange left border on unviewed candidate cards
- ✅ "NEW" badge next to candidate name
- ✅ Orange dot indicator on avatar
- ✅ Auto-marks as viewed when profile opened
- ✅ Real-time filter updates

---

#### 2. **Twilio Communication Integration with Smart Fallback**

**Problem Solved:**
- Communication buttons only opened native apps
- No professional call/SMS tracking
- No centralized phone number
- No call recordings or transcripts

**Implementation:**

**Smart Communication Service:**
```typescript
// services/communicationService.ts

// Preference Management
async getCallPreference(): Promise<'twilio' | 'native'> {
  const pref = await AsyncStorage.getItem('call_method');
  return (pref as 'twilio' | 'native') || 'twilio'; // Default to Twilio
}

// Smart Call - Twilio with Native Fallback
async smartCall(
  phoneNumber: string,
  candidateId: string,
  userId: string,
  userName: string,
  candidateName?: string
): Promise<void> {
  const preference = await this.getCallPreference();
  
  if (preference === 'twilio') {
    try {
      // Try Twilio first
      await this.makeCall(phoneNumber, candidateId, userId, userName, candidateName);
      Alert.alert('Call Initiated', 'Your phone will ring shortly.');
    } catch (error) {
      // Fallback to native if Twilio fails
      Alert.alert('Twilio Unavailable', 'Falling back to native phone app.', [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Phone', 
          onPress: async () => {
            await Linking.openURL(`tel:${phoneNumber}`);
            await this.logCall(candidateId, userId, userName, candidateName);
          }
        }
      ]);
    }
  } else {
    // Use native phone app
    await Linking.openURL(`tel:${phoneNumber}`);
    await this.logCall(candidateId, userId, userName, candidateName);
  }
}
```

**Twilio Integration:**
```typescript
// Make call via Twilio Edge Function
async makeCall(
  phoneNumber: string, 
  candidateId: string, 
  userId: string, 
  userName: string, 
  candidateName?: string
): Promise<void> {
  // Call Twilio via Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('make-call', {
    body: {
      to: phoneNumber,
      candidateId,
      candidateName,
      userId,
      userName,
    },
  });

  if (!data || !data.success) {
    throw new Error(data?.error || 'Twilio call failed');
  }

  // Log the call in database
  await supabase.from('calls').insert({
    candidate_id: candidateId,
    call_type: 'outbound',
    phone_number: phoneNumber,
    status: 'initiated',
    twilio_call_sid: data?.callSid,
    created_by: userId,
    created_by_name: userName,
  });

  // Log activity
  await supabase.from('activities').insert({
    candidate_id: candidateId,
    activity_type: 'call',
    description: `Called ${candidateName} at ${phoneNumber} via Twilio`,
    created_by: userId,
    created_by_name: userName,
  });
}
```

**Settings Integration:**
```typescript
// app/settings.tsx
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Communication</Text>
  
  {/* Call Method */}
  <View style={styles.card}>
    <Text style={styles.cardLabel}>Call Method</Text>
    <View style={styles.methodOptions}>
      <TouchableOpacity
        style={[
          styles.methodOption,
          callMethod === 'twilio' && styles.methodOptionActive
        ]}
        onPress={() => saveCallMethod('twilio')}
      >
        <Ionicons name="call" size={20} />
        <Text>Twilio</Text>
        <Text style={styles.methodBadge}>Pro</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.methodOption,
          callMethod === 'native' && styles.methodOptionActive
        ]}
        onPress={() => saveCallMethod('native')}
      >
        <Ionicons name="phone-portrait-outline" size={20} />
        <Text>Native</Text>
      </TouchableOpacity>
    </View>
  </View>
  
  {/* SMS Method */}
  {/* Email Method */}
</View>
```

**Features:**
- ✅ Twilio integration for calls & SMS
- ✅ Professional phone number (not personal)
- ✅ Call recording & transcripts
- ✅ Automatic fallback to native apps
- ✅ User-configurable preferences
- ✅ Full activity tracking
- ✅ Settings toggles for Call/SMS/Email methods

**How It Works:**
1. User taps "Call" button
2. System checks preference (Twilio/Native)
3. If Twilio: Calls via Edge Function → Your phone rings → Connected
4. If Twilio fails: Alert shown → User can open native phone app
5. All actions logged to database

---

#### 3. **Theme & Appearance System**

**Problem Solved:**
- App only followed system theme
- No user control over appearance
- Dark mode issues with login screen

**Implementation:**

**Custom useColorScheme Hook:**
```typescript
// hooks/use-color-scheme.ts
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'auto';

export function useColorScheme(): ColorScheme {
  const systemColorScheme = useSystemColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('auto');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    const saved = await AsyncStorage.getItem('theme_preference');
    if (saved) {
      setThemePreference(saved as ThemePreference);
    }
  };

  // Return appropriate color scheme based on preference
  if (themePreference === 'auto') {
    return systemColorScheme ?? 'light';
  }
  
  return themePreference;
}
```

**Settings UI:**
```typescript
// app/settings.tsx
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Appearance</Text>
  
  <View style={styles.card}>
    <Text style={styles.cardLabel}>Theme</Text>
    <Text style={styles.cardDescription}>
      Choose how RecruitFlow looks
    </Text>
    
    <View style={styles.themeOptions}>
      {/* Light Mode */}
      <TouchableOpacity
        style={[
          styles.themeOption,
          themePreference === 'light' && styles.themeOptionActive
        ]}
        onPress={() => saveThemePreference('light')}
      >
        <Ionicons name="sunny" size={24} />
        <Text>Light</Text>
      </TouchableOpacity>

      {/* Dark Mode */}
      <TouchableOpacity
        style={[
          styles.themeOption,
          themePreference === 'dark' && styles.themeOptionActive
        ]}
        onPress={() => saveThemePreference('dark')}
      >
        <Ionicons name="moon" size={24} />
        <Text>Dark</Text>
      </TouchableOpacity>

      {/* Auto Mode */}
      <TouchableOpacity
        style={[
          styles.themeOption,
          themePreference === 'auto' && styles.themeOptionActive
        ]}
        onPress={() => saveThemePreference('auto')}
      >
        <Ionicons name="phone-portrait-outline" size={24} />
        <Text>Auto</Text>
      </TouchableOpacity>
    </View>
  </View>
</View>
```

**Login Screen Fix:**
```typescript
// app/auth/login.tsx - Removed curved borders
header: {
  paddingTop: 80,
  paddingBottom: 60,
  paddingHorizontal: 24,
  alignItems: 'center',
  // Removed: borderBottomLeftRadius: 32,
  // Removed: borderBottomRightRadius: 32,
},
```

**Features:**
- ✅ Three theme options: Light, Dark, Auto
- ✅ Instant theme switching (no restart)
- ✅ Persistent preference storage
- ✅ Fixed dark mode visual glitches
- ✅ Seamless header transitions

---

#### 4. **Schedule Interview Time Picker Enhancement**

**Problem Solved:**
- Date/time picker not visible in dark mode
- "Done" button hard to see
- No visual feedback when picker is active

**Implementation:**

**Enhanced Date Picker:**
```typescript
// components/candidates/ScheduleInterviewModal.tsx
{showStartPicker && (
  <View style={[
    styles.pickerContainer, 
    { backgroundColor: colors.backgroundSecondary }
  ]}>
    <DateTimePicker
      value={startDate}
      mode="datetime"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      themeVariant={colorScheme} // Adapts to light/dark mode
      onChange={(event, date) => {
        if (Platform.OS === 'android') {
          setShowStartPicker(false);
        }
        if (date) {
          setStartDate(date);
          // Auto-adjust end time
          if (date >= endDate) {
            setEndDate(new Date(date.getTime() + 60 * 60 * 1000));
          }
        }
      }}
    />
    {Platform.OS === 'ios' && (
      <TouchableOpacity
        style={[
          styles.doneButton, 
          { backgroundColor: BrandColors.teal[500] }
        ]}
        onPress={() => setShowStartPicker(false)}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    )}
  </View>
)}
```

**Styles:**
```typescript
pickerContainer: {
  borderRadius: 12,
  padding: 16,
  marginTop: 8,
  marginBottom: 16,
},
doneButton: {
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 12,
},
doneButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
```

**Features:**
- ✅ Visible container background
- ✅ Theme-aware picker colors
- ✅ Prominent teal "Done" button
- ✅ Auto-adjusts end time (1 hour after start)
- ✅ Works in both light and dark modes

---

#### 5. **Add Note Functionality**

**Problem Solved:**
- "Add Note" button in More Actions didn't work
- No way to trigger note input from actions modal

**Implementation:**

**NotesSection Enhancement:**
```typescript
// components/candidates/NotesSection.tsx
interface NotesSectionProps {
  candidateId: string;
  userId: string;
  userName: string;
  triggerAddNote?: boolean; // NEW: External trigger
  onAddNoteTriggered?: () => void; // NEW: Callback
}

export function NotesSection({ 
  candidateId, 
  userId, 
  userName, 
  triggerAddNote, 
  onAddNoteTriggered 
}: NotesSectionProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Handle external trigger
  useEffect(() => {
    if (triggerAddNote) {
      setIsAddingNote(true);
      onAddNoteTriggered?.();
    }
  }, [triggerAddNote]);
  
  // ... rest of component
}
```

**Candidate Profile Integration:**
```typescript
// app/candidate/[id].tsx
const [triggerAddNote, setTriggerAddNote] = useState(false);

<CandidateActions
  onAddNote={() => setTriggerAddNote(true)}
/>

<NotesSection
  candidateId={candidate.id}
  userId={currentUser?.id || ''}
  userName={currentUser?.email || 'Recruiter'}
  triggerAddNote={triggerAddNote}
  onAddNoteTriggered={() => setTriggerAddNote(false)}
/>
```

**Features:**
- ✅ "Add Note" button now functional
- ✅ Opens note input form
- ✅ Scrolls to notes section
- ✅ Ready to type immediately

---

## Communication Features

### Settings & Configuration

#### User Preferences
- **Profile Management**: Update user information
- **Notification Settings**: Customize alerts
- **Theme Options**: Light/dark mode support
- **Language Settings**: Multi-language support

#### Integration Management
- **Google Account**: Connect/disconnect Google services
- **Twilio Configuration**: Set up phone/SMS
- **Email Settings**: Configure Gmail integration
- **API Keys**: Manage service credentials

---

## Setup & Installation

### Prerequisites

```bash
# Required software
- Node.js 18+ 
- npm or yarn
- Expo CLI
- EAS CLI
- Xcode (for iOS)
- Android Studio (for Android)
```

### Installation Steps

1. **Clone the Repository**
```bash
git clone <repository-url>
cd recruitflowproject
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment Variables**

Create a `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Google API Configuration
GOOGLE_CLIENT_ID=your_web_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_ios_client_id
```

4. **Start Development Server**
```bash
npx expo start
```

5. **Run on Device/Simulator**
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### Building for Production

#### iOS Build
```bash
eas build --platform ios --profile production
```

#### Android Build
```bash
eas build --platform android --profile production
```

#### OTA Updates
```bash
eas update --branch production --message "Update description"
```

---

## Supabase Configuration

### Database Schema

#### Candidates Table
```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new',
  rating INTEGER DEFAULT 0,
  position TEXT,
  location TEXT,
  experience JSONB,
  education JSONB,
  skills TEXT[],
  notes TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Activities Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Candidates policies
CREATE POLICY "Users can view their own candidates"
  ON candidates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own candidates"
  ON candidates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidates"
  ON candidates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own candidates"
  ON candidates FOR DELETE
  USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view activities for their candidates"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = activities.candidate_id
      AND candidates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert activities for their candidates"
  ON activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = activities.candidate_id
      AND candidates.user_id = auth.uid()
    )
  );
```

### Realtime Configuration

Enable realtime for tables:

```sql
-- Enable realtime for candidates
ALTER PUBLICATION supabase_realtime ADD TABLE candidates;

-- Enable realtime for activities
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
```

---

## Communication Features

### Twilio Setup

1. **Create Twilio Account**: Sign up at twilio.com
2. **Get Credentials**: Account SID and Auth Token
3. **Purchase Phone Number**: Get a Twilio phone number
4. **Configure Webhook**: Set up status callbacks

### Edge Function: Send SMS

```typescript
// supabase/functions/send-sms/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import twilio from 'npm:twilio@4.19.0'

serve(async (req) => {
  const { to, message } = await req.json()
  
  const client = twilio(
    Deno.env.get('TWILIO_ACCOUNT_SID'),
    Deno.env.get('TWILIO_AUTH_TOKEN')
  )
  
  const result = await client.messages.create({
    body: message,
    to: to,
    from: Deno.env.get('TWILIO_PHONE_NUMBER')
  })
  
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Edge Function: Initiate Call

```typescript
// supabase/functions/initiate-call/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import twilio from 'npm:twilio@4.19.0'

serve(async (req) => {
  const { to } = await req.json()
  
  const client = twilio(
    Deno.env.get('TWILIO_ACCOUNT_SID'),
    Deno.env.get('TWILIO_AUTH_TOKEN')
  )
  
  const call = await client.calls.create({
    to: to,
    from: Deno.env.get('TWILIO_PHONE_NUMBER'),
    url: 'http://demo.twilio.com/docs/voice.xml'
  })
  
  return new Response(JSON.stringify(call), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Edge Function: Send Email

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { to, subject, body, accessToken } = await req.json()
  
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    body
  ].join('\n')
  
  const encodedMessage = btoa(message).replace(/\+/g, '-').replace(/\//g, '_')
  
  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage })
    }
  )
  
  return new Response(JSON.stringify(await response.json()), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## Realtime Features

### Subscribing to Changes

```typescript
// Subscribe to candidate updates
const subscription = supabase
  .channel('candidates-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'candidates'
    },
    (payload) => {
      console.log('Change received!', payload)
      // Update local state
    }
  )
  .subscribe()

// Cleanup
return () => {
  subscription.unsubscribe()
}
```

### Activity Feed

```typescript
// Subscribe to activity updates
const activitySubscription = supabase
  .channel('activities-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'activities'
    },
    (payload) => {
      // Show notification
      // Update activity feed
    }
  )
  .subscribe()
```

---

## Activity Logging

### Automatic Activity Tracking

All user actions are automatically logged to the activities table:

```typescript
async function logActivity(
  candidateId: string,
  type: string,
  description: string,
  metadata?: any
) {
  const { data: { user } } = await supabase.auth.getUser()
  
  await supabase.from('activities').insert({
    candidate_id: candidateId,
    user_id: user?.id,
    type,
    description,
    metadata
  })
}
```

### Activity Types

- `status_change` - Candidate status updated
- `call` - Phone call made
- `sms` - SMS message sent
- `email` - Email sent
- `note` - Note added
- `rating` - Rating changed
- `profile_update` - Profile information updated
- `document_upload` - Document uploaded

---

## Implementation Details

### Project Structure

```
recruitflowproject/
├── app/                      # Expo Router pages
│   ├── (tabs)/              # Tab navigation
│   │   ├── home.tsx         # Home/Dashboard
│   │   ├── explore.tsx      # Candidate list
│   │   └── schedule.tsx     # Calendar
│   ├── auth/                # Authentication
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── candidate/           # Candidate details
│   │   └── [id].tsx
│   ├── add-candidate.tsx    # Add new candidate
│   ├── onboarding.tsx       # First-time setup
│   └── settings.tsx         # App settings
├── components/              # Reusable components
│   ├── auth/               # Auth components
│   ├── candidates/         # Candidate components
│   ├── communication/      # Call/SMS/Email
│   └── ui/                 # UI components
├── constants/              # App constants
│   └── theme.ts           # Design tokens
├── lib/                   # Utilities
│   └── supabase.ts       # Supabase client
├── services/             # Business logic
│   ├── googleAuthService.ts
│   └── communicationService.ts
├── types/               # TypeScript types
│   └── candidate.ts
├── supabase/           # Supabase functions
│   └── functions/
│       ├── send-sms/
│       ├── initiate-call/
│       └── send-email/
├── app.json           # Expo configuration
├── eas.json          # EAS Build configuration
└── .env             # Environment variables
```

### Key Components

#### CandidateCard
Displays candidate information in list view with status badge and quick actions.

#### CandidateProfile
Full candidate profile with all details, activity timeline, and communication options.

#### StatusBadge
Color-coded status indicator with consistent styling.

#### CommunicationModal
Modal for initiating calls, SMS, or emails with templates and history.

#### ActivityTimeline
Chronological display of all candidate activities with icons and timestamps.

---

## Current Status

### ✅ Completed

- **Core Functionality**
  - ✅ Candidate CRUD operations
  - ✅ Search and filtering
  - ✅ Status management
  - ✅ Rating system
  - ✅ Viewed/Unviewed tracking
  - ✅ Smart candidate filtering (All/New/Status)
  - ✅ **NEW (Nov 19):** Enhanced search with badge filtering
  - ✅ **NEW (Nov 19):** Profile picture upload
  
- **Communication**
  - ✅ Phone calls via Twilio with native fallback
  - ✅ SMS messaging via Twilio with native fallback
  - ✅ Email via Gmail API with native fallback
  - ✅ Activity logging for all communication
  - ✅ **NEW:** Smart communication system with preferences
  - ✅ **NEW:** Settings toggles for Call/SMS/Email methods
  
- **Real-time**
  - ✅ Live candidate updates
  - ✅ Activity feed
  - ✅ Collaborative editing
  - ✅ Real-time filter updates
  
- **UI/UX**
  - ✅ Modern design system
  - ✅ Responsive layouts
  - ✅ Smooth animations
  - ✅ Loading states
  - ✅ **NEW:** Theme system (Light/Dark/Auto)
  - ✅ **NEW:** Visual indicators for unviewed candidates
  - ✅ **NEW:** Fixed dark mode visual glitches
  - ✅ **NEW:** Enhanced date/time picker visibility
  
- **Authentication**
  - ✅ Email/password auth
  - ✅ Secure token storage
  - 🚧 Google OAuth (in progress - redirect configuration)
  
- **Scheduling & Notes**
  - ✅ Interview scheduling with Google Calendar
  - ✅ Task management with Google Tasks
  - ✅ Functional "Add Note" from actions modal
  - ✅ Enhanced time picker with theme support
  - ✅ **NEW (Nov 19):** Schedule tab event persistence
  - ✅ **NEW (Nov 19):** Real-time event deletion

### 🚧 In Progress

- **Google OAuth**: Final redirect configuration for iOS standalone builds
- **Push Notifications**: Real-time alerts for activities
- **Offline Mode**: Local data caching for offline access
- **Advanced Search**: Full-text search with advanced filters

### 📋 Planned Features

- **Analytics Dashboard**: Hiring metrics, pipeline insights, and KPIs
- **Team Collaboration**: Multi-user support with permissions
- **Bulk Actions**: Batch operations on candidates
- **Document Management**: Resume parsing and file storage
- **Reporting**: Export candidates, generate reports
- **Mobile Optimization**: Performance improvements and caching
- **Email Templates**: Customizable email templates
- **Interview Feedback**: Structured feedback forms
- **Candidate Portal**: Self-service portal for candidates

### 🎯 Recent Achievements

**November 19, 2025:**
- ✅ Implemented profile picture upload with Supabase Storage
- ✅ Fixed schedule tab event persistence (events no longer disappear)
- ✅ Added real-time event deletion handling
- ✅ Enhanced search to include badge filtering (qualified, resume, stage, status)
- ✅ Created comprehensive deployment documentation

**November 18, 2025:**
- ✅ Implemented candidate viewed/unviewed tracking system
- ✅ Fixed candidate filter functionality (New vs All vs Status)
- ✅ Integrated Twilio communication with smart fallback
- ✅ Added theme preferences (Light/Dark/Auto)
- ✅ Fixed all communication buttons (Call/SMS/Email)
- ✅ Enhanced schedule interview time picker
- ✅ Made "Add Note" button functional
- ✅ Resolved all TypeScript errors
- ✅ Fixed dark mode visual glitches

---

## Known Issues & Solutions

### Issue 1: Login Screen White Gap in Dark Mode

**Problem:**
Curved white edge appeared between teal header and dark background when dark mode was enabled.

**Cause:**
The header had `borderBottomLeftRadius` and `borderBottomRightRadius` properties that revealed the container's white background color underneath.

**Solution:**
```typescript
// app/auth/login.tsx & app/auth/signup.tsx
header: {
  paddingTop: 80,
  paddingBottom: 60,
  paddingHorizontal: 24,
  alignItems: 'center',
  // REMOVED: borderBottomLeftRadius: 32,
  // REMOVED: borderBottomRightRadius: 32,
},
```

**Status:** ✅ Fixed

---

### Issue 2: Communication Buttons Not Working

**Problem:**
Email, Call, and SMS buttons in candidate profile showed success alerts but didn't actually perform actions.

**Cause:**
Buttons were calling API methods that showed alerts without opening native apps or using Twilio.

**Solution:**
Implemented smart communication methods with Twilio integration and native fallback:

```typescript
// services/communicationService.ts
async smartCall(phoneNumber, candidateId, userId, userName, candidateName) {
  const preference = await this.getCallPreference();
  
  if (preference === 'twilio') {
    try {
      await this.makeCall(...); // Twilio Edge Function
      Alert.alert('Call Initiated', 'Your phone will ring shortly.');
    } catch (error) {
      // Fallback to native
      Alert.alert('Twilio Unavailable', 'Falling back to native phone app.');
    }
  } else {
    await Linking.openURL(`tel:${phoneNumber}`);
  }
}
```

**Status:** ✅ Fixed

---

### Issue 3: "Add Note" Button Did Nothing

**Problem:**
Clicking "Add Note" in More Actions modal had no effect.

**Cause:**
The button only logged to console (`console.log('Add note')`), didn't trigger the NotesSection component.

**Solution:**
Added trigger props to NotesSection and state management in parent:

```typescript
// app/candidate/[id].tsx
const [triggerAddNote, setTriggerAddNote] = useState(false);

<CandidateActions onAddNote={() => setTriggerAddNote(true)} />
<NotesSection 
  triggerAddNote={triggerAddNote}
  onAddNoteTriggered={() => setTriggerAddNote(false)}
/>
```

**Status:** ✅ Fixed

---

### Issue 4: Schedule Interview Time Picker Not Visible

**Problem:**
Date/time picker appeared but was hard to see in dark mode, "Done" button not prominent.

**Cause:**
No background container for picker, theme variant not set, done button used generic primary color.

**Solution:**
```typescript
// components/candidates/ScheduleInterviewModal.tsx
<View style={[styles.pickerContainer, { backgroundColor: colors.backgroundSecondary }]}>
  <DateTimePicker
    themeVariant={colorScheme} // Theme-aware
    // ...
  />
  <TouchableOpacity
    style={[styles.doneButton, { backgroundColor: BrandColors.teal[500] }]}
    onPress={() => setShowStartPicker(false)}
  >
    <Text style={styles.doneButtonText}>Done</Text>
  </TouchableOpacity>
</View>
```

**Status:** ✅ Fixed

---

### Issue 5: "New" and "All" Filters Showed Same Candidates

**Problem:**
Both filters displayed identical results, no way to see only new/unviewed candidates.

**Cause:**
"New" filter was checking `status === 'new'` instead of `viewed === false`.

**Solution:**
```typescript
// app/(tabs)/index.tsx
const getFilteredCandidates = (filter) => {
  return candidates.filter((candidate) => {
    if (filter === 'new') {
      return !candidate.viewed; // Only unviewed
    } else if (filter === 'all') {
      return true; // All candidates
    } else {
      return candidate.status === filter; // By status
    }
  });
};
```

Added database column:
```sql
ALTER TABLE candidates ADD COLUMN viewed BOOLEAN DEFAULT FALSE;
```

**Status:** ✅ Fixed

---

### Issue 6: TypeScript Errors in communicationService.ts

**Problem:**
6 TypeScript errors:
- `logCall` expected 6 arguments, got 4
- `logSMS` method doesn't exist
- `logEmail` method doesn't exist

**Cause:**
Methods were called with simplified signatures but didn't exist or had wrong signatures.

**Solution:**
Created simplified logging methods for native app fallback:

```typescript
// services/communicationService.ts
async logCall(candidateId, userId, userName, candidateName?) {
  await supabase.from('calls').insert({
    candidate_id: candidateId,
    call_type: 'outbound',
    phone_number: 'N/A',
    status: 'completed',
    created_by: userId,
    created_by_name: userName,
  });
  
  await supabase.from('activities').insert({
    candidate_id: candidateId,
    activity_type: 'call',
    description: `Called ${candidateName} via native phone app`,
    created_by: userId,
    created_by_name: userName,
  });
}

// Similar for logSMS() and logEmail()
```

**Status:** ✅ Fixed

---

## Troubleshooting

### Common Issues

#### Build Failures
- Check environment variables in `eas.json`
- Verify all dependencies are installed
- Clear cache: `npx expo start -c`
- Run: `npm install` to ensure all packages are installed

#### Supabase Connection
- Verify URL and keys in `.env`
- Check RLS policies in Supabase dashboard
- Ensure all required tables exist
- Test connection with: `npx supabase status`

#### Communication Features
- **Twilio Not Working:**
  - Verify credentials in `.env` (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
  - Check Edge Function deployment: `npx supabase functions list`
  - Test with valid phone numbers (not test numbers)
  - Check Twilio console for error logs
  
- **Native Fallback:**
  - If Twilio fails, app automatically falls back to native apps
  - User will see alert with option to open Phone/Messages/Email app
  - Actions are still logged to database

#### Google OAuth
- Verify Client IDs in Google Cloud Console
- Check redirect URIs match exactly
- Ensure URL schemes are configured in `app.json`
- See `GOOGLE_OAUTH_COMPLETE_SETUP.md` for detailed troubleshooting

#### Theme Not Changing
- Clear AsyncStorage: Settings > Clear App Data
- Restart app after theme change
- Check `hooks/use-color-scheme.ts` is being used

#### Candidate Filters Not Working
- Ensure `viewed` column exists in database
- Run migration: See `supabase/migrations/add_viewed_column.sql`
- Check filter logic in `app/(tabs)/index.tsx`

---

## Support & Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev/)
- [Twilio Documentation](https://www.twilio.com/docs)

### Community
- GitHub Issues
- Expo Forums
- Supabase Discord
- Stack Overflow

---

## License

[Your License Here]

## Contributors

[Your Team/Contributors Here]

---

## Deployment Guide

### Version Management

**Current Version:** 1.0.1

**Version History:**
- `1.0.0` - Initial release
- `1.0.1` - Profile pictures, schedule persistence, enhanced search

### Building for TestFlight

#### Prerequisites
```bash
# Ensure you have EAS CLI installed
npm install -g eas-cli

# Login to Expo
eas login
```

#### Step 1: Update Version
```json
// app.json
{
  "expo": {
    "version": "1.0.1",  // Increment this
    // ...
  }
}
```

#### Step 2: Build for iOS
```bash
# Full native build (required for new packages like expo-image-picker)
eas build --platform ios --profile production
```

**Build Configuration:**
```json
// eas.json
{
  "build": {
    "production": {
      "autoIncrement": true,  // Auto-increments build number
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "your_url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your_key",
        "EXPO_PUBLIC_GOOGLE_CLIENT_ID": "your_client_id"
      }
    }
  }
}
```

#### Step 3: Submit to TestFlight
```bash
# After build completes (15-20 minutes)
eas submit --platform ios --latest
```

#### Step 4: Wait for Processing
- Build uploads to App Store Connect (~5 minutes)
- Apple processes the build (~5-10 minutes)
- Build appears in TestFlight
- Add testers and distribute

### OTA Updates (Over-The-Air)

**When to use OTA:**
- JS/React code changes only
- No new native packages
- Quick bug fixes
- UI/UX tweaks

**When NOT to use OTA:**
- New native packages installed (like expo-image-picker)
- Native code changes
- Major version updates
- Expo SDK upgrades

**Publishing OTA Update:**
```bash
# Publish update to production channel
eas update --branch production --message "Fix: Schedule tab persistence"

# Users will receive update automatically on next app launch
```

### Build vs OTA Decision Tree

```
Did you install new packages?
├─ Yes → Full EAS Build required
└─ No → Check if native code changed
    ├─ Yes → Full EAS Build required
    └─ No → OTA Update is fine
```

### Deployment Checklist

**Before Building:**
- [ ] All code changes committed
- [ ] Version number incremented in `app.json`
- [ ] Environment variables set in `eas.json`
- [ ] Tested on local device/simulator
- [ ] No TypeScript errors
- [ ] No console warnings

**After Building:**
- [ ] Build completed successfully
- [ ] Submitted to App Store Connect
- [ ] Build processed by Apple
- [ ] Added to TestFlight
- [ ] Distributed to testers
- [ ] Tested on real device via TestFlight

### Troubleshooting Builds

**Build Failed:**
```bash
# Check build logs
eas build:list

# View specific build
eas build:view [build-id]

# Common fixes
npm install  # Reinstall dependencies
npx expo-doctor  # Check for issues
npx expo start -c  # Clear cache
```

**Submit Failed:**
- Check App Store Connect credentials
- Verify bundle identifier matches
- Ensure certificates are valid
- Check for missing app icons

---

**Last Updated**: November 19, 2025
