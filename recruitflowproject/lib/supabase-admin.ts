import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/**
 * ⚠️ ADMIN CLIENT - USE WITH EXTREME CAUTION ⚠️
 * 
 * This client uses the service_role key which bypasses ALL Row Level Security (RLS) policies.
 * 
 * ONLY use this for:
 * - Server-side operations (API routes, backend services)
 * - Administrative tasks that require elevated permissions
 * - Operations that need to bypass RLS temporarily
 * 
 * NEVER use this in:
 * - Client-side React Native components
 * - Any code that runs in the mobile app
 * - Public-facing code
 * 
 * For normal operations, use the regular client from './supabase.ts'
 */

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Example usage (SERVER-SIDE ONLY):
 * 
 * // Bypass RLS to perform admin operations
 * const { data, error } = await supabaseAdmin
 *   .from('users')
 *   .update({ role: 'admin' })
 *   .eq('id', userId);
 */
