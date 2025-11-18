import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { BrandColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
}

interface GoogleConnectButtonProps {
  onSuccess?: (userInfo: GoogleUserInfo) => void;
  onError?: (error: Error) => void;
  buttonText?: string;
}

export function GoogleConnectButton({ 
  onSuccess, 
  onError,
  buttonText = "Connect Google Account"
}: GoogleConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);

  // Check if already connected
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.app_metadata.provider === 'google') {
      setIsConnected(true);
      setUserInfo({
        email: user.email || '',
        name: user.user_metadata.full_name || user.user_metadata.name || '',
        picture: user.user_metadata.avatar_url || user.user_metadata.picture,
      });
    }
  };

  const handleConnect = async () => {
    if (isConnected) {
      // Already connected, show info
      Alert.alert(
        'Google Connected',
        `Connected as ${userInfo?.name || userInfo?.email}`,
        [
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: handleDisconnect,
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = makeRedirectUri({
        scheme: 'recruitflowproject',
        path: 'auth/callback',
      });

      console.log('🔄 Starting Google OAuth with Supabase...');
      console.log('📍 Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
        },
      });

      if (error) {
        throw error;
      }

      console.log('✅ OAuth initiated successfully');
      
      // The auth session will be handled by the deep link
      // Check connection after a delay
      setTimeout(async () => {
        await checkConnection();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const info: GoogleUserInfo = {
            email: user.email || '',
            name: user.user_metadata.full_name || user.user_metadata.name || '',
            picture: user.user_metadata.avatar_url || user.user_metadata.picture,
          };
          setUserInfo(info);
          setIsConnected(true);
          onSuccess?.(info);
          Alert.alert('Success!', `Signed in as ${info.name}`);
        }
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('❌ Error with Google OAuth:', error);
      Alert.alert('Error', 'Failed to start Google authentication');
      onError?.(error as Error);
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await supabase.auth.signOut();
      
      setIsConnected(false);
      setUserInfo(null);
      
      Alert.alert('Disconnected', 'Google account has been disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
      Alert.alert('Error', 'Failed to disconnect Google account');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isConnected && styles.buttonConnected,
        loading && styles.buttonDisabled,
      ]}
      onPress={handleConnect}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={BrandColors.white} />
      ) : (
        <>
          <Ionicons
            name={isConnected ? 'checkmark-circle' : 'logo-google'}
            size={24}
            color={BrandColors.white}
          />
          <Text style={styles.buttonText}>
            {isConnected
              ? `Connected: ${userInfo?.email || 'Google'}`
              : buttonText}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4', // Google Blue
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonConnected: {
    backgroundColor: '#34A853', // Google Green
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
