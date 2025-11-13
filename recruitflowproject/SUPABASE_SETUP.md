# Supabase Setup Guide for RecruitFlow

## Project Information
- **Supabase Project URL**: https://supabase.com/dashboard/project/khnranbpqbyszakbfavb
- **Project ID**: khnranbpqbyszakbfavb

## Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard/project/khnranbpqbyszakbfavb/settings/api
2. Copy the following values:
   - **Project URL**: `https://khnranbpqbyszakbfavb.supabase.co`
   - **Anon/Public Key**: Found under "Project API keys" → "anon public"

### 2. Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace `your_anon_key_here` with your actual Supabase anon key:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://khnranbpqbyszakbfavb.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

### 3. Install Dependencies

Run the following command to install all required packages:
```bash
npm install
```

### 4. Using Supabase in Your App

Import the Supabase client in any file:
```typescript
import { supabase } from '@/lib/supabase';

// Example: Fetch data
const { data, error } = await supabase
  .from('your_table')
  .select('*');

// Example: Insert data
const { data, error } = await supabase
  .from('your_table')
  .insert({ column: 'value' });

// Example: Authentication
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

## Next Steps

1. **Create Database Tables**: Go to https://supabase.com/dashboard/project/khnranbpqbyszakbfavb/editor to create your database schema
2. **Set Up Authentication**: Configure auth providers at https://supabase.com/dashboard/project/khnranbpqbyszakbfavb/auth/providers
3. **Configure Storage**: Set up file storage at https://supabase.com/dashboard/project/khnranbpqbyszakbfavb/storage/buckets
4. **Set Row Level Security (RLS)**: Secure your tables with RLS policies

## Important Security Notes

- ✅ The `.env` file is already added to `.gitignore` to protect your credentials
- ✅ Never commit your `.env` file to version control
- ✅ Use `.env.example` as a template for other developers
- ✅ The anon key is safe to use in client-side code (it's public)
- ⚠️ Never expose your service_role key in client-side code

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [React Native with Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
