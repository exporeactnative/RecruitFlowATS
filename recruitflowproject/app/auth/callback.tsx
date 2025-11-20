import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { BrandColors } from '@/constants/theme';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          router.replace('/auth/login');
          return;
        }

        if (session) {
          console.log('✅ Auth successful, redirecting to home...');
          router.replace('/(tabs)/home');
        } else {
          console.log('❌ No session found, redirecting to login...');
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.replace('/auth/login');
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={BrandColors.teal[500]} />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: BrandColors.gray[600],
  },
});
