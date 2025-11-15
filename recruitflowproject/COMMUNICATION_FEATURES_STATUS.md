# Communication Features Status

## Overview
This document explains the current state of communication features (calls, SMS, emails) in RecruitFlow and what needs to be set up for them to work properly.

## Current Implementation

### ✅ What's Already Built (Frontend)
- **Header Icons**: Email and phone icons on candidate profile page
- **More Actions Modal**: 6 action buttons (Call, SMS, Email, Schedule, Task, Note)
- **Contact Information**: Clickable phone/email in contact section
- **Service Layer**: `communicationService.ts` with proper API integration
- **Error Handling**: Improved validation and error messages
- **Activity Logging**: All actions logged to database when successful

### ⚠️ What Needs Backend Setup (Supabase Edge Functions)

The app is configured to use **Supabase Edge Functions** for server-side communication. These Edge Functions need to be deployed to your Supabase project:

#### 1. **make-call** Edge Function (Twilio)
- **Purpose**: Initiate phone calls via Twilio API
- **Location**: `supabase/functions/make-call/index.ts`
- **Required**: Twilio Account SID, Auth Token, Phone Number
- **Status**: ❌ Not deployed yet

#### 2. **send-sms** Edge Function (Twilio)
- **Purpose**: Send SMS messages via Twilio API
- **Location**: `supabase/functions/send-sms/index.ts`
- **Required**: Twilio Account SID, Auth Token, Phone Number
- **Status**: ❌ Not deployed yet

#### 3. **send-email** Edge Function (Gmail)
- **Purpose**: Send emails via Gmail API
- **Location**: `supabase/functions/send-email/index.ts`
- **Required**: Google OAuth tokens, Gmail API access
- **Status**: ❌ Not deployed yet

## How It Works Now

### Current Behavior:
1. User taps "Make Call" / "Send Email" / "Send SMS"
2. App calls Supabase Edge Function
3. **If Edge Function doesn't exist or fails:**
   - Error message shown: "Twilio Edge Function failed" or "Gmail Edge Function failed"
   - No fake success messages
   - Nothing logged to database
4. **If Edge Function succeeds:**
   - Action performed (call/SMS/email sent)
   - Activity logged to database
   - Success message shown

### What Users See:
- ✅ **Contact Information section**: Native phone dialer and email composer work (no backend needed)
- ❌ **Header icons & More Actions**: Show error messages until Edge Functions are deployed

## Next Steps to Make It Work

### Option 1: Deploy Supabase Edge Functions (Recommended)
This is the **priority approach** for production use.

1. **Create Edge Functions** in your Supabase project:
   ```bash
   cd supabase/functions
   supabase functions new make-call
   supabase functions new send-sms
   supabase functions new send-email
   ```

2. **Implement the functions** (examples below)

3. **Set environment variables** in Supabase:
   ```bash
   supabase secrets set TWILIO_ACCOUNT_SID=your_sid
   supabase secrets set TWILIO_AUTH_TOKEN=your_token
   supabase secrets set TWILIO_PHONE_NUMBER=your_number
   ```

4. **Deploy the functions**:
   ```bash
   supabase functions deploy make-call
   supabase functions deploy send-sms
   supabase functions deploy send-email
   ```

### Option 2: Native Fallback (Quick Testing)
For quick testing without backend setup, we can add native device fallbacks:
- Open phone dialer with `Linking.openURL('tel:...')`
- Open SMS composer with `Linking.openURL('sms:...')`
- Open email composer with `MailComposer.composeAsync()`

**Note**: This won't log to database or track activities.

## Edge Function Examples

### make-call Edge Function
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Twilio from 'https://esm.sh/twilio@4.19.0'

serve(async (req) => {
  const { to, candidateId, candidateName, userId, userName } = await req.json()
  
  const client = Twilio(
    Deno.env.get('TWILIO_ACCOUNT_SID'),
    Deno.env.get('TWILIO_AUTH_TOKEN')
  )
  
  try {
    const call = await client.calls.create({
      to,
      from: Deno.env.get('TWILIO_PHONE_NUMBER'),
      url: 'http://demo.twilio.com/docs/voice.xml', // Replace with your TwiML
    })
    
    return new Response(
      JSON.stringify({ success: true, callSid: call.sid }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### send-sms Edge Function
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Twilio from 'https://esm.sh/twilio@4.19.0'

serve(async (req) => {
  const { to, message, candidateId, candidateName, userId, userName } = await req.json()
  
  const client = Twilio(
    Deno.env.get('TWILIO_ACCOUNT_SID'),
    Deno.env.get('TWILIO_AUTH_TOKEN')
  )
  
  try {
    const sms = await client.messages.create({
      to,
      from: Deno.env.get('TWILIO_PHONE_NUMBER'),
      body: message,
    })
    
    return new Response(
      JSON.stringify({ success: true, messageSid: sms.sid }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### send-email Edge Function
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { to, subject, body, candidateId, candidateName, userId, userName } = await req.json()
  
  // Use Gmail API with OAuth tokens
  // This requires Google OAuth setup (already done for Google Sign-In)
  
  try {
    // Implementation depends on your Gmail API setup
    // You can use the googleAuthService tokens here
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

## Testing Checklist

### Before Deployment:
- [ ] Twilio account created and credentials added to `.env`
- [ ] Gmail API configured (already done for Google OAuth)
- [ ] Edge Functions created in Supabase project
- [ ] Environment variables set in Supabase
- [ ] Edge Functions deployed and tested

### After Deployment:
- [ ] Test "Make Call" from header icon
- [ ] Test "Make Call" from More Actions modal
- [ ] Test "Send SMS" from More Actions modal
- [ ] Test "Send Email" from header icon
- [ ] Test "Send Email" from More Actions modal
- [ ] Verify activities are logged in database
- [ ] Verify error messages show when functions fail
- [ ] Test native phone dialer from Contact Information (should always work)

## Environment Variables

### Already in `.env`:
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Need to Add to Supabase:
```bash
supabase secrets set TWILIO_ACCOUNT_SID=your_twilio_account_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_twilio_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Summary

✅ **Frontend is complete and correct**
✅ **Error handling improved - no more fake success messages**
✅ **Edge Functions are prioritized (server-side integration)**
⚠️ **Backend Edge Functions need to be deployed**
✅ **Native fallbacks work in Contact Information section**

The app is ready for production once the Supabase Edge Functions are deployed!
