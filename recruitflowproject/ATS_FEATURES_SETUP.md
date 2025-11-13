# RecruitFlow ATS/CRM Features Setup Guide

## 🎯 Complete Feature List

### ✅ Implemented Features

1. **Notes Management** (with Realtime)
   - Add, view, delete notes
   - Multiple note types (general, interview, phone screen, reference, follow-up)
   - Realtime updates using Supabase subscriptions
   - Author and timestamp tracking

2. **Task Management** (with Realtime)
   - Create and assign tasks
   - Priority levels (low, medium, high, urgent)
   - Due dates and status tracking
   - Google Tasks API integration ready

3. **Calendar Events** (with Realtime)
   - Schedule interviews and meetings
   - Multiple event types
   - Device calendar integration (iOS/Android)
   - Google Calendar API integration ready
   - Attendees and meeting links

4. **Phone Calls**
   - Make calls via native dialer
   - Call history logging
   - Duration and notes tracking
   - Twilio integration ready for advanced features

5. **SMS Messages**
   - Send SMS via native messaging app
   - Message history
   - Twilio integration ready for in-app messaging

6. **Email**
   - Send emails via native mail composer
   - Email history tracking
   - Subject and body composition

7. **Activity Timeline**
   - Automatic activity logging
   - All interactions tracked
   - Realtime updates

---

## 📋 Database Setup

### Step 1: Run SQL Schema

1. Go to your Supabase project: https://supabase.com/dashboard/project/khnranbpqbyszakbfavb/editor
2. Click on "SQL Editor"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and run the SQL

This creates:
- ✅ `candidates` table
- ✅ `candidate_skills` table
- ✅ `candidate_experience` table
- ✅ `candidate_education` table
- ✅ `notes` table (with realtime)
- ✅ `tasks` table (with realtime)
- ✅ `calendar_events` table (with realtime)
- ✅ `calls` table
- ✅ `sms_messages` table
- ✅ `emails` table
- ✅ `activities` table (with realtime)

### Step 2: Enable Realtime

The schema automatically enables realtime for:
- Notes
- Tasks
- Calendar Events
- Activities

Verify in Supabase Dashboard → Database → Replication

---

## 🔧 API Integrations Setup

### Twilio (Phone Calls & SMS)

#### Option 1: Native Device Features (Current Implementation)
- ✅ Uses device's native dialer for calls
- ✅ Uses device's native SMS app
- ✅ No additional setup required
- ✅ Works immediately

#### Option 2: Twilio Integration (Advanced)
For in-app calling and SMS:

1. **Sign up for Twilio**: https://www.twilio.com/try-twilio
2. **Get credentials**:
   - Account SID
   - Auth Token
   - Phone Number

3. **Update `.env`**:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

4. **Create Backend API** (Required for security):
   ```
   POST /api/twilio/call
   POST /api/twilio/sms
   ```

5. **Update service calls** in `communicationService.ts`

---

### Google Calendar API

1. **Create Google Cloud Project**: https://console.cloud.google.com

2. **Enable APIs**:
   - Google Calendar API
   - Google Tasks API

3. **Create OAuth 2.0 Credentials**:
   - Application type: iOS/Android
   - Get Client ID and Client Secret

4. **Update `.env`**:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

5. **Install Google Sign-In**:
   ```bash
   npx expo install @react-native-google-signin/google-signin
   ```

6. **Implement OAuth flow** in `calendarService.ts`

---

### Google Tasks API

1. **Same setup as Google Calendar** (uses same project)

2. **Enable Google Tasks API** in Cloud Console

3. **Implement sync** in `tasksService.ts`:
   - Create task in Supabase
   - Sync to Google Tasks
   - Store `google_task_id` for updates

---

## 📱 App Permissions

### iOS (Info.plist)
```xml
<key>NSCalendarsUsageDescription</key>
<string>We need access to your calendar to schedule interviews</string>
<key>NSContactsUsageDescription</key>
<string>We need access to contacts for candidate information</string>
```

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.SEND_SMS" />
```

---

## 🚀 Usage Examples

### Adding a Note
```typescript
import { notesService } from '@/services/notesService';

await notesService.createNote(
  candidateId,
  'Great interview, strong technical skills',
  'interview',
  userId,
  userName
);
```

### Creating a Task
```typescript
import { tasksService } from '@/services/tasksService';

await tasksService.createTask(
  candidateId,
  'Follow up on references',
  'Contact previous employers',
  '2025-01-20T10:00:00Z',
  'high',
  userId,
  userName
);
```

### Scheduling an Interview
```typescript
import { calendarService } from '@/services/calendarService';

await calendarService.createEvent(
  candidateId,
  'Technical Interview - Sarah Johnson',
  'Discuss React Native experience',
  'interview',
  new Date('2025-01-15T14:00:00'),
  new Date('2025-01-15T15:00:00'),
  'Conference Room A',
  'https://meet.google.com/abc-defg-hij',
  ['interviewer@company.com'],
  userId,
  userName,
  true // Add to device calendar
);
```

### Making a Call
```typescript
import { communicationService } from '@/services/communicationService';

await communicationService.makeCall(
  '+1234567890',
  candidateId,
  userId,
  userName
);
```

### Sending an Email
```typescript
await communicationService.sendEmail(
  'candidate@email.com',
  'Interview Invitation',
  'We would like to invite you for an interview...',
  candidateId,
  userId,
  userName
);
```

---

## 🔄 Realtime Updates

All realtime features work automatically:

```typescript
// Subscribe to notes
const unsubscribe = notesService.subscribeToNotes(candidateId, (note) => {
  console.log('New note:', note);
  // Update UI
});

// Cleanup
return unsubscribe;
```

---

## 🎨 UI Components

### NotesSection
- Displays all notes with realtime updates
- Add new notes with type selection
- Delete notes
- Shows author and timestamp

### CandidateActions
- Quick action buttons
- Modal with all available actions
- Call, SMS, Email, Schedule, Task, Note

### Usage in Candidate Profile
```typescript
import { NotesSection } from '@/components/candidates/NotesSection';
import { CandidateActions } from '@/components/candidates/CandidateActions';

<CandidateActions
  candidateId={candidate.id}
  candidateName={`${candidate.firstName} ${candidate.lastName}`}
  email={candidate.email}
  phone={candidate.phone}
  userId="user-123"
  userName="John Recruiter"
  onScheduleInterview={() => {/* Show schedule modal */}}
  onAddTask={() => {/* Show task modal */}}
  onAddNote={() => {/* Show note input */}}
/>

<NotesSection
  candidateId={candidate.id}
  userId="user-123"
  userName="John Recruiter"
/>
```

---

## 📊 Activity Tracking

All actions are automatically logged:
- Notes added
- Tasks created
- Interviews scheduled
- Calls made
- SMS sent
- Emails sent
- Status changes

View in the activities table or candidate timeline.

---

## 🔐 Security Best Practices

1. **Never expose Twilio credentials** in mobile app
2. **Use backend API** for Twilio operations
3. **Validate permissions** before accessing calendar/contacts
4. **Use RLS policies** in Supabase
5. **Sanitize user input** before database operations

---

## 📦 Required Packages

Already added to package.json:
- ✅ `@supabase/supabase-js` - Database and realtime
- ✅ `expo-calendar` - Calendar integration
- ✅ `expo-mail-composer` - Email composition
- ✅ `expo-linking` - Phone calls and SMS

Run: `npm install`

---

## 🎯 Next Steps

1. ✅ Run database schema in Supabase
2. ✅ Install npm packages
3. ⏳ Set up Twilio (optional, for advanced features)
4. ⏳ Set up Google APIs (optional, for sync)
5. ✅ Test features in the app

---

## 🐛 Troubleshooting

### "Cannot make phone calls on this device"
- Test on a real device, not simulator
- Check app permissions

### "Email is not available"
- Ensure device has mail app configured
- Test on real device

### Realtime not working
- Check Supabase realtime is enabled
- Verify table is in replication publication
- Check network connection

### Calendar permission denied
- Go to device Settings → App → Permissions
- Enable calendar access

---

Built with ❤️ for modern recruiters
