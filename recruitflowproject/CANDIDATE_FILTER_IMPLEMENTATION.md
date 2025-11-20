# Candidate Filter & Viewed Status Implementation

## Overview
Implemented functional status filters for the Candidates tab with proper "New" vs status-based filtering, plus visual indicators for unviewed candidates.

## Changes Made

### 1. Database Schema
**File:** `supabase/migrations/add_viewed_column.sql`
- Added `viewed` boolean column to `candidates` table (default: FALSE)
- Added index for performance optimization
- **Action Required:** Run this migration in your Supabase dashboard

### 2. Type Definitions
**File:** `types/candidate.ts`
- Added `viewed?: boolean` field to Candidate interface

### 3. Service Layer
**File:** `services/candidatesService.ts`
- Added `markAsViewed(id: string)` method to update candidate viewed status

### 4. Filter Logic
**File:** `app/(tabs)/index.tsx`
- Updated `getFilteredCandidates()` to handle "New" filter correctly:
  - **"All"** = Shows all candidates
  - **"New"** = Shows only unviewed candidates (viewed = false)
  - **"Screening/Interview/Offer"** = Shows candidates by status

### 5. Visual Indicators
**File:** `components/candidates/CandidateCard.tsx`
Added three visual indicators for unviewed candidates:
1. **Orange left border** (4px) on the card
2. **"NEW" badge** next to candidate name
3. **Orange dot** on avatar (top-right corner)

### 6. Auto-Mark as Viewed
**File:** `app/candidate/[id].tsx`
- Automatically marks candidate as viewed when profile is opened
- Only updates if candidate hasn't been viewed before

## How It Works

### User Flow:
1. New candidate is added → `viewed = false` by default
2. Candidate appears in "New" filter with visual indicators
3. User opens candidate profile → automatically marked as `viewed = true`
4. Visual indicators disappear, candidate no longer shows in "New" filter
5. Candidate still appears in their status filter (Screening, Interview, etc.)

### Filter Behavior:
- **All Tab**: Shows every candidate regardless of viewed status or status
- **New Tab**: Only shows candidates with `viewed = false` (unread/unopened)
- **Screening Tab**: Shows candidates with `status = 'screening'`
- **Interview Tab**: Shows candidates with `status = 'interview'`
- **Offer Tab**: Shows candidates with `status = 'offer'`

## Visual Design
Following RecruitFlow's design system:
- **Accent Color**: Orange (#FF9F5C) for "new" indicators
- **Primary Color**: Teal for active filters
- Consistent with email read/unread pattern

## Next Steps
1. **Run the SQL migration** in Supabase dashboard
2. Test the filters in the app
3. Add new candidates to see the "NEW" indicators
4. Open candidates to see them automatically marked as viewed

## Real-time Updates
The implementation works with existing real-time subscriptions:
- New candidates appear immediately in the list
- Status changes update filters in real-time
- Viewed status updates propagate through the app
