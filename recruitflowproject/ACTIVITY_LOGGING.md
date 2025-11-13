# Activity Logging - Complete Implementation

## ✅ CURRENTLY LOGGED ACTIVITIES

### 1. **Adding Candidates**
- **Location:** `app/add-candidate.tsx`
- **Activity Type:** `status_change`
- **Description:** "Added [Name] to system - [Position]"
- **When:** After candidate is successfully created
- **Shows:** Candidate name, position

### 2. **Scheduling Interviews**
- **Location:** `services/calendarService.ts` → `createEvent()`
- **Activity Type:** `interview_scheduled`
- **Description:** "Scheduled [event type] - [Time], [Date] at [Location]"
- **When:** After interview is scheduled
- **Shows:** Event type, time, date, location

### 3. **Real-Time Updates**
- **Location:** `components/candidates/RecentActivity.tsx`
- **Feature:** Supabase real-time subscriptions
- **Updates:** Automatically when activities are inserted/updated/deleted
- **No refresh needed**

## 📋 ACTIVITIES TO ADD (Future)

### Status Changes
- When candidate status changes (New → Screening → Interview → Offer → Hired)
- **Suggested:** "Status changed to [Status] for [Candidate Name]"

### Notes
- When notes are added to candidates
- **Suggested:** "Note added: [Note preview]"

### Tasks
- When tasks are created
- **Suggested:** "Task created: [Task title]"

### Communications
- When calls/SMS/emails are logged
- **Suggested:** "Called [Candidate Name] - [Duration]"
- **Suggested:** "SMS sent to [Candidate Name]"
- **Suggested:** "Email sent to [Candidate Name]"

### Offers
- When offers are extended
- **Suggested:** "Offer extended to [Candidate Name] - [Position]"

## 🎯 HOW TO ADD NEW ACTIVITIES

Use the `activitiesService.createActivity()` method:

```typescript
import { activitiesService } from '@/services/activitiesService';

await activitiesService.createActivity(
  candidateId,        // UUID of candidate
  'activity_type',    // 'call' | 'sms' | 'email' | 'note' | 'status_change' | 'interview_scheduled' | 'task_created'
  'Description text', // What happened
  '',                 // created_by UUID (optional)
  'Recruiter Name'    // Who did it
);
```

## 📊 WHERE ACTIVITIES SHOW

- **Home Screen** → Activity Tab
- Real-time updates
- Shows all activities across all candidates
- Sorted by most recent first

## 🔄 REAL-TIME FEATURES

- Activities appear instantly when created
- No page refresh needed
- WebSocket connection via Supabase
- All users see updates simultaneously
