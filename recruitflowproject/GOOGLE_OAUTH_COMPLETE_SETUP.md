# Google OAuth Complete Setup Guide

## ✅ What We've Implemented

### 1. **Packages Installed**
- ✅ `expo-auth-session` - OAuth flow management
- ✅ `expo-secure-store` - Secure token storage
- ✅ `expo-web-browser` - OAuth browser handling
- ✅ `expo-crypto` - Cryptographic operations

### 2. **Services Created**
- ✅ `googleAuthService.ts` - Complete OAuth token management
  - Token exchange and refresh
  - Secure storage with Expo SecureStore
  - Automatic token refresh when expired
  - User info fetching
  - Authenticated API calls

### 3. **UI Components**
- ✅ `GoogleConnectButton.tsx` - Beautiful Google sign-in button
- ✅ `settings.tsx` - Dedicated settings screen with Google integration
- ✅ Integration with existing auth flow

### 4. **Features**
- ✅ Full OAuth 2.0 flow with PKCE
- ✅ Offline access (refresh tokens)
- ✅ Secure token storage
- ✅ Automatic token refresh
- ✅ User info display
- ✅ Connect/Disconnect functionality
- ✅ Integration status in Supabase user metadata

---

## 🔧 Required: Google Cloud Console Setup

### Step 1: Create OAuth 2.0 Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Select your project (or create one)

2. **Enable Required APIs**
   Navigate to **APIs & Services > Library** and enable:
   - ✅ Google Calendar API
   - ✅ Google Tasks API
   - ✅ Gmail API

3. **Create OAuth 2.0 Client IDs**
   Navigate to **APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID**

   **You need to create 3 different Client IDs:**

   #### a) **Web Application** (Most Important!)
   - Application type: **Web application**
   - Name: `RecruitFlow Web Client`
   - Authorized redirect URIs:
     ```
     https://auth.expo.io/@your-expo-username/recruitflowproject
     ```
   - **Save the Client ID** - This is what goes in your `.env` file

   #### b) **iOS Application**
   - Application type: **iOS**
   - Name: `RecruitFlow iOS`
   - Bundle ID: Get from `app.json` → `ios.bundleIdentifier`
     - Example: `com.yourcompany.recruitflow`

   #### c) **Android Application**
   - Application type: **Android**
   - Name: `RecruitFlow Android`
   - Package name: Get from `app.json` → `android.package`
     - Example: `com.yourcompany.recruitflow`
   - SHA-1 certificate fingerprint:
     ```bash
     # For development, get your debug keystore SHA-1:
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```

### Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services > OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Fill in:
   - App name: `RecruitFlow`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   ```
   .../auth/userinfo.email
   .../auth/userinfo.profile
   .../auth/calendar.events
   .../auth/tasks
   .../auth/gmail.send
   .../auth/gmail.readonly
   ```
5. Add test users (your email) while in development
6. Save and continue

### Step 3: Update Environment Variables

Your `.env` file should have:
```bash
# This is the Web Client ID from Step 1a
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

---

## 📱 App Configuration

### Update `app.json`

Add the redirect scheme:

```json
{
  "expo": {
    "scheme": "recruitflow",
    "ios": {
      "bundleIdentifier": "com.yourcompany.recruitflow"
    },
    "android": {
      "package": "com.yourcompany.recruitflow"
    }
  }
}
```

---

## 🧪 Testing the Integration

### 1. **Start the Development Server**
```bash
npx expo start
```

### 2. **Navigate to Settings**
- Open the app
- Tap the settings icon (⚙️) in the top right
- Tap "Connect Google Account"

### 3. **Complete OAuth Flow**
- Browser will open with Google sign-in
- Select your Google account
- Grant the requested permissions
- You'll be redirected back to the app

### 4. **Verify Connection**
- Settings screen should show "Connected: your-email@gmail.com"
- User metadata in Supabase should have `google_connected: true`

---

## 🔐 Security Best Practices

### ✅ What We're Doing Right:
1. **Secure Storage** - Using Expo SecureStore (encrypted on device)
2. **PKCE Flow** - Proof Key for Code Exchange (no client secret needed)
3. **Offline Access** - Refresh tokens for long-term access
4. **Automatic Refresh** - Tokens refresh before expiry
5. **Scoped Permissions** - Only requesting what we need

### ⚠️ Important Notes:
- **Never commit** `.env` file to git
- **Refresh tokens** are stored securely and never exposed
- **Access tokens** expire after 1 hour (automatically refreshed)
- **User can disconnect** anytime from settings

---

## 🚀 Using the Google APIs

### Example: Fetching Calendars

```typescript
import { googleAuthService } from '@/services/googleAuthService';

async function fetchUserCalendars() {
  try {
    const response = await googleAuthService.makeAuthenticatedRequest(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList'
    );

    if (response.ok) {
      const data = await response.json();
      return data.items; // Array of calendars
    }
  } catch (error) {
    console.error('Error fetching calendars:', error);
  }
}
```

### Example: Creating a Calendar Event

```typescript
async function createCalendarEvent(eventData: any) {
  try {
    const response = await googleAuthService.makeAuthenticatedRequest(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        body: JSON.stringify(eventData),
      }
    );

    if (response.ok) {
      const event = await response.json();
      return event;
    }
  } catch (error) {
    console.error('Error creating event:', error);
  }
}
```

### Example: Sending an Email via Gmail

```typescript
async function sendEmail(to: string, subject: string, body: string) {
  try {
    // Create the email in RFC 2822 format
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n');

    // Base64 encode
    const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_');

    const response = await googleAuthService.makeAuthenticatedRequest(
      'https://www.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        body: JSON.stringify({
          raw: encodedEmail
        }),
      }
    );

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
```

---

## 🐛 Troubleshooting

### "Unable to resolve expo-auth-session"
```bash
npx expo install expo-auth-session expo-secure-store expo-web-browser expo-crypto
```

### "Redirect URI mismatch"
- Check that the redirect URI in Google Console matches exactly
- Format: `https://auth.expo.io/@your-username/your-app-slug`
- Get your username from: https://expo.dev/accounts/[username]

### "Access denied" or "Invalid scope"
- Ensure all APIs are enabled in Google Cloud Console
- Check OAuth consent screen has all required scopes
- Add your email as a test user

### "Token expired"
- The service automatically refreshes tokens
- If refresh fails, user needs to reconnect

---

## 📋 Next Steps

### 1. **Update Existing Services**
Now that users can connect their Google accounts, update these services:

- ✅ `calendarService.ts` - Use user's access token
- ✅ `tasksService.ts` - Use user's access token
- ✅ `communicationService.ts` - Send emails from user's Gmail

### 2. **Add Calendar Sync**
- Fetch user's calendars
- Display upcoming interviews
- Create interview events

### 3. **Add Task Sync**
- Sync tasks with Google Tasks
- Two-way synchronization
- Real-time updates

### 4. **Add Email Integration**
- Send emails from user's Gmail
- Track email opens (if using tracking pixels)
- Email templates

---

## 🎉 Success Criteria

You'll know it's working when:
- ✅ User can connect Google account from settings
- ✅ Connection status shows in settings
- ✅ Tokens are stored securely
- ✅ API calls work with user's token
- ✅ Tokens refresh automatically
- ✅ User can disconnect anytime

---

## 📚 Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [Google Tasks API](https://developers.google.com/tasks/reference/rest)
- [Gmail API](https://developers.google.com/gmail/api/reference/rest)
